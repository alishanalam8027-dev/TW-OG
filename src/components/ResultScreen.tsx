import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Star,
  Flame,
  CheckCircle2,
  Clock,
  Sparkles,
  Coins,
  RotateCcw,
  Home,
  BookOpen,
  Share2,
} from 'lucide-react';
import { QuizSessionResult, Language } from '../types/quiz.js';
import { SoundEngine } from '../utils/audio.js';
import { Haptics } from '../utils/haptics.js';
import { TRANSLATIONS } from '../data/translations.js';

interface ResultScreenProps {
  result: QuizSessionResult;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  language: Language;
  onPlayAgain: () => void;
  onHome: () => void;
  onOpenReview: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  result,
  soundEnabled,
  hapticsEnabled,
  language,
  onPlayAgain,
  onHome,
  onOpenReview,
}) => {
  const t = TRANSLATIONS[language];

  useEffect(() => {
    if (result.accuracy >= 60) {
      confetti({
        particleCount: result.accuracy === 100 ? 120 : 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#f59e0b', '#10b981', '#ec4899'],
      });
      SoundEngine.playVictory(soundEnabled);
      Haptics.victory(hapticsEnabled);
    }
  }, [result.accuracy, soundEnabled, hapticsEnabled]);

  const getHeadline = () => {
    if (language === 'hi') {
      if (result.accuracy === 100) return 'अद्भुत विजय! शत-प्रतिशत!';
      if (result.accuracy >= 80) return 'शानदार बुद्धिमत्ता!';
      if (result.accuracy >= 60) return 'बहुत अच्छा प्रयास!';
      if (result.accuracy >= 40) return 'अच्छा प्रदर्शन!';
      return 'अभ्यास ही सफलता की कुंजी है!';
    }
    if (result.accuracy === 100) return 'FLAWLESS VICTORY!';
    if (result.accuracy >= 80) return 'OUTSTANDING BRAIN!';
    if (result.accuracy >= 60) return 'WELL PLAYED!';
    if (result.accuracy >= 40) return 'GOOD EFFORT!';
    return 'PRACTICE MAKES PERFECT!';
  };

  const getSubheadline = () => {
    if (language === 'hi') {
      if (result.accuracy === 100) return 'आपने सभी प्रश्नों के सटीक व सही उत्तर देकर इतिहास रच दिया।';
      if (result.accuracy >= 80) return 'आपकी सामान्य ज्ञान की पकड़ वाकई उच्च कोटि की है।';
      if (result.accuracy >= 60) return 'बेहतर ज्ञान कौशल। कुछ प्रश्न चूक गए जिन्हें आप दोहरा सकते हैं।';
      return 'हर गलती एक नया सबक सिखाती है। अपने उत्तरों की समीक्षा करें।';
    }
    if (result.accuracy === 100) return 'You conquered every single question with OG perfection.';
    if (result.accuracy >= 80) return 'Your General Knowledge prowess is truly top tier.';
    if (result.accuracy >= 60) return 'Solid trivia skills. A few questions slipped away.';
    return 'Every miss is a lesson. Review your answers to master the facts.';
  };

  return (
    <div className="flex-1 min-h-0 p-4 bg-slate-900 flex flex-col justify-between overflow-y-auto select-none">
      <div className="flex flex-col items-center text-center pt-2">
        {/* Trophy / Emblem */}
        <div className="relative mb-3">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 flex items-center justify-center shadow-xl shadow-amber-500/20 transform hover:rotate-3 transition-transform">
            <Trophy className="w-10 h-10 text-slate-950 fill-slate-950" />
          </div>

          {result.accuracy === 100 && (
            <div className="absolute -top-1 -right-1 px-2 py-0.5 rounded-full bg-rose-500 text-[10px] font-black text-white shadow-md uppercase tracking-wider animate-bounce">
              100%
            </div>
          )}
        </div>

        {/* Star Rating */}
        <div className="flex items-center gap-2 mb-2">
          {[1, 2, 3].map((starNum) => (
            <Star
              key={starNum}
              className={`w-7 h-7 transition-all duration-300 ${
                starNum <= result.stars
                  ? 'text-yellow-400 fill-yellow-400 scale-110 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]'
                  : 'text-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Title & Subtitle */}
        <h2 className="text-xl font-black text-white tracking-tight mb-1">
          {getHeadline()}
        </h2>
        <p className="text-xs text-slate-400 max-w-xs mb-4">
          {getSubheadline()}
        </p>

        {/* Score & Rewards Bar */}
        <div className="w-full grid grid-cols-2 gap-2.5 mb-3">
          <div className="p-3 rounded-2xl bg-slate-800/80 border border-amber-500/30 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                {t.finalScore}
              </span>
              <span className="text-lg font-black font-mono text-white">
                {result.score}
              </span>
            </div>
            <Sparkles className="w-6 h-6 text-amber-400" />
          </div>

          <div className="p-3 rounded-2xl bg-slate-800/80 border border-yellow-500/30 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-400 block">
                {t.coinsAndXp}
              </span>
              <div className="flex items-center gap-2 font-mono font-black text-white text-xs">
                <span className="text-yellow-300">+{result.coinsEarned} 🪙</span>
                <span className="text-cyan-300">+{result.xpEarned} XP</span>
              </div>
            </div>
            <Coins className="w-6 h-6 text-yellow-400" />
          </div>
        </div>

        {/* Stat Tiles */}
        <div className="w-full grid grid-cols-3 gap-2 mb-4">
          <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-col items-center">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 mb-1" />
            <span className="text-xs font-bold text-white">
              {result.correctCount}/{result.totalQuestions}
            </span>
            <span className="text-[9px] text-slate-400 uppercase tracking-wider">{t.correct}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-col items-center">
            <Flame className="w-4 h-4 text-rose-400 mb-1" />
            <span className="text-xs font-bold text-white font-mono">
              {result.maxStreak}x
            </span>
            <span className="text-[9px] text-slate-400 uppercase tracking-wider">{t.maxStreak}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-col items-center">
            <Clock className="w-4 h-4 text-cyan-400 mb-1" />
            <span className="text-xs font-bold text-white font-mono">
              {result.timeSpentSeconds}s
            </span>
            <span className="text-[9px] text-slate-400 uppercase tracking-wider">{t.pace}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-2 border-t border-slate-800/80">
        <button
          onClick={onOpenReview}
          className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-cyan-300 border border-cyan-500/30 font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
        >
          <BookOpen className="w-4 h-4 text-cyan-400" />
          {t.reviewAnswers} ({result.answers.length})
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onPlayAgain}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98]"
          >
            <RotateCcw className="w-4 h-4" />
            {t.playAgain}
          </button>

          <button
            onClick={onHome}
            className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <Home className="w-4 h-4" />
            {t.home}
          </button>
        </div>
      </div>
    </div>
  );
};
