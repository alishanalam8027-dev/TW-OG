export type Difficulty = 'easy' | 'medium' | 'hard';

export type Category =
  | 'history'
  | 'science'
  | 'geography'
  | 'tech'
  | 'sports'
  | 'popculture'
  | 'mixed';

export type Language = 'hi' | 'en';

export interface Question {
  id: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  category: Category;
  difficulty: Difficulty;
  explanation: string;
  hint: string;
  // Hindi localized fields
  questionHi?: string;
  optionsHi?: [string, string, string, string];
  explanationHi?: string;
  hintHi?: string;
}

export type GameMode =
  | 'blitz'       // 10 quick fire questions, daily challenge
  | 'classic'     // 15 general knowledge standard
  | 'campaign'    // stage-by-stage progression (Level 1-10)
  | 'category'    // targeted deep dive
  | 'mistakes'    // review & conquer notebook
  | 'custom';     // user/AI generated quiz

export type LifelineType = 'fiftyFifty' | 'hint' | 'timeFreeze' | 'skip';

export interface LifelineState {
  fiftyFifty: number;
  hint: number;
  timeFreeze: number;
  skip: number;
}

export interface QuizRoundConfig {
  mode: GameMode;
  category?: Category;
  stageLevel?: number;
  timePerQuestion: number;
  totalQuestions: number;
}

export interface UserAnswerRecord {
  questionId: string;
  questionText: string;
  options: [string, string, string, string];
  correctIndex: number;
  selectedIndex: number | null;
  isCorrect: boolean;
  timeSpent: number;
  scoreEarned: number;
  explanation: string;
}

export interface QuizSessionResult {
  mode: GameMode;
  score: number;
  totalQuestions: number;
  correctCount: number;
  accuracy: number;
  maxStreak: number;
  timeSpentSeconds: number;
  xpEarned: number;
  coinsEarned: number;
  stars: number;
  answers: UserAnswerRecord[];
}

export interface UserStats {
  xp: number;
  level: number;
  coins: number;
  dailyStreak: number;
  lastPlayedDate: string | null;
  totalGames: number;
  totalCorrect: number;
  totalAnswered: number;
  highestScore: number;
  unlockedCampaignStage: number;
  campaignStars: Record<number, number>;
  unlockedAchievements: string[];
}

export interface Achievement {
  id: string;
  title: string;
  titleHi?: string;
  description: string;
  descriptionHi?: string;
  icon: string;
  rewardCoins: number;
  conditionType: 'games' | 'correct' | 'streak' | 'accuracy' | 'campaign' | 'coins';
  targetValue: number;
}

export interface AppSettings {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  timerDuration: number; // in seconds, default 20
  theme: 'slate' | 'oled' | 'emerald';
  phoneFrame: boolean;
  language: Language;
}

export type MissionType =
  | 'play_categories'
  | 'accuracy'
  | 'play_quizzes'
  | 'streak'
  | 'lifelines';

export interface DailyMission {
  id: string;
  type: MissionType;
  title: string;
  titleHi?: string;
  description: string;
  descriptionHi?: string;
  rewardCoins: number;
  progress: number;
  target: number;
  completed: boolean;
  claimed: boolean;
  icon: string;
  unit?: string;
  trackedCategories?: string[]; // for tracking distinct categories played
}

export interface DailyMissionsState {
  date: string;
  missions: DailyMission[];
}
