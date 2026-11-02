import React, { useState } from 'react';
import {
  Flame,
  Play,
  Zap,
  Map,
  BookOpen,
  Sparkles,
  Trophy,
  ArrowRight,
  Lightbulb,
} from 'lucide-react';
import { GameMode, UserStats, DailyMission, Language } from '../types/quiz.js';
import { CATEGORIES } from '../data/gkQuestions.js';
import { Haptics } from '../utils/haptics.js';
import { calculateLevelInfo } from '../game/quizRules.js';
import { getRankTitleI18n, TRANSLATIONS } from '../data/translations.js';
import { DailyMissionsCard } from './DailyMissionsCard.js';

interface HomeDashboardProps {
  stats: UserStats;
  missions: DailyMission[];
  onClaimMission: (missionId: string) => void;
  mistakesCount: number;
  onStartQuiz: (mode: GameMode, category?: string) => void;
  onNavigateTab: (tab: 'campaign' | 'categories' | 'notebook' | 'profile') => void;
  hapticsEnabled: boolean;
  soundEnabled: boolean;
  language: Language;
}

const DAILY_GK_FACTS_EN = [
  'The human brain operates on about 12 to 20 watts of electrical power—enough to power a low-wattage LED bulb!',
  'The Eiffel Tower can be 15 cm taller during summer due to thermal expansion of the iron!',
  'Venus is the only planet in the Solar System that rotates clockwise (retrograde rotation)!',
  'Honey never spoils; archaeologists found 3,000-year-old honey in Egyptian tombs that is still edible!',
  'The total length of all blood vessels in an adult human body could wrap around Earth more than twice!',
];

const DAILY_GK_FACTS_HI = [
  'मानव मस्तिष्क लगभग 12 से 20 वाट विद्युत ऊर्जा पर काम करता है—जो एक एलईडी बल्ब जलाने के लिए काफी है!',
  'गर्मियों में लोहे के तापीय प्रसार (Thermal Expansion) के कारण एफिल टॉवर 15 सेमी तक लंबा हो जाता है!',
  'शुक्र (Venus) सौरमंडल का एकमात्र ऐसा ग्रह है जो दक्षिणावर्त (Clockwise) घूमता है!',
  'शहद कभी खराब नहीं होता; मिस्र के पिरामिडों में पाया गया 3,000 साल पुराना शहद आज भी खाने योग्य है!',
  'वयस्क मानव शरीर की सभी रक्त वाहिकाओं को यदि जोड़ दिया जाए, तो वे पृथ्वी को दो बार लपेट सकती हैं!',
];

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  stats,
  missions,
  onClaimMission,
  mistakesCount,
  onStartQuiz,
  onNavigateTab,
  hapticsEnabled,
  soundEnabled,
  language,
}) => {
  const [factIndex] = useState(() => Math.floor(Math.random() * DAILY_GK_FACTS_EN.length));
  const t = TRANSLATIONS[language];
  const levelInfo = calculateLevelInfo(stats.xp);
  const rankTitle = getRankTitleI18n(levelInfo.level, language);
  const currentFact = language === 'hi' ? DAILY_GK_FACTS_HI[factIndex] : DAILY_GK_FACTS_EN[factIndex];

  return (
    <div className="flex-1 min-h-0 p-4 bg-slate-900 overflow-y-auto select-none space-y-4">
      {/* Welcome & Level Banner */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 block">
            {t.welcomeHeading}
          </span>
          <h2 className="text-xl font-black text-white tracking-tight">
            {t.welcomeSub}
          </h2>
        </div>

        <div
          onClick={() => onNavigateTab('profile')}
          className="flex items-center gap-2 p-1.5 pr-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 cursor-pointer hover:border-cyan-500/40 transition-colors"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-xs font-black text-slate-950">
            {levelInfo.level}
          </div>
          <div>
            <span className="text-[11px] font-bold text-white block leading-tight">
              {rankTitle}
            </span>
            <span className="text-[9px] font-mono text-cyan-400">
              Lvl {levelInfo.level}
            </span>
          </div>
        </div>
      </div>

      {/* Featured Daily Challenge Card */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-amber-500/25 via-rose-500/20 to-slate-850 border border-amber-500/40 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] font-bold uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400 animate-pulse" />
            <span>{t.dailyBlitzTitle}</span>
          </div>

          <span className="text-[10px] font-mono text-amber-200 font-bold bg-slate-900/60 px-2 py-0.5 rounded-full">
            {t.bonusCoins}
          </span>
        </div>

        <h3 className="text-lg font-black text-white mb-1">
          {t.dailyBlitzHeading}
        </h3>
        <p className="text-xs text-slate-300 leading-snug mb-4 max-w-sm">
          {language === 'hi'
            ? `सभी विषयों से 10 चुनिंदा प्रश्न। अपनी ${stats.dailyStreak}-दिन की स्ट्रीक बनाए रखें और सिक्कों का इनाम जीतें!`
            : `10 hand-picked questions across all topics. Maintain your ${stats.dailyStreak}-day streak and multiply your rewards!`}
        </p>

        <button
          onClick={() => {
            Haptics.tap(hapticsEnabled);
            onStartQuiz('blitz');
          }}
          data-start="true"
          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 hover:from-amber-300 hover:to-rose-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 active:scale-[0.98] transition-all"
        >
          <Play className="w-4 h-4 fill-slate-950" />
          <span>{t.launchBlitz}</span>
        </button>
      </div>

      {/* Daily Missions Section */}
      <DailyMissionsCard
        missions={missions}
        onClaimMission={onClaimMission}
        hapticsEnabled={hapticsEnabled}
        soundEnabled={soundEnabled}
        language={language}
        onNavigateToTopics={() => onNavigateTab('categories')}
      />

      {/* Game Modes Grid */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
          {t.selectMode}
        </h3>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Classic Marathon */}
          <button
            onClick={() => {
              Haptics.tap(hapticsEnabled);
              onStartQuiz('classic');
            }}
            className="p-3.5 rounded-2xl bg-slate-850 border border-slate-750 hover:border-cyan-500/50 text-left transition-all active:scale-[0.98] shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-2.5">
                <Zap className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white mb-0.5">{t.classicGk}</h4>
              <p className="text-[11px] text-slate-400 leading-tight">
                {t.classicGkDesc}
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold text-cyan-400 mt-3 flex items-center gap-1">
              {t.playNow} <ArrowRight className="w-3 h-3" />
            </span>
          </button>

          {/* Campaign Map */}
          <button
            onClick={() => {
              Haptics.tap(hapticsEnabled);
              onNavigateTab('campaign');
            }}
            className="p-3.5 rounded-2xl bg-slate-850 border border-slate-750 hover:border-emerald-500/50 text-left transition-all active:scale-[0.98] shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2.5">
                <Map className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white mb-0.5">{t.campaign}</h4>
              <p className="text-[11px] text-slate-400 leading-tight">
                {t.campaignDesc}
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-400 mt-3 flex items-center gap-1">
              {t.stage} {stats.unlockedCampaignStage || 1} <ArrowRight className="w-3 h-3" />
            </span>
          </button>

          {/* Categories Deep Dive */}
          <button
            onClick={() => {
              Haptics.tap(hapticsEnabled);
              onNavigateTab('categories');
            }}
            className="p-3.5 rounded-2xl bg-slate-850 border border-slate-750 hover:border-purple-500/50 text-left transition-all active:scale-[0.98] shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-2.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white mb-0.5">{t.topicArenas}</h4>
              <p className="text-[11px] text-slate-400 leading-tight">
                {t.topicArenasDesc}
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold text-purple-400 mt-3 flex items-center gap-1">
              {language === 'hi' ? '6 श्रेणियां' : '6 Categories'} <ArrowRight className="w-3 h-3" />
            </span>
          </button>

          {/* Mistakes Notebook */}
          <button
            onClick={() => {
              Haptics.tap(hapticsEnabled);
              onNavigateTab('notebook');
            }}
            className="p-3.5 rounded-2xl bg-slate-850 border border-slate-750 hover:border-rose-500/50 text-left transition-all active:scale-[0.98] shadow-md flex flex-col justify-between relative"
          >
            <div>
              <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-2.5">
                <BookOpen className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white mb-0.5">{t.mistakesNotebook}</h4>
              <p className="text-[11px] text-slate-400 leading-tight">
                {t.mistakesNotebookDesc}
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold text-rose-400 mt-3 flex items-center gap-1">
              {mistakesCount} {t.toMaster} <ArrowRight className="w-3 h-3" />
            </span>
          </button>
        </div>
      </div>

      {/* Did You Know? OG Trivia Pill */}
      <div className="p-3.5 rounded-2xl bg-slate-850/80 border border-slate-800 flex items-start gap-3">
        <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
          <Lightbulb className="w-4 h-4" />
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
            {t.ogFactOfDay}
          </span>
          <p className="text-xs text-slate-300 leading-relaxed mt-0.5">
            {currentFact}
          </p>
        </div>
      </div>
    </div>
  );
};
