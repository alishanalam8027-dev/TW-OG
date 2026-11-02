import React from 'react';
import {
  Compass,
  Target,
  Flame,
  CheckCircle2,
  Gift,
  Coins,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { DailyMission, Language } from '../types/quiz.js';
import { Haptics } from '../utils/haptics.js';
import { SoundEngine } from '../utils/audio.js';
import { TRANSLATIONS } from '../data/translations.js';

interface DailyMissionsCardProps {
  missions: DailyMission[];
  onClaimMission: (missionId: string) => void;
  hapticsEnabled: boolean;
  soundEnabled: boolean;
  language: Language;
  onNavigateToTopics?: () => void;
}

const MISSION_ICONS: Record<string, React.ElementType> = {
  Compass,
  Target,
  Flame,
  Trophy,
};

const CATEGORY_NAMES_HI: Record<string, string> = {
  history: 'इतिहास',
  science: 'विज्ञान',
  geography: 'भूगोल',
  tech: 'तकनीक',
  sports: 'खेल',
  popculture: 'कला',
  mixed: 'विविध',
};

export const DailyMissionsCard: React.FC<DailyMissionsCardProps> = ({
  missions,
  onClaimMission,
  hapticsEnabled,
  soundEnabled,
  language,
  onNavigateToTopics,
}) => {
  const t = TRANSLATIONS[language];
  const completedCount = missions.filter((m) => m.completed).length;
  const claimedCount = missions.filter((m) => m.claimed).length;
  const allCompleted = missions.length > 0 && completedCount === missions.length;

  const handleClaim = (missionId: string) => {
    Haptics.success(hapticsEnabled);
    SoundEngine.playCoin(soundEnabled);
    onClaimMission(missionId);
  };

  return (
    <div className="p-4 rounded-3xl bg-slate-850/95 border border-slate-750 shadow-lg space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Gift className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-white">
              {t.dailyMissions}
            </h3>
            <p className="text-[10px] text-slate-400">
              {t.dailyMissionsSub}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-mono font-bold">
          {allCompleted ? (
            <span className="text-emerald-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" /> {t.allDone}
            </span>
          ) : (
            <span className="text-cyan-300">
              {completedCount}/{missions.length} {t.complete}
            </span>
          )}
        </div>
      </div>

      {/* Missions List */}
      <div className="space-y-2.5">
        {missions.map((mission) => {
          const IconComp = MISSION_ICONS[mission.icon] || Target;
          const progressPercent = Math.min(100, Math.round((mission.progress / mission.target) * 100));

          return (
            <div
              key={mission.id}
              className={`p-3 rounded-2xl border transition-all duration-200 ${
                mission.claimed
                  ? 'bg-slate-900/60 border-slate-800/80 opacity-70'
                  : mission.completed
                  ? 'bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-slate-850 border-amber-500/40 shadow-sm'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      mission.claimed
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : mission.completed
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                        : 'bg-slate-800 text-cyan-400 border border-slate-700'
                    }`}
                  >
                    {mission.claimed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <IconComp className="w-4 h-4" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <h4 className="text-xs font-bold text-white truncate">
                        {language === 'hi' && mission.titleHi ? mission.titleHi : mission.title}
                      </h4>
                      <span className="text-[10px] font-mono font-bold text-yellow-300 shrink-0">
                        +{mission.rewardCoins} 🪙
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-snug mb-2">
                      {language === 'hi' && mission.descriptionHi ? mission.descriptionHi : mission.description}
                    </p>

                    {/* Progress Bar & Numerical Tag */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            mission.completed
                              ? 'bg-emerald-400'
                              : 'bg-gradient-to-r from-cyan-500 to-amber-400'
                          }`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>

                      <span className="text-[10px] font-mono font-semibold text-slate-300 shrink-0">
                        {mission.unit === '%' ? (
                          `${mission.progress}% / ${mission.target}%`
                        ) : (
                          `${mission.progress}/${mission.target}`
                        )}
                      </span>
                    </div>

                    {/* Tracked Categories Badges for "Topic Explorer" */}
                    {mission.type === 'play_categories' &&
                      mission.trackedCategories &&
                      mission.trackedCategories.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {mission.trackedCategories.map((cat) => (
                            <span
                              key={cat}
                              className="text-[9px] px-1.5 py-0.2 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-medium capitalize"
                            >
                              ✓ {language === 'hi' ? CATEGORY_NAMES_HI[cat] || cat : cat}
                            </span>
                          ))}
                        </div>
                      )}
                  </div>
                </div>

                {/* Right Action Button */}
                <div className="shrink-0 self-center pl-1">
                  {mission.claimed ? (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-xl flex items-center gap-1">
                      {t.claimed}
                    </span>
                  ) : mission.completed ? (
                    <button
                      onClick={() => handleClaim(mission.id)}
                      aria-label={`Claim reward for ${mission.title}`}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(250,204,21,0.4)] active:scale-95 transition-all"
                    >
                      <Coins className="w-3.5 h-3.5" />
                      <span>{t.claim}</span>
                    </button>
                  ) : (
                    <div className="text-[10px] font-mono text-slate-500 font-semibold px-2 py-1">
                      {progressPercent}%
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
