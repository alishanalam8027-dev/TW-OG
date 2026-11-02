import { AppSettings, UserAnswerRecord, UserStats } from '../types/quiz.js';

const STATS_KEY = 'tw_og_gk_user_stats';
const SETTINGS_KEY = 'tw_og_gk_app_settings';
const MISTAKES_KEY = 'tw_og_gk_mistakes_notebook';

export const DEFAULT_STATS: UserStats = {
  xp: 0,
  level: 1,
  coins: 150, // Welcome gift of coins for lifelines!
  dailyStreak: 1,
  lastPlayedDate: null,
  totalGames: 0,
  totalCorrect: 0,
  totalAnswered: 0,
  highestScore: 0,
  unlockedCampaignStage: 1,
  campaignStars: {},
  unlockedAchievements: [],
};

export const DEFAULT_SETTINGS: AppSettings = {
  soundEnabled: true,
  hapticsEnabled: true,
  timerDuration: 20,
  theme: 'slate',
  phoneFrame: false, // Default full responsive view, toggleable to Android Phone Frame
  language: 'hi', // Defaults to Hindi as requested
};

export function loadUserStats(): UserStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (raw) {
      return { ...DEFAULT_STATS, ...JSON.parse(raw) };
    }
  } catch {
    // fallback
  }
  return DEFAULT_STATS;
}

export function saveUserStats(stats: UserStats): void {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {
    // ignore quota errors
  }
}

export function loadAppSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch {
    // fallback
  }
  return DEFAULT_SETTINGS;
}

export function saveAppSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

export function loadMistakesNotebook(): UserAnswerRecord[] {
  try {
    const raw = localStorage.getItem(MISTAKES_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }
  return [];
}

export function saveMistakeToNotebook(answer: UserAnswerRecord): void {
  try {
    const current = loadMistakesNotebook();
    // Prevent duplicate entries for same question
    const filtered = current.filter((item) => item.questionId !== answer.questionId);
    filtered.unshift(answer);
    // Keep max 50 recent mistakes
    const trimmed = filtered.slice(0, 50);
    localStorage.setItem(MISTAKES_KEY, JSON.stringify(trimmed));
  } catch {
    // ignore
  }
}

export function removeMistakeFromNotebook(questionId: string): void {
  try {
    const current = loadMistakesNotebook();
    const updated = current.filter((item) => item.questionId !== questionId);
    localStorage.setItem(MISTAKES_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

import { DailyMission, DailyMissionsState } from '../types/quiz.js';
import { generateDailyMissions } from '../game/quizRules.js';

const MISSIONS_KEY = 'tw_og_gk_daily_missions';

export function loadDailyMissions(currentDateStr: string): DailyMission[] {
  try {
    const raw = localStorage.getItem(MISSIONS_KEY);
    if (raw) {
      const parsed: DailyMissionsState = JSON.parse(raw);
      if (parsed.date === currentDateStr && Array.isArray(parsed.missions) && parsed.missions.length > 0) {
        return parsed.missions;
      }
    }
  } catch {
    // fallback
  }

  // Generate fresh missions for today
  const fresh = generateDailyMissions(currentDateStr);
  saveDailyMissions(currentDateStr, fresh);
  return fresh;
}

export function saveDailyMissions(dateStr: string, missions: DailyMission[]): void {
  try {
    const state: DailyMissionsState = {
      date: dateStr,
      missions,
    };
    localStorage.setItem(MISSIONS_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

