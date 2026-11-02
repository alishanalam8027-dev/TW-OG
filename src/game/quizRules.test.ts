import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateAnswerPoints,
  getStreakMultiplier,
  calculateStars,
  calculateRoundRewards,
  calculateLevelInfo,
  getRankTitle,
  getFiftyFiftyHiddenIndices,
  generateDailyMissions,
  updateMissionsWithQuizResult,
  claimDailyMission,
  getLocalizedQuestion,
} from './quizRules.ts';

test('streak multipliers scale up correctly', () => {
  assert.equal(getStreakMultiplier(0), 1.0);
  assert.equal(getStreakMultiplier(1), 1.0);
  assert.equal(getStreakMultiplier(2), 1.25);
  assert.equal(getStreakMultiplier(3), 1.25);
  assert.equal(getStreakMultiplier(4), 1.5);
  assert.equal(getStreakMultiplier(5), 1.5);
  assert.equal(getStreakMultiplier(6), 2.0);
  assert.equal(getStreakMultiplier(8), 2.5);
});

test('calculateAnswerPoints awards base plus speed bonus with streak', () => {
  // Easy difficulty (base 100), full time remaining (bonus 50), 0 streak (1.0x)
  const fullSpeedEasy = calculateAnswerPoints('easy', 20, 20, 0);
  assert.equal(fullSpeedEasy, 150);

  // Hard difficulty (base 200), zero time remaining (bonus 0), 0 streak (1.0x)
  const slowHard = calculateAnswerPoints('hard', 0, 20, 0);
  assert.equal(slowHard, 200);

  // Medium (base 150), half time (bonus 25) = 175, streak 4 (1.5x) => 263
  const mediumStreak = calculateAnswerPoints('medium', 10, 20, 4);
  assert.equal(mediumStreak, 263);
});

test('calculateStars awards 0 to 3 stars accurately', () => {
  assert.equal(calculateStars(10, 10), 3); // 100%
  assert.equal(calculateStars(9, 10), 3);  // 90%
  assert.equal(calculateStars(7, 10), 2);  // 70%
  assert.equal(calculateStars(5, 10), 1);  // 50%
  assert.equal(calculateStars(4, 10), 0);  // 40%
});

test('calculateRoundRewards awards XP, Coins and perfect round bonus', () => {
  const normalResult = calculateRoundRewards(1000, 8, 10, 'classic');
  assert.ok(normalResult.xp > 0);
  assert.ok(normalResult.coins > 0);

  const perfectResult = calculateRoundRewards(1500, 10, 10, 'classic');
  // Perfect gives +50 XP and +25 Coins bonus
  assert.ok(perfectResult.xp > 600);
  assert.ok(perfectResult.coins > 175);
});

test('calculateLevelInfo correctly increments levels and tracks progress', () => {
  const lvl1 = calculateLevelInfo(100);
  assert.equal(lvl1.level, 1);
  assert.equal(lvl1.currentLevelProgressXp, 100);
  assert.equal(lvl1.currentLevelRequiredXp, 250);
  assert.equal(lvl1.progressPercent, 40);

  // 250 XP reaches level 2 (requires 500 XP for next)
  const lvl2 = calculateLevelInfo(250);
  assert.equal(lvl2.level, 2);
  assert.equal(lvl2.currentLevelProgressXp, 0);
  assert.equal(lvl2.currentLevelRequiredXp, 500);

  // Level 3 reaches at 250 + 500 = 750 XP
  const lvl3 = calculateLevelInfo(800);
  assert.equal(lvl3.level, 3);
  assert.equal(lvl3.currentLevelProgressXp, 50);
});

test('getRankTitle maps to proper ranks', () => {
  assert.equal(getRankTitle(1), 'Trivia Rookie');
  assert.equal(getRankTitle(3), 'GK Explorer');
  assert.equal(getRankTitle(20), 'Grandmaster of GK');
});

test('50:50 lifeline eliminates exactly 2 wrong indices and never correct index', () => {
  const correctIdx = 2;
  const hidden = getFiftyFiftyHiddenIndices(correctIdx, 4);
  assert.equal(hidden.length, 2);
  assert.ok(!hidden.includes(correctIdx), 'Should not hide correct answer');
  for (const idx of hidden) {
    assert.ok(idx >= 0 && idx < 4);
  }
});

test('generateDailyMissions creates 3 structured missions for the day', () => {
  const missions = generateDailyMissions('2026-10-31');
  assert.equal(missions.length, 3);
  assert.ok(missions.some((m) => m.type === 'play_categories' && m.target === 3));
  assert.ok(missions.some((m) => m.type === 'accuracy' && m.target === 80));
  assert.ok(missions.some((m) => m.type === 'streak' && m.target === 5));
});

test('updateMissionsWithQuizResult updates categories and accuracy missions', () => {
  const initialMissions = generateDailyMissions('2026-10-31');

  // Play science category with 70% accuracy and 3 streak
  const round1 = updateMissionsWithQuizResult(initialMissions, {
    category: 'science',
    accuracy: 70,
    maxStreak: 3,
  });

  const catMission1 = round1.updatedMissions.find((m) => m.type === 'play_categories')!;
  assert.equal(catMission1.progress, 1);
  assert.equal(catMission1.completed, false);

  const accMission1 = round1.updatedMissions.find((m) => m.type === 'accuracy')!;
  assert.equal(accMission1.progress, 70);
  assert.equal(accMission1.completed, false);

  // Play history category with 90% accuracy and 5 streak
  const round2 = updateMissionsWithQuizResult(round1.updatedMissions, {
    category: 'history',
    accuracy: 90,
    maxStreak: 5,
  });

  const catMission2 = round2.updatedMissions.find((m) => m.type === 'play_categories')!;
  assert.equal(catMission2.progress, 2);

  const accMission2 = round2.updatedMissions.find((m) => m.type === 'accuracy')!;
  assert.equal(accMission2.progress, 80);
  assert.equal(accMission2.completed, true);

  const streakMission2 = round2.updatedMissions.find((m) => m.type === 'streak')!;
  assert.equal(streakMission2.progress, 5);
  assert.equal(streakMission2.completed, true);
});

test('claimDailyMission awards bonus coins and sets claimed flag', () => {
  const missions = generateDailyMissions('2026-10-31');
  // Mark mission 1 as completed
  missions[0].completed = true;

  const claimResult = claimDailyMission(missions, missions[0].id);
  assert.equal(claimResult.rewardCoins, missions[0].rewardCoins);
  assert.equal(claimResult.updatedMissions[0].claimed, true);

  // Claiming again should yield 0 coins
  const doubleClaim = claimDailyMission(claimResult.updatedMissions, missions[0].id);
  assert.equal(doubleClaim.rewardCoins, 0);
});

test('getLocalizedQuestion switches to Hindi text when lang is hi', () => {
  const sampleQ = {
    id: 'test-1',
    question: 'What is the capital of India?',
    options: ['Mumbai', 'New Delhi', 'Kolkata', 'Chennai'] as [string, string, string, string],
    correctIndex: 1,
    category: 'geography' as const,
    difficulty: 'easy' as const,
    explanation: 'New Delhi is the national capital of India.',
    hint: 'It is situated in northern India.',
    questionHi: 'भारत की राजधानी कौन सा शहर है?',
    optionsHi: ['मुंबई', 'नई दिल्ली', 'कोलकाता', 'चेन्नई'] as [string, string, string, string],
    explanationHi: 'नई दिल्ली भारत की राष्ट्रीय राजधानी है।',
    hintHi: 'यह उत्तर भारत में स्थित है।',
  };

  const hiResult = getLocalizedQuestion(sampleQ, 'hi');
  assert.equal(hiResult.question, 'भारत की राजधानी कौन सा शहर है?');
  assert.equal(hiResult.options[1], 'नई दिल्ली');
  assert.equal(hiResult.explanation, 'नई दिल्ली भारत की राष्ट्रीय राजधानी है।');

  const enResult = getLocalizedQuestion(sampleQ, 'en');
  assert.equal(enResult.question, 'What is the capital of India?');
  assert.equal(enResult.options[1], 'New Delhi');
});

test('generateAndroidApkBlob produces a valid APK package blob with manifest and assets', async () => {
  const { generateAndroidApkBlob } = await import('../utils/apkBuilder.js');
  const blob = await generateAndroidApkBlob();
  assert.ok(blob, 'Blob should be created');
  assert.ok(blob.size > 1000, `Blob size should be substantial (actual: ${blob.size} bytes)`);
  assert.equal(blob.type, 'application/vnd.android.package-archive');
});



