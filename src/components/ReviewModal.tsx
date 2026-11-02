import React, { useState } from 'react';
import { X, CheckCircle2, XCircle, Info, Filter, ArrowLeft } from 'lucide-react';
import { UserAnswerRecord, Language } from '../types/quiz.js';
import { TRANSLATIONS } from '../data/translations.js';

interface ReviewModalProps {
  answers: UserAnswerRecord[];
  onClose: () => void;
  title?: string;
  language: Language;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  answers,
  onClose,
  title,
  language,
}) => {
  const [filter, setFilter] = useState<'all' | 'mistakes' | 'correct'>('all');
  const t = TRANSLATIONS[language];

  const filteredAnswers = answers.filter((ans) => {
    if (filter === 'mistakes') return !ans.isCorrect;
    if (filter === 'correct') return ans.isCorrect;
    return true;
  });

  const correctCount = answers.filter((a) => a.isCorrect).length;
  const mistakeCount = answers.length - correctCount;
  const headerTitle = title || (language === 'hi' ? 'क्विज़ समीक्षा एवं रोचक तथ्य' : 'Quiz Review & OG Facts');

  return (
    <div className="absolute inset-0 bg-slate-950 z-50 flex flex-col overflow-hidden animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            aria-label="Back to results"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-sm font-black text-white">{headerTitle}</h2>
            <p className="text-[10px] text-slate-400">
              {correctCount} {t.correct} • {mistakeCount} {t.mistakes}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          aria-label="Close review"
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800/80 flex items-center gap-2 shrink-0">
        <Filter className="w-3.5 h-3.5 text-slate-500 mr-1" />
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
            filter === 'all'
              ? 'bg-cyan-500 text-slate-950'
              : 'bg-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          {t.all} ({answers.length})
        </button>
        <button
          onClick={() => setFilter('mistakes')}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
            filter === 'mistakes'
              ? 'bg-rose-500 text-white'
              : 'bg-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          {t.mistakes} ({mistakeCount})
        </button>
        <button
          onClick={() => setFilter('correct')}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
            filter === 'correct'
              ? 'bg-emerald-500 text-slate-950'
              : 'bg-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          {t.correct} ({correctCount})
        </button>
      </div>

      {/* Questions Scrollable List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {filteredAnswers.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            {language === 'hi' ? 'चुने गए फ़िल्टर के अनुसार कोई प्रश्न नहीं है।' : 'No questions match the selected filter.'}
          </div>
        ) : (
          filteredAnswers.map((item, index) => {
            const letters = ['A', 'B', 'C', 'D'];

            return (
              <div
                key={item.questionId || index}
                className="p-3.5 rounded-2xl bg-slate-850 border border-slate-800 shadow-md"
              >
                {/* Header status */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono font-bold text-slate-400">
                    {t.question} #{index + 1}
                  </span>

                  {item.isCorrect ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {t.correct} (+{item.scoreEarned} pts)
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                      <XCircle className="w-3.5 h-3.5" /> {t.incorrect}
                    </span>
                  )}
                </div>

                {/* Question */}
                <p className="text-xs md:text-sm font-semibold text-slate-200 mb-3 leading-snug">
                  {item.questionText}
                </p>

                {/* Options list */}
                <div className="space-y-1.5 mb-3">
                  {item.options.map((opt, optIdx) => {
                    const isCorrectAnswer = optIdx === item.correctIndex;
                    const isUserChoice = optIdx === item.selectedIndex;

                    let optClass = 'bg-slate-900/60 border-slate-800 text-slate-400';

                    if (isCorrectAnswer) {
                      optClass = 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300 font-bold';
                    } else if (isUserChoice && !isCorrectAnswer) {
                      optClass = 'bg-rose-950/60 border-rose-500/60 text-rose-300 font-medium line-through';
                    }

                    return (
                      <div
                        key={optIdx}
                        className={`p-2 rounded-xl border text-xs flex items-center justify-between ${optClass}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[10px] w-4">
                            {letters[optIdx]}.
                          </span>
                          <span>{opt}</span>
                        </div>

                        {isCorrectAnswer && (
                          <span className="text-[10px] uppercase font-bold text-emerald-400">
                            {t.correctAnswer}
                          </span>
                        )}
                        {isUserChoice && !isCorrectAnswer && (
                          <span className="text-[10px] uppercase font-bold text-rose-400">
                            {t.yourChoice}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation / Fact */}
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-2 text-xs text-slate-300">
                  <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-cyan-300 block text-[11px] mb-0.5">
                      {language === 'hi' ? 'रोचक तथ्य एवं ज्ञान:' : 'OG GK Fact Insight:'}
                    </span>
                    <p className="text-[11px] leading-relaxed text-slate-300">
                      {item.explanation}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
