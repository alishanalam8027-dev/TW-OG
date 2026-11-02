import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AndroidFrame } from './components/AndroidFrame.js';
import { TopBar } from './components/TopBar.js';
import { BottomNav, TabType } from './components/BottomNav.js';
import { HomeDashboard } from './components/HomeDashboard.js';
import { CampaignView, CAMPAIGN_STAGES } from './components/CampaignView.js';
import { CategoriesView } from './components/CategoriesView.js';
import { MistakesNotebook } from './components/MistakesNotebook.js';
import { AchievementsView } from './components/AchievementsView.js';
import { QuizScreen } from './components/QuizScreen.js';
import { ResultScreen } from './components/ResultScreen.js';
import { ReviewModal } from './components/ReviewModal.js';
import { SettingsModal } from './components/SettingsModal.js';
import { GK_QUESTIONS } from './data/gkQuestions.js';
import {
  GameMode,
  Category,
  Question,
  QuizSessionResult,
  UserStats,
  AppSettings,
  UserAnswerRecord,
  DailyMission,
} from './types/quiz.js';
import {
  loadUserStats,
  saveUserStats,
  loadAppSettings,
  saveAppSettings,
  loadMistakesNotebook,
  removeMistakeFromNotebook,
  loadDailyMissions,
  saveDailyMissions,
  DEFAULT_STATS,
} from './utils/storage.js';
import {
  evaluateDailyStreak,
  calculateLevelInfo,
  updateMissionsWithQuizResult,
  claimDailyMission,
} from './game/quizRules.js';

type AppState = 'dashboard' | 'quiz' | 'result';

export default function App() {
  const [appState, setAppState] = useState<AppState>('dashboard');
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [stats, setStats] = useState<UserStats>(loadUserStats);
  const [settings, setSettings] = useState<AppSettings>(loadAppSettings);
  const [mistakes, setMistakes] = useState<UserAnswerRecord[]>(loadMistakesNotebook);
  const [missions, setMissions] = useState<DailyMission[]>(() => loadDailyMissions(todayStr));

  // Active quiz session states
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [activeQuizMode, setActiveQuizMode] = useState<GameMode>('blitz');
  const [activeCategory, setActiveCategory] = useState<Category | undefined>(undefined);
  const [activeCampaignStage, setActiveCampaignStage] = useState<number | undefined>(undefined);
  const [lastResult, setLastResult] = useState<QuizSessionResult | null>(null);

  // Modals
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Set document.body.dataset.state for Ultra Mode state tracking
  useEffect(() => {
    if (appState === 'quiz') {
      document.body.dataset.state = 'playing';
    } else if (appState === 'result') {
      document.body.dataset.state = 'gameover';
    } else {
      document.body.dataset.state = 'title';
    }
    // Always sync mistakes notebook on state transitions
    setMistakes(loadMistakesNotebook());
  }, [appState, activeTab]);

  // Check and update daily streak on initial boot
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const { updatedStreak, streakMaintained } = evaluateDailyStreak(stats.lastPlayedDate, todayStr);
    if (!streakMaintained) {
      setStats((prev) => {
        const next = { ...prev, dailyStreak: 1 };
        saveUserStats(next);
        return next;
      });
    }
  }, []);

  // Update body background according to theme
  useEffect(() => {
    saveAppSettings(settings);
  }, [settings]);

  // Helper to shuffle questions
  const shuffleQuestions = (list: Question[], count: number): Question[] => {
    const copy = [...list];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, count);
  };

  // Launch a new Quiz Round
  const startQuiz = useCallback(
    (mode: GameMode, categoryId?: string, stageNum?: number) => {
      let pool = [...GK_QUESTIONS];
      let questionsCount = 10;

      if (mode === 'category' && categoryId) {
        pool = GK_QUESTIONS.filter((q) => q.category === categoryId);
        questionsCount = Math.min(10, pool.length);
      } else if (mode === 'campaign' && stageNum) {
        const stageConfig = CAMPAIGN_STAGES.find((s) => s.stage === stageNum);
        questionsCount = stageConfig ? stageConfig.questionsCount : 8;

        // Filter based on stage difficulty if appropriate
        if (stageNum <= 3) {
          pool = GK_QUESTIONS.filter((q) => q.difficulty === 'easy' || q.difficulty === 'medium');
        } else if (stageNum >= 7) {
          pool = GK_QUESTIONS.filter((q) => q.difficulty === 'medium' || q.difficulty === 'hard');
        }
      } else if (mode === 'blitz') {
        questionsCount = 10;
      } else if (mode === 'classic') {
        questionsCount = 15;
      } else if (mode === 'mistakes') {
        const currentMistakes = loadMistakesNotebook();
        if (currentMistakes.length > 0) {
          // Map mistakes to question objects
          pool = currentMistakes.map((m) => {
            const found = GK_QUESTIONS.find((q) => q.id === m.questionId);
            if (found) return found;
            return {
              id: m.questionId,
              question: m.questionText,
              options: m.options,
              correctIndex: m.correctIndex,
              category: 'mixed' as Category,
              difficulty: 'medium' as const,
              explanation: m.explanation,
              hint: 'Carefully consider the original facts.',
            };
          });
          questionsCount = pool.length;
        }
      }

      const selected = shuffleQuestions(pool, questionsCount);
      setActiveQuestions(selected.length > 0 ? selected : GK_QUESTIONS.slice(0, 10));
      setActiveQuizMode(mode);
      setActiveCategory(categoryId as Category | undefined);
      setActiveCampaignStage(stageNum);
      setAppState('quiz');
    },
    []
  );

  // Check ?autostart=1 query parameter to jump straight to quiz for testability
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1') {
        startQuiz('blitz');
      }
    }
  }, [startQuiz]);

  // Handle quiz session completion
  const handleFinishQuiz = useCallback(
    (result: QuizSessionResult) => {
      setLastResult(result);
      setAppState('result');

      // Update user stats
      const todayStr = new Date().toISOString().split('T')[0];
      setStats((prev) => {
        const nextXp = prev.xp + result.xpEarned;
        const nextCoins = prev.coins + result.coinsEarned;
        const nextTotalGames = prev.totalGames + 1;
        const nextTotalCorrect = prev.totalCorrect + result.correctCount;
        const nextTotalAnswered = prev.totalAnswered + result.totalQuestions;
        const nextHighestScore = Math.max(prev.highestScore, result.score);

        // Update campaign progress if in campaign mode and earned >= 1 star
        let nextUnlockedStage = prev.unlockedCampaignStage;
        const nextCampaignStars = { ...prev.campaignStars };

        if (activeQuizMode === 'campaign' && activeCampaignStage) {
          const prevStars = nextCampaignStars[activeCampaignStage] || 0;
          if (result.stars > prevStars) {
            nextCampaignStars[activeCampaignStage] = result.stars;
          }
          if (result.stars >= 1 && activeCampaignStage >= prev.unlockedCampaignStage) {
            nextUnlockedStage = Math.min(10, activeCampaignStage + 1);
          }
        }

        // Check unlockable achievements
        const nextAchievements = [...(prev.unlockedAchievements || [])];
        const unlock = (id: string) => {
          if (!nextAchievements.includes(id)) {
            nextAchievements.push(id);
          }
        };

        // First quiz
        unlock('first_quiz');
        if (result.maxStreak >= 5) unlock('streak_five');
        if (result.maxStreak >= 10) unlock('streak_ten');
        if (result.accuracy === 100 && result.totalQuestions >= 8) unlock('perfect_round');
        if (nextUnlockedStage >= 6) unlock('campaign_stage5');
        const levelInfo = calculateLevelInfo(nextXp);
        if (levelInfo.level >= 10) unlock('grandmaster');

        const updated: UserStats = {
          ...prev,
          xp: nextXp,
          coins: nextCoins,
          totalGames: nextTotalGames,
          totalCorrect: nextTotalCorrect,
          totalAnswered: nextTotalAnswered,
          highestScore: nextHighestScore,
          unlockedCampaignStage: nextUnlockedStage,
          campaignStars: nextCampaignStars,
          unlockedAchievements: nextAchievements,
          lastPlayedDate: todayStr,
        };

        saveUserStats(updated);
        return updated;
      });

      // Refresh mistakes list
      setMistakes(loadMistakesNotebook());

      // Update Daily Missions progress
      setMissions((currentMissions) => {
        const { updatedMissions } = updateMissionsWithQuizResult(currentMissions, {
          category: activeCategory,
          accuracy: result.accuracy,
          maxStreak: result.maxStreak,
        });
        saveDailyMissions(todayStr, updatedMissions);
        return updatedMissions;
      });
    },
    [activeQuizMode, activeCampaignStage, activeCategory, todayStr]
  );

  // Claim Daily Mission Reward
  const handleClaimMission = useCallback(
    (missionId: string) => {
      setMissions((currentMissions) => {
        const { updatedMissions, rewardCoins } = claimDailyMission(currentMissions, missionId);
        if (rewardCoins > 0) {
          saveDailyMissions(todayStr, updatedMissions);
          setStats((prev) => {
            const next = { ...prev, coins: prev.coins + rewardCoins };
            saveUserStats(next);
            return next;
          });
        }
        return updatedMissions;
      });
    },
    [todayStr]
  );

  // Remove mistake item
  const handleRemoveMistake = (id: string) => {
    removeMistakeFromNotebook(id);
    setMistakes(loadMistakesNotebook());
  };

  // Reset all user data
  const handleResetAllData = () => {
    saveUserStats(DEFAULT_STATS);
    setStats(DEFAULT_STATS);
    localStorage.removeItem('tw_og_gk_mistakes_notebook');
    setMistakes([]);
  };

  return (
    <AndroidFrame
      isFrameActive={settings.phoneFrame}
      onToggleFrame={() => setSettings((s) => ({ ...s, phoneFrame: !s.phoneFrame }))}
    >
      {/* Top Bar */}
      <TopBar
        title="TW OG GK"
        subtitle={
          appState === 'quiz'
            ? activeQuizMode === 'campaign'
              ? `${settings.language === 'hi' ? 'अभियान स्तर' : 'Campaign Stage'} ${activeCampaignStage}`
              : activeQuizMode === 'category'
              ? `${activeCategory} Quiz`
              : settings.language === 'hi'
              ? 'दैनिक ब्लिट्ज़'
              : 'Blitz Challenge'
            : undefined
        }
        showBack={appState !== 'dashboard'}
        onBack={() => setAppState('dashboard')}
        streak={stats.dailyStreak}
        coins={stats.coins}
        soundEnabled={settings.soundEnabled}
        onToggleSound={() => setSettings((s) => ({ ...s, soundEnabled: !s.soundEnabled }))}
        onOpenSettings={() => setShowSettingsModal(true)}
        language={settings.language}
        onToggleLanguage={() =>
          setSettings((s) => ({ ...s, language: s.language === 'hi' ? 'en' : 'hi' }))
        }
        hapticsEnabled={settings.hapticsEnabled}
      />

      {/* Main View Area */}
      <main className="flex-1 min-h-0 flex flex-col overflow-hidden relative">
        {appState === 'quiz' ? (
          <QuizScreen
            questions={activeQuestions}
            mode={activeQuizMode}
            category={activeCategory}
            totalTimePerQuestion={settings.timerDuration}
            soundEnabled={settings.soundEnabled}
            hapticsEnabled={settings.hapticsEnabled}
            language={settings.language}
            onFinishQuiz={handleFinishQuiz}
            onExitQuiz={() => setAppState('dashboard')}
          />
        ) : appState === 'result' && lastResult ? (
          <ResultScreen
            result={lastResult}
            soundEnabled={settings.soundEnabled}
            hapticsEnabled={settings.hapticsEnabled}
            language={settings.language}
            onPlayAgain={() => startQuiz(activeQuizMode, activeCategory, activeCampaignStage)}
            onHome={() => setAppState('dashboard')}
            onOpenReview={() => setShowReviewModal(true)}
          />
        ) : (
          <>
            {activeTab === 'home' && (
              <HomeDashboard
                stats={stats}
                missions={missions}
                onClaimMission={handleClaimMission}
                mistakesCount={mistakes.length}
                onStartQuiz={(mode, cat) => startQuiz(mode, cat)}
                onNavigateTab={(tab) => setActiveTab(tab)}
                hapticsEnabled={settings.hapticsEnabled}
                soundEnabled={settings.soundEnabled}
                language={settings.language}
              />
            )}

            {activeTab === 'campaign' && (
              <CampaignView
                stats={stats}
                onStartCampaignStage={(stage) => startQuiz('campaign', undefined, stage)}
                hapticsEnabled={settings.hapticsEnabled}
                language={settings.language}
              />
            )}

            {activeTab === 'categories' && (
              <CategoriesView
                onSelectCategory={(cat) => startQuiz('category', cat)}
                hapticsEnabled={settings.hapticsEnabled}
                language={settings.language}
              />
            )}

            {activeTab === 'notebook' && (
              <MistakesNotebook
                mistakes={mistakes}
                onStartMistakesQuiz={() => startQuiz('mistakes')}
                onRemoveMistake={handleRemoveMistake}
                hapticsEnabled={settings.hapticsEnabled}
                language={settings.language}
              />
            )}

            {activeTab === 'profile' && (
              <AchievementsView stats={stats} language={settings.language} />
            )}
          </>
        )}

        {/* Review Modal */}
        {showReviewModal && lastResult && (
          <ReviewModal
            answers={lastResult.answers}
            onClose={() => setShowReviewModal(false)}
            language={settings.language}
          />
        )}

        {/* Settings Modal */}
        {showSettingsModal && (
          <SettingsModal
            settings={settings}
            onUpdateSettings={(newSettings) => setSettings((s) => ({ ...s, ...newSettings }))}
            onResetAllData={handleResetAllData}
            onClose={() => setShowSettingsModal(false)}
          />
        )}
      </main>

      {/* Android Bottom Navigation */}
      {appState === 'dashboard' && (
        <BottomNav
          currentTab={activeTab}
          onChangeTab={(tab) => setActiveTab(tab)}
          mistakesCount={mistakes.length}
          hapticsEnabled={settings.hapticsEnabled}
          language={settings.language}
        />
      )}
    </AndroidFrame>
  );
}
