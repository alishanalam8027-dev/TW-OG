import React from 'react';
import {
  Trophy,
  Flame,
  Award,
  Crown,
  Sparkles,
  Zap,
  Compass,
  ShieldCheck,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { UserStats, Language } from '../types/quiz.js';
import { ACHIEVEMENTS } from '../data/gkQuestions.js';
import { calculateLevelInfo } from '../game/quizRules.js';
import { getRankTitleI18n, TRANSLATIONS } from '../data/translations.js';

interface AchievementsViewProps {
  stats: UserStats;
  language: Language;
}

const ICON_COMPONENTS: Record<string, React.ElementType> = {
  Sparkles,
  Flame,
  Zap,
  Award,
  ShieldCheck,
  Crown,
  Compass,
};

export const AchievementsView: React.FC<AchievementsViewProps> = ({ stats, language }) => {
  const t = TRANSLATIONS[language];
  const levelInfo = calculateLevelInfo(stats.xp);
  const rankTitle = getRankTitleI18n(levelInfo.level, language);

  const overallAccuracy =
    stats.totalAnswered > 0
      ? Math.round((stats.totalCorrect / stats.totalAnswered) * 100)
      : 0;

  return (
    <div className="flex-1 min-h-0 p-4 bg-slate-900 overflow-y-auto select-none space-y-4">
      {/* Profile Card */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-500/20 via-cyan-500/10 to-slate-800 border border-amber-500/30">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-rose-500/20">
            {levelInfo.level}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-white">{rankTitle}</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                {t.level} {levelInfo.level}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              {stats.xp} {t.totalXp} • {stats.coins} {t.ogCoins}
            </p>
          </div>
        </div>

        {/* Level Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
            <span>{language === 'hi' ? `स्तर ${levelInfo.level} प्रगति` : `Level ${levelInfo.level} Progress`}</span>
            <span>
              {levelInfo.currentLevelProgressXp} / {levelInfo.currentLevelRequiredXp} XP ({levelInfo.progressPercent}%)
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-amber-400 transition-all duration-300"
              style={{ width: `${levelInfo.progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Lifetime Stats Matrix */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-2xl bg-slate-850 border border-slate-750 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
            {t.quizzesPlayed}
          </span>
          <span className="text-base font-black font-mono text-white">
            {stats.totalGames}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-850 border border-slate-750 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
            {t.accuracy}
          </span>
          <span className="text-base font-black font-mono text-emerald-400">
            {overallAccuracy}%
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-850 border border-slate-750 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
            {t.totalCorrect}
          </span>
          <span className="text-base font-black font-mono text-cyan-400">
            {stats.totalCorrect}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-850 border border-slate-750 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
            {t.highScore}
          </span>
          <span className="text-base font-black font-mono text-amber-400">
            {stats.highestScore}
          </span>
        </div>
      </div>

      {/* Badges Collection */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-black text-white flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>{t.badgesAndTrophies} ({stats.unlockedAchievements?.length || 0}/{ACHIEVEMENTS.length})</span>
          </h3>
        </div>

        <div className="space-y-2.5">
          {ACHIEVEMENTS.map((ach) => {
            const isUnlocked = stats.unlockedAchievements?.includes(ach.id);
            const IconComp = ICON_COMPONENTS[ach.icon] || Trophy;
            const achTitle = language === 'hi' && ach.titleHi ? ach.titleHi : ach.title;
            const achDesc = language === 'hi' && ach.descriptionHi ? ach.descriptionHi : ach.description;

            return (
              <div
                key={ach.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                  isUnlocked
                    ? 'bg-slate-850 border-amber-500/40 shadow-md shadow-amber-500/5'
                    : 'bg-slate-900/60 border-slate-800/80 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                      isUnlocked
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : 'bg-slate-800 text-slate-500 border border-slate-700'
                    }`}
                  >
                    {isUnlocked ? <IconComp className="w-5 h-5" /> : <Lock className="w-4 h-4" />}
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-white leading-tight">
                      {achTitle}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      {achDesc}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-right ml-2">
                  <span className="text-[10px] font-mono font-bold text-yellow-400 block">
                    +{ach.rewardCoins} 🪙
                  </span>
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider ${
                      isUnlocked ? 'text-emerald-400' : 'text-slate-500'
                    }`}
                  >
                    {isUnlocked ? (language === 'hi' ? 'अनलॉक' : 'Unlocked') : (language === 'hi' ? 'लॉक' : 'Locked')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
