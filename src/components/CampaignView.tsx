import React from 'react';
import { Lock, Star, Play, CheckCircle, Trophy, Flame } from 'lucide-react';
import { UserStats, Language } from '../types/quiz.js';
import { Haptics } from '../utils/haptics.js';
import { TRANSLATIONS } from '../data/translations.js';

interface CampaignViewProps {
  stats: UserStats;
  onStartCampaignStage: (stage: number) => void;
  hapticsEnabled: boolean;
  language: Language;
}

export const CAMPAIGN_STAGES = [
  {
    stage: 1,
    title: 'Stage 1: Rookie Trial',
    titleHi: 'स्तर 1: आरंभिक परीक्षा',
    desc: 'Kick off your GK journey with foundational world trivia.',
    descHi: 'मूलभूत सामान्य ज्ञान तथ्यों के साथ अपनी यात्रा शुरू करें।',
    questionsCount: 5,
    difficulty: 'Easy',
    difficultyHi: 'सरल',
    rewardCoins: 50,
  },
  {
    stage: 2,
    title: 'Stage 2: Junior Scholar',
    titleHi: 'स्तर 2: बाल विद्वान',
    desc: 'History & geography essentials to test your awareness.',
    descHi: 'इतिहास और भूगोल की प्राथमिक जानकारियों की परख।',
    questionsCount: 6,
    difficulty: 'Easy-Medium',
    difficultyHi: 'सरल-मध्यम',
    rewardCoins: 75,
  },
  {
    stage: 3,
    title: 'Stage 3: GK Explorer',
    titleHi: 'स्तर 3: ज्ञान अन्वेषक',
    desc: 'Expeditions into science, oceans, and civilizations.',
    descHi: 'विज्ञान, महासागरों और प्राचीन सभ्यताओं की यात्रा।',
    questionsCount: 7,
    difficulty: 'Medium',
    difficultyHi: 'मध्यम',
    rewardCoins: 100,
  },
  {
    stage: 4,
    title: 'Stage 4: Mind Pioneer',
    titleHi: 'स्तर 4: मेधावी पथिक',
    desc: 'Inventions, space milestones, and historical treaties.',
    descHi: 'वैज्ञानिक आविष्कार, अंतरिक्ष मिशन एवं ऐतिहासिक संधियां।',
    questionsCount: 8,
    difficulty: 'Medium',
    difficultyHi: 'मध्यम',
    rewardCoins: 120,
  },
  {
    stage: 5,
    title: 'Stage 5: Trivia Vanguard',
    titleHi: 'स्तर 5: ज्ञान अग्रदूत',
    desc: 'Battle through challenging science and sports lore.',
    descHi: 'कठिन विज्ञान एवं खेल जगत के ऐतिहासिक प्रश्न।',
    questionsCount: 8,
    difficulty: 'Medium-Hard',
    difficultyHi: 'मध्यम-कठिन',
    rewardCoins: 150,
  },
  {
    stage: 6,
    title: 'Stage 6: Cosmos & Nations',
    titleHi: 'स्तर 6: अंतरिक्ष व राष्ट्र',
    desc: 'Astronomy, world capitals, and deep-sea trenches.',
    descHi: 'खगोल विज्ञान, विश्व राजधानियां एवं गहरे महासागरीय गर्त।',
    questionsCount: 10,
    difficulty: 'Medium-Hard',
    difficultyHi: 'मध्यम-कठिन',
    rewardCoins: 180,
  },
  {
    stage: 7,
    title: 'Stage 7: History Titan',
    titleHi: 'स्तर 7: इतिहास सम्राट',
    desc: 'Ancient empires, revolutions, and world leaders.',
    descHi: 'प्राचीन साम्राज्य, क्रांतियां एवं वैश्विक महानायक।',
    questionsCount: 10,
    difficulty: 'Hard',
    difficultyHi: 'कठिन',
    rewardCoins: 200,
  },
  {
    stage: 8,
    title: 'Stage 8: Science Prodigy',
    titleHi: 'स्तर 8: विज्ञान महारथी',
    desc: 'Quantum physics, genetics, elements, and computing.',
    descHi: 'क्वांटम भौतिकी, आनुवंशिकी, रासायनिक तत्व एवं कंप्यूटर।',
    questionsCount: 10,
    difficulty: 'Hard',
    difficultyHi: 'कठिन',
    rewardCoins: 250,
  },
  {
    stage: 9,
    title: 'Stage 9: Brain Fortress',
    titleHi: 'स्तर 9: ज्ञान का किला',
    desc: 'High-stakes multi-discipline brain challenge.',
    descHi: 'उच्च स्तरीय बहु-विषयक बौद्धिक महामुकाबला।',
    questionsCount: 12,
    difficulty: 'Hard',
    difficultyHi: 'कठिन',
    rewardCoins: 300,
  },
  {
    stage: 10,
    title: 'Stage 10: OG Grandmaster Pinnacle',
    titleHi: 'स्तर 10: ओजी ग्रैंडमास्टर शिखर',
    desc: 'The ultimate 15-question championship for true legends.',
    descHi: 'सच्चे ज्ञानियों के लिए 15 प्रश्नों की अंतिम महाचुनौती।',
    questionsCount: 15,
    difficulty: 'Extreme',
    difficultyHi: 'सर्वोच्च',
    rewardCoins: 500,
  },
];

export const CampaignView: React.FC<CampaignViewProps> = ({
  stats,
  onStartCampaignStage,
  hapticsEnabled,
  language,
}) => {
  const t = TRANSLATIONS[language];
  const currentUnlocked = stats.unlockedCampaignStage || 1;

  const totalStarsEarned = Object.values(stats.campaignStars || {}).reduce(
    (acc, cur) => acc + cur,
    0
  );

  return (
    <div className="flex-1 min-h-0 p-4 bg-slate-900 overflow-y-auto select-none space-y-4">
      {/* Campaign Banner Header */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-500/20 via-rose-500/10 to-slate-800 border border-amber-500/30 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-amber-400 text-xs font-black uppercase tracking-wider mb-1">
            <Trophy className="w-4 h-4" />
            <span>{language === 'hi' ? 'ओजी अभियान यात्रा' : 'OG Campaign Journey'}</span>
          </div>
          <h2 className="text-lg font-black text-white">{t.tenStagesMastery}</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {t.campaignSub}
          </p>
        </div>

        <div className="text-center bg-slate-900/80 px-3 py-2 rounded-2xl border border-slate-700/80">
          <div className="flex items-center gap-1 text-yellow-400 font-mono font-black text-sm justify-center">
            <Star className="w-4 h-4 fill-yellow-400" />
            <span>{totalStarsEarned}/30</span>
          </div>
          <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">
            {t.stars}
          </span>
        </div>
      </div>

      {/* Stage Progression List */}
      <div className="space-y-3">
        {CAMPAIGN_STAGES.map((stage) => {
          const isUnlocked = stage.stage <= currentUnlocked;
          const isCompleted = (stats.campaignStars?.[stage.stage] || 0) > 0;
          const starsEarned = stats.campaignStars?.[stage.stage] || 0;
          const stageTitle = language === 'hi' ? stage.titleHi : stage.title;
          const stageDesc = language === 'hi' ? stage.descHi : stage.desc;
          const stageDiff = language === 'hi' ? stage.difficultyHi : stage.difficulty;

          return (
            <div
              key={stage.stage}
              className={`p-3.5 rounded-2xl border transition-all duration-200 relative overflow-hidden ${
                isUnlocked
                  ? 'bg-slate-850 border-slate-700/80 hover:border-cyan-500/50 shadow-md'
                  : 'bg-slate-900/50 border-slate-800/80 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black font-mono text-sm shrink-0 shadow-md ${
                      !isUnlocked
                        ? 'bg-slate-800 text-slate-500 border border-slate-700'
                        : isCompleted
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                    }`}
                  >
                    {isUnlocked ? (
                      isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                      ) : (
                        stage.stage
                      )
                    ) : (
                      <Lock className="w-4 h-4" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">{stageTitle}</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-medium">
                        {stageDiff}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mt-0.5 leading-snug">
                      {stageDesc}
                    </p>

                    <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400 font-mono">
                      <span>{stage.questionsCount} {language === 'hi' ? 'प्रश्न' : 'Qs'}</span>
                      <span>•</span>
                      <span className="text-yellow-400">+{stage.rewardCoins} {language === 'hi' ? 'सिक्के' : 'Coins'}</span>
                    </div>
                  </div>
                </div>

                {/* Right Action & Stars */}
                <div className="flex flex-col items-end justify-between shrink-0 h-full">
                  {/* Stars display */}
                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= starsEarned
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-slate-700'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Play Button */}
                  {isUnlocked ? (
                    <button
                      onClick={() => {
                        Haptics.tap(hapticsEnabled);
                        onStartCampaignStage(stage.stage);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                    >
                      <Play className="w-3.5 h-3.5 fill-slate-950" />
                      <span>{isCompleted ? t.replay : t.play}</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                      <Lock className="w-3 h-3" />
                      <span>{t.locked}</span>
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
