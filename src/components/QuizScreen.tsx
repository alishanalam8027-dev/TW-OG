import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Pause,
  Play,
  RotateCcw,
  Home,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Sparkles,
  Zap,
  Flame,
  ArrowRight,
  Info,
} from 'lucide-react';
import {
  Question,
  LifelineState,
  UserAnswerRecord,
  QuizSessionResult,
  GameMode,
  Category,
  Language,
} from '../types/quiz.js';
import {
  calculateAnswerPoints,
  calculateRoundRewards,
  calculateStars,
  getFiftyFiftyHiddenIndices,
  getStreakMultiplier,
  getLocalizedQuestion,
} from '../game/quizRules.js';
import { TRANSLATIONS } from '../data/translations.js';
import { SoundEngine } from '../utils/audio.js';
import { Haptics } from '../utils/haptics.js';
import { saveMistakeToNotebook } from '../utils/storage.js';

interface QuizScreenProps {
  questions: Question[];
  mode: GameMode;
  category?: Category;
  totalTimePerQuestion: number;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  language: Language;
  onFinishQuiz: (result: QuizSessionResult) => void;
  onExitQuiz: () => void;
}

export const QuizScreen: React.FC<QuizScreenProps> = ({
  questions,
  mode,
  totalTimePerQuestion,
  soundEnabled,
  hapticsEnabled,
  language,
  onFinishQuiz,
  onExitQuiz,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(totalTimePerQuestion);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [answersHistory, setAnswersHistory] = useState<UserAnswerRecord[]>([]);

  // Lifelines
  const [lifelines, setLifelines] = useState<LifelineState>({
    fiftyFifty: 1,
    hint: 1,
    timeFreeze: 1,
    skip: 1,
  });
  const [hiddenOptionIndices, setHiddenOptionIndices] = useState<number[]>([]);
  const [showHintModal, setShowHintModal] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const rawQuestion = questions[currentIndex];
  const currentQuestion = rawQuestion ? getLocalizedQuestion(rawQuestion, language) : null;
  const t = TRANSLATIONS[language];
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const roundStartTimeRef = useRef<number>(Date.now());

  // Clean timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Finish quiz helper
  const finalizeQuiz = useCallback(
    (completedAnswers: UserAnswerRecord[], finalScore: number, highestStreak: number) => {
      const correctCount = completedAnswers.filter((a) => a.isCorrect).length;
      const total = completedAnswers.length;
      const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;
      const timeSpentSec = Math.max(
        1,
        Math.round((Date.now() - roundStartTimeRef.current) / 1000)
      );
      const rewards = calculateRoundRewards(finalScore, correctCount, total, mode);
      const stars = calculateStars(correctCount, total);

      const result: QuizSessionResult = {
        mode,
        score: finalScore,
        totalQuestions: total,
        correctCount,
        accuracy,
        maxStreak: highestStreak,
        timeSpentSeconds: timeSpentSec,
        xpEarned: rewards.xp,
        coinsEarned: rewards.coins,
        stars,
        answers: completedAnswers,
      };

      onFinishQuiz(result);
    },
    [mode, onFinishQuiz]
  );

  // Advance or finish
  const handleAdvance = useCallback(
    (completedAnswers: UserAnswerRecord[], newScore: number, streakVal: number) => {
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex((prev) => prev + 1);
        setSelectedOption(null);
        setIsAnswerLocked(false);
        setHiddenOptionIndices([]);
        setShowHintModal(false);
        setTimeRemaining(totalTimePerQuestion);
        startTimeRef.current = Date.now();
      } else {
        finalizeQuiz(completedAnswers, newScore, Math.max(maxStreak, streakVal));
      }
    },
    [currentIndex, questions.length, totalTimePerQuestion, maxStreak, finalizeQuiz]
  );

  // Time-out handler
  const handleTimeout = useCallback(() => {
    if (isAnswerLocked || !currentQuestion) return;
    setIsAnswerLocked(true);
    SoundEngine.playWrong(soundEnabled);
    Haptics.error(hapticsEnabled);

    const record: UserAnswerRecord = {
      questionId: currentQuestion.id,
      questionText: currentQuestion.question,
      options: currentQuestion.options,
      correctIndex: currentQuestion.correctIndex,
      selectedIndex: null,
      isCorrect: false,
      timeSpent: totalTimePerQuestion,
      scoreEarned: 0,
      explanation: currentQuestion.explanation,
    };

    saveMistakeToNotebook(record);
    const nextAnswers = [...answersHistory, record];
    setAnswersHistory(nextAnswers);
    setCurrentStreak(0);

    setTimeout(() => {
      handleAdvance(nextAnswers, totalScore, 0);
    }, 1200);
  }, [
    isAnswerLocked,
    currentQuestion,
    soundEnabled,
    hapticsEnabled,
    totalTimePerQuestion,
    answersHistory,
    totalScore,
    handleAdvance,
  ]);

  // Main countdown timer
  useEffect(() => {
    if (isPaused || isAnswerLocked) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleTimeout();
          return 0;
        }
        if (prev <= 5 && soundEnabled) {
          SoundEngine.playTick(true);
          Haptics.tap(hapticsEnabled);
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, isAnswerLocked, handleTimeout, soundEnabled, hapticsEnabled]);

  // Option selection
  const handleSelectOption = (index: number) => {
    if (isAnswerLocked || isPaused || !currentQuestion) return;
    if (hiddenOptionIndices.includes(index)) return; // 50:50 removed

    setIsAnswerLocked(true);
    setSelectedOption(index);
    if (timerRef.current) clearInterval(timerRef.current);

    const timeSpent = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
    const isCorrect = index === currentQuestion.correctIndex;

    let pointsAwarded = 0;
    let nextStreak = currentStreak;

    if (isCorrect) {
      nextStreak = currentStreak + 1;
      setCurrentStreak(nextStreak);
      if (nextStreak > maxStreak) {
        setMaxStreak(nextStreak);
      }
      pointsAwarded = calculateAnswerPoints(
        currentQuestion.difficulty,
        timeRemaining,
        totalTimePerQuestion,
        nextStreak
      );
      setTotalScore((prev) => prev + pointsAwarded);

      if (nextStreak >= 3) {
        SoundEngine.playStreakCombo(soundEnabled);
      } else {
        SoundEngine.playCorrect(soundEnabled);
      }
      Haptics.success(hapticsEnabled);
    } else {
      nextStreak = 0;
      setCurrentStreak(0);
      SoundEngine.playWrong(soundEnabled);
      Haptics.error(hapticsEnabled);
    }

    const record: UserAnswerRecord = {
      questionId: currentQuestion.id,
      questionText: currentQuestion.question,
      options: currentQuestion.options,
      correctIndex: currentQuestion.correctIndex,
      selectedIndex: index,
      isCorrect,
      timeSpent,
      scoreEarned: pointsAwarded,
      explanation: currentQuestion.explanation,
    };

    if (!isCorrect) {
      saveMistakeToNotebook(record);
    }

    const nextAnswers = [...answersHistory, record];
    setAnswersHistory(nextAnswers);

    // Auto-advance after 1.2s delay for visual feedback
    setTimeout(() => {
      handleAdvance(nextAnswers, totalScore + pointsAwarded, nextStreak);
    }, 1300);
  };

  // Lifeline: 50:50
  const handleUseFiftyFifty = () => {
    if (!currentQuestion || isAnswerLocked || isPaused || lifelines.fiftyFifty <= 0 || hiddenOptionIndices.length > 0) return;
    SoundEngine.playLifeline(soundEnabled);
    Haptics.lifeline(hapticsEnabled);

    const hidden = getFiftyFiftyHiddenIndices(currentQuestion.correctIndex, 4);
    setHiddenOptionIndices(hidden);
    setLifelines((prev) => ({ ...prev, fiftyFifty: prev.fiftyFifty - 1 }));
  };

  // Lifeline: Hint
  const handleUseHint = () => {
    if (!currentQuestion || isAnswerLocked || isPaused || lifelines.hint <= 0) return;
    SoundEngine.playLifeline(soundEnabled);
    Haptics.lifeline(hapticsEnabled);
    setShowHintModal(true);
    setLifelines((prev) => ({ ...prev, hint: prev.hint - 1 }));
  };

  // Lifeline: Time Freeze (+15s)
  const handleUseTimeFreeze = () => {
    if (!currentQuestion || isAnswerLocked || isPaused || lifelines.timeFreeze <= 0) return;
    SoundEngine.playLifeline(soundEnabled);
    Haptics.lifeline(hapticsEnabled);
    setTimeRemaining((prev) => prev + 15);
    setLifelines((prev) => ({ ...prev, timeFreeze: prev.timeFreeze - 1 }));
  };

  // Lifeline: Skip
  const handleUseSkip = () => {
    if (!currentQuestion || isAnswerLocked || isPaused || lifelines.skip <= 0) return;
    SoundEngine.playLifeline(soundEnabled);
    Haptics.lifeline(hapticsEnabled);
    setLifelines((prev) => ({ ...prev, skip: prev.skip - 1 }));

    const record: UserAnswerRecord = {
      questionId: currentQuestion.id,
      questionText: currentQuestion.question,
      options: currentQuestion.options,
      correctIndex: currentQuestion.correctIndex,
      selectedIndex: null,
      isCorrect: false,
      timeSpent: totalTimePerQuestion - timeRemaining,
      scoreEarned: 0,
      explanation: currentQuestion.explanation,
    };

    const nextAnswers = [...answersHistory, record];
    setAnswersHistory(nextAnswers);
    handleAdvance(nextAnswers, totalScore, currentStreak);
  };

  // Keyboard shortcut listener (1, 2, 3, 4)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnswerLocked || isPaused) return;
      if (e.key === '1') handleSelectOption(0);
      else if (e.key === '2') handleSelectOption(1);
      else if (e.key === '3') handleSelectOption(2);
      else if (e.key === '4') handleSelectOption(3);
      else if (e.key.toLowerCase() === 'p' || e.key === 'Escape') {
        setIsPaused((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  if (!currentQuestion) return null;

  const timerRatio = Math.max(0, Math.min(1, timeRemaining / totalTimePerQuestion));
  const isTimeCritical = timeRemaining <= 5;
  const streakMultiplier = getStreakMultiplier(currentStreak);

  return (
    <div className="flex-1 min-h-0 flex flex-col justify-between p-4 bg-slate-900 select-none relative overflow-y-auto">
      {/* Quiz Top Status Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              {t.question} {currentIndex + 1} {t.of} {questions.length}
            </span>

            <span className="capitalize px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400">
              {t[currentQuestion.difficulty] || currentQuestion.difficulty}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Score */}
            <div className="flex items-center gap-1 font-mono font-bold text-amber-400 text-sm">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>{totalScore}</span>
            </div>

            {/* Pause button */}
            <button
              onClick={() => setIsPaused(true)}
              aria-label="Pause quiz"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <Pause className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar & Timer */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden relative">
            <div
              className={`h-full transition-all duration-300 ${
                isTimeCritical
                  ? 'bg-rose-500 animate-pulse'
                  : timerRatio > 0.4
                  ? 'bg-gradient-to-r from-cyan-500 to-emerald-400'
                  : 'bg-amber-400'
              }`}
              style={{ width: `${timerRatio * 100}%` }}
            />
          </div>

          <div
            className={`flex items-center gap-1 font-mono font-bold text-xs ${
              isTimeCritical ? 'text-rose-400 animate-bounce' : 'text-slate-300'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{timeRemaining}s</span>
          </div>
        </div>

        {/* Combo Multiplier Banner */}
        {currentStreak >= 2 && (
          <div className="flex items-center justify-between px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-transparent border border-amber-500/30 text-amber-300 text-xs font-bold mb-3 animate-pulse">
            <div className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>{currentStreak}x {t.streakCombo}</span>
            </div>
            <span className="font-mono text-[11px] text-amber-200">
              x{streakMultiplier.toFixed(2)} {t.bonusPts}
            </span>
          </div>
        )}

        {/* Question Card */}
        <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700/80 shadow-lg mb-4">
          <p className="text-sm md:text-base font-semibold text-slate-100 leading-relaxed">
            {currentQuestion.question}
          </p>
        </div>

        {/* 4 Options Grid */}
        <div className="space-y-2.5">
          {currentQuestion.options.map((option, idx) => {
            const isHidden = hiddenOptionIndices.includes(idx);
            const isSelected = selectedOption === idx;
            const isCorrectAnswer = idx === currentQuestion.correctIndex;

            let buttonClass = 'bg-slate-800/80 hover:bg-slate-750 border-slate-700 text-slate-200';

            if (isHidden) {
              buttonClass = 'opacity-25 pointer-events-none line-through border-dashed border-slate-700 text-slate-600 bg-slate-900';
            } else if (isAnswerLocked) {
              if (isCorrectAnswer) {
                buttonClass = 'bg-emerald-600/30 border-emerald-500 text-emerald-100 font-bold shadow-lg shadow-emerald-500/20';
              } else if (isSelected) {
                buttonClass = 'bg-rose-600/30 border-rose-500 text-rose-100 font-bold shadow-lg shadow-rose-500/20';
              } else {
                buttonClass = 'opacity-40 border-slate-800 text-slate-500';
              }
            }

            const optionLetters = ['A', 'B', 'C', 'D'];

            return (
              <button
                key={idx}
                disabled={isAnswerLocked || isHidden}
                onClick={() => handleSelectOption(idx)}
                aria-label={`Option ${optionLetters[idx]}: ${option}`}
                className={`w-full p-3.5 rounded-xl border flex items-center justify-between text-left transition-all duration-200 active:scale-[0.98] ${buttonClass}`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0 ${
                      isAnswerLocked && isCorrectAnswer
                        ? 'bg-emerald-500 text-slate-950'
                        : isAnswerLocked && isSelected
                        ? 'bg-rose-500 text-white'
                        : 'bg-slate-700/80 text-slate-300'
                    }`}
                  >
                    {optionLetters[idx]}
                  </span>
                  <span className="text-sm font-medium leading-snug">{option}</span>
                </div>

                {isAnswerLocked && isCorrectAnswer && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 ml-2" />
                )}
                {isAnswerLocked && isSelected && !isCorrectAnswer && (
                  <XCircle className="w-5 h-5 text-rose-400 shrink-0 ml-2" />
                )}
              </button>
            );
          })}
        </div>

        {/* Fact Snippet on Answer Reveal */}
        {isAnswerLocked && (
          <div className="mt-3 p-3 rounded-xl bg-slate-800/90 border border-cyan-500/30 flex items-start gap-2.5 text-xs text-slate-300">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-cyan-300 block mb-0.5">{t.ogGkFact}</span>
              <p className="leading-relaxed">{currentQuestion.explanation}</p>
            </div>
          </div>
        )}
      </div>

      {/* Lifelines Bottom Bar */}
      <div className="mt-4 pt-3 border-t border-slate-800/80">
        <div className="flex items-center justify-between gap-1.5">
          {/* 50:50 Lifeline */}
          <button
            disabled={isAnswerLocked || lifelines.fiftyFifty <= 0 || hiddenOptionIndices.length > 0}
            onClick={handleUseFiftyFifty}
            aria-label="Use 50:50 lifeline"
            className={`flex-1 py-2 px-1.5 rounded-xl border flex flex-col items-center justify-center transition-all ${
              lifelines.fiftyFifty > 0 && hiddenOptionIndices.length === 0
                ? 'bg-slate-800 hover:bg-slate-750 border-cyan-500/40 text-cyan-300 active:scale-95'
                : 'opacity-40 border-slate-800 text-slate-600 pointer-events-none'
            }`}
          >
            <span className="text-xs font-black">50:50</span>
            <span className="text-[9px] font-mono mt-0.5 opacity-80">
              {lifelines.fiftyFifty > 0 ? `${lifelines.fiftyFifty} ${t.left}` : t.used}
            </span>
          </button>

          {/* Hint Lifeline */}
          <button
            disabled={isAnswerLocked || lifelines.hint <= 0}
            onClick={handleUseHint}
            aria-label="Use Hint lifeline"
            className={`flex-1 py-2 px-1.5 rounded-xl border flex flex-col items-center justify-center transition-all ${
              lifelines.hint > 0
                ? 'bg-slate-800 hover:bg-slate-750 border-amber-500/40 text-amber-300 active:scale-95'
                : 'opacity-40 border-slate-800 text-slate-600 pointer-events-none'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 mb-0.5 text-amber-400" />
            <span className="text-[9px] font-mono opacity-80">
              {lifelines.hint > 0 ? `${lifelines.hint} ${t.left}` : t.used}
            </span>
          </button>

          {/* +15s Freeze Lifeline */}
          <button
            disabled={isAnswerLocked || lifelines.timeFreeze <= 0}
            onClick={handleUseTimeFreeze}
            aria-label="Use +15s time freeze lifeline"
            className={`flex-1 py-2 px-1.5 rounded-xl border flex flex-col items-center justify-center transition-all ${
              lifelines.timeFreeze > 0
                ? 'bg-slate-800 hover:bg-slate-750 border-emerald-500/40 text-emerald-300 active:scale-95'
                : 'opacity-40 border-slate-800 text-slate-600 pointer-events-none'
            }`}
          >
            <div className="flex items-center gap-0.5">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span className="text-xs font-black">+15s</span>
            </div>
            <span className="text-[9px] font-mono mt-0.5 opacity-80">
              {lifelines.timeFreeze > 0 ? `${lifelines.timeFreeze} ${t.left}` : t.used}
            </span>
          </button>

          {/* Skip Lifeline */}
          <button
            disabled={isAnswerLocked || lifelines.skip <= 0}
            onClick={handleUseSkip}
            aria-label="Use Skip question lifeline"
            className={`flex-1 py-2 px-1.5 rounded-xl border flex flex-col items-center justify-center transition-all ${
              lifelines.skip > 0
                ? 'bg-slate-800 hover:bg-slate-750 border-purple-500/40 text-purple-300 active:scale-95'
                : 'opacity-40 border-slate-800 text-slate-600 pointer-events-none'
            }`}
          >
            <ArrowRight className="w-3.5 h-3.5 mb-0.5 text-purple-400" />
            <span className="text-[9px] font-mono opacity-80">
              {lifelines.skip > 0 ? `${lifelines.skip} ${t.left}` : t.used}
            </span>
          </button>
        </div>
      </div>

      {/* Hint Modal Overlay */}
      {showHintModal && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-30 flex items-center justify-center p-4">
          <div className="w-full max-w-sm p-5 rounded-2xl bg-slate-850 border border-amber-500/40 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>{t.hintClue}</span>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed mb-4">
              "{currentQuestion.hint}"
            </p>
            <button
              onClick={() => setShowHintModal(false)}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors"
            >
              {t.gotItContinue}
            </button>
          </div>
        </div>
      )}

      {/* Pause Modal Overlay */}
      {isPaused && (
        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md z-40 flex items-center justify-center p-4">
          <div className="w-full max-w-xs p-5 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl text-center">
            <h2 className="text-lg font-black text-white mb-1">{t.gamePaused}</h2>
            <p className="text-xs text-slate-400 mb-5">{t.takeBreather}</p>

            <div className="space-y-2">
              <button
                onClick={() => setIsPaused(false)}
                className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                {t.resumeQuiz}
              </button>

              <button
                onClick={() => {
                  setIsPaused(false);
                  setCurrentIndex(0);
                  setSelectedOption(null);
                  setIsAnswerLocked(false);
                  setTotalScore(0);
                  setCurrentStreak(0);
                  setAnswersHistory([]);
                  setTimeRemaining(totalTimePerQuestion);
                }}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors border border-slate-700"
              >
                <RotateCcw className="w-4 h-4" />
                {t.restartRound}
              </button>

              <button
                onClick={onExitQuiz}
                className="w-full py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors border border-rose-500/30"
              >
                <Home className="w-4 h-4" />
                {t.quitHome}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
