import { Difficulty, GameMode, UserStats, Question, Language } from '../types/quiz.js';

export const DIFFICULTY_BASE_POINTS: Record<Difficulty, number> = {
  easy: 100,
  medium: 150,
  hard: 200,
};

export const LEVEL_TITLES: { minLevel: number; title: string }[] = [
  { minLevel: 1, title: 'Trivia Rookie' },
  { minLevel: 3, title: 'GK Explorer' },
  { minLevel: 5, title: 'Knowledge Hunter' },
  { minLevel: 8, title: 'Scholar' },
  { minLevel: 12, title: 'Trivia Maestro' },
  { minLevel: 16, title: 'OG Brainiac' },
  { minLevel: 20, title: 'Grandmaster of GK' },
  { minLevel: 25, title: 'Living Encyclopedia' },
];

/**
 * Returns the combo streak score multiplier.
 */
export function getStreakMultiplier(streak: number): number {
  if (streak <= 1) return 1.0;
  if (streak <= 3) return 1.25;
  if (streak <= 5) return 1.5;
  if (streak <= 7) return 2.0;
  return 2.5; // High-fire streak!
}

/**
 * Calculates points earned for a correct answer based on speed, streak, and difficulty.
 */
export function calculateAnswerPoints(
  difficulty: Difficulty,
  timeRemainingSeconds: number,
  totalTimeSeconds: number,
  streak: number
): number {
  const base = DIFFICULTY_BASE_POINTS[difficulty] || 100;
  const clampedTime = Math.max(0, Math.min(timeRemainingSeconds, totalTimeSeconds));
  const timeRatio = totalTimeSeconds > 0 ? clampedTime / totalTimeSeconds : 0;
  const speedBonus = Math.round(50 * timeRatio);
  const multiplier = getStreakMultiplier(streak);

  return Math.round((base + speedBonus) * multiplier);
}

/**
 * Calculates 0 to 3 stars based on percentage correct.
 */
export function calculateStars(correct: number, total: number): number {
  if (total <= 0) return 0;
  const ratio = correct / total;
  if (ratio >= 0.9) return 3;
  if (ratio >= 0.7) return 2;
  if (ratio >= 0.5) return 1;
  return 0;
}

/**
 * Calculates XP and Coin rewards at round finish.
 */
export function calculateRoundRewards(
  score: number,
  correct: number,
  total: number,
  mode: GameMode
) {
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  let xp = Math.round(score * 0.4) + correct * 15;
  let coins = Math.round(score * 0.1) + correct * 5;

  if (accuracy === 100) {
    xp += 50;
    coins += 25; // Perfect round bonus!
  }

  if (mode === 'blitz') {
    coins = Math.round(coins * 1.2);
  }

  return {
    xp: Math.max(10, xp),
    coins: Math.max(5, coins),
  };
}

/**
 * Calculates level from accumulated XP.
 * Formula: Level N requires N * 250 XP.
 */
export function calculateLevelInfo(totalXp: number) {
  let level = 1;
  let xpThreshold = 250;
  let remainingXp = Math.max(0, totalXp);

  while (remainingXp >= xpThreshold) {
    remainingXp -= xpThreshold;
    level++;
    xpThreshold = level * 250;
  }

  const currentLevelProgressXp = remainingXp;
  const currentLevelRequiredXp = xpThreshold;
  const progressPercent = Math.min(100, Math.round((currentLevelProgressXp / currentLevelRequiredXp) * 100));

  return {
    level,
    currentLevelProgressXp,
    currentLevelRequiredXp,
    progressPercent,
  };
}

/**
 * Returns rank title for a given level.
 */
export function getRankTitle(level: number): string {
  let title = 'Trivia Rookie';
  for (const item of LEVEL_TITLES) {
    if (level >= item.minLevel) {
      title = item.title;
    }
  }
  return title;
}

/**
 * 50:50 Lifeline logic: returns two random incorrect option indices to hide.
 */
export function getFiftyFiftyHiddenIndices(
  correctIndex: number,
  totalOptions = 4,
  rng: () => number = Math.random
): number[] {
  const wrongIndices: number[] = [];
  for (let i = 0; i < totalOptions; i++) {
    if (i !== correctIndex) {
      wrongIndices.push(i);
    }
  }

  // Shuffle wrong indices
  for (let i = wrongIndices.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [wrongIndices[i], wrongIndices[j]] = [wrongIndices[j], wrongIndices[i]];
  }

  // Pick first 2
  return wrongIndices.slice(0, 2);
}

/**
 * Checks and updates daily streak.
 */
export function evaluateDailyStreak(
  lastPlayedDate: string | null,
  currentDateStr: string
): { updatedStreak: number; streakMaintained: boolean } {
  if (!lastPlayedDate) {
    return { updatedStreak: 1, streakMaintained: true };
  }

  if (lastPlayedDate === currentDateStr) {
    // Already played today
    return { updatedStreak: 1, streakMaintained: true };
  }

  const lastDate = new Date(lastPlayedDate);
  const curDate = new Date(currentDateStr);
  const diffTime = curDate.getTime() - lastDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

  if (diffDays === 1) {
    // Consecutive day
    return { updatedStreak: 1, streakMaintained: true }; // caller increments existing streak
  } else if (diffDays > 1) {
    // Streak broken
    return { updatedStreak: 1, streakMaintained: false };
  }

  return { updatedStreak: 1, streakMaintained: true };
}

import { DailyMission } from '../types/quiz.js';

/**
 * Generates the day's standard 3 missions.
 */
export function generateDailyMissions(dateStr: string): DailyMission[] {
  return [
    {
      id: `daily_${dateStr}_categories`,
      type: 'play_categories',
      title: 'Topic Explorer',
      titleHi: 'विषय अन्वेषक',
      description: 'Play quizzes in 3 different categories today',
      descriptionHi: 'आज 3 अलग-अलग श्रेणियों में क्विज़ खेलें',
      rewardCoins: 75,
      progress: 0,
      target: 3,
      completed: false,
      claimed: false,
      icon: 'Compass',
      unit: 'topics',
      trackedCategories: [],
    },
    {
      id: `daily_${dateStr}_accuracy`,
      type: 'accuracy',
      title: 'Sharpshooter',
      titleHi: 'सटीक निशानेबाज',
      description: 'Achieve 80% or higher accuracy in any quiz',
      descriptionHi: 'किसी भी क्विज़ में 80% या अधिक सटीकता प्राप्त करें',
      rewardCoins: 80,
      progress: 0,
      target: 80,
      completed: false,
      claimed: false,
      icon: 'Target',
      unit: '%',
    },
    {
      id: `daily_${dateStr}_streak`,
      type: 'streak',
      title: 'Streak Ignition',
      titleHi: 'स्ट्रीक प्रज्वलन',
      description: 'Chain a 5-answer streak combo in a quiz',
      descriptionHi: 'किसी क्विज़ में लगातार 5 सही उत्तर दें',
      rewardCoins: 60,
      progress: 0,
      target: 5,
      completed: false,
      claimed: false,
      icon: 'Flame',
      unit: 'streak',
    },
  ];
}

/**
 * Updates daily missions based on a completed quiz round.
 */
export function updateMissionsWithQuizResult(
  missions: DailyMission[],
  result: {
    category?: string;
    accuracy: number;
    maxStreak: number;
    lifelinesUsed?: number;
  }
): { updatedMissions: DailyMission[]; newlyCompletedCount: number } {
  let newlyCompletedCount = 0;

  const updatedMissions = missions.map((mission) => {
    if (mission.completed) return mission;

    let nextProgress = mission.progress;
    let nextTrackedCategories = mission.trackedCategories ? [...mission.trackedCategories] : [];

    if (mission.type === 'play_categories') {
      const cat = result.category || 'mixed';
      if (!nextTrackedCategories.includes(cat)) {
        nextTrackedCategories.push(cat);
      }
      nextProgress = nextTrackedCategories.length;
    } else if (mission.type === 'accuracy') {
      nextProgress = Math.max(nextProgress, result.accuracy);
    } else if (mission.type === 'streak') {
      nextProgress = Math.max(nextProgress, result.maxStreak);
    } else if (mission.type === 'play_quizzes') {
      nextProgress = nextProgress + 1;
    }

    const isNowCompleted = nextProgress >= mission.target;
    if (isNowCompleted && !mission.completed) {
      newlyCompletedCount++;
    }

    return {
      ...mission,
      progress: Math.min(nextProgress, mission.target),
      completed: isNowCompleted,
      trackedCategories: nextTrackedCategories,
    };
  });

  return { updatedMissions, newlyCompletedCount };
}

/**
 * Claims a completed mission reward.
 */
export function claimDailyMission(
  missions: DailyMission[],
  missionId: string
): { updatedMissions: DailyMission[]; rewardCoins: number } {
  let rewardCoins = 0;

  const updatedMissions = missions.map((mission) => {
    if (mission.id === missionId && mission.completed && !mission.claimed) {
      rewardCoins = mission.rewardCoins;
      return { ...mission, claimed: true };
    }
    return mission;
  });

  return { updatedMissions, rewardCoins };
}

/**
 * Returns question text, options, hint and explanation in the selected language.
 */
export function getLocalizedQuestion(q: Question, lang: Language): Question {
  if (lang === 'hi' && q.questionHi && q.optionsHi) {
    return {
      ...q,
      question: q.questionHi,
      options: q.optionsHi,
      explanation: q.explanationHi || q.explanation,
      hint: q.hintHi || q.hint,
    };
  }
  return q;
}


