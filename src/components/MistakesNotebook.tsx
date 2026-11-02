import React from 'react';
import { BookOpen, Play, Trash2, CheckCircle2, Info, Sparkles } from 'lucide-react';
import { UserAnswerRecord, Language } from '../types/quiz.js';
import { Haptics } from '../utils/haptics.js';
import { TRANSLATIONS } from '../data/translations.js';

interface MistakesNotebookProps {
  mistakes: UserAnswerRecord[];
  onStartMistakesQuiz: () => void;
  onRemoveMistake: (questionId: string) => void;
  hapticsEnabled: boolean;
  language: Language;
}

export const MistakesNotebook: React.FC<MistakesNotebookProps> = ({
  mistakes,
  onStartMistakesQuiz,
  onRemoveMistake,
  hapticsEnabled,
  language,
}) => {
  const t = TRANSLATIONS[language];

  return (
    <div className="flex-1 min-h-0 p-4 bg-slate-900 overflow-y-auto select-none space-y-4">
      {/* Header Banner */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-rose-500/20 via-amber-500/10 to-slate-800 border border-rose-500/30 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-rose-400 text-xs font-black uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4" />
            <span>{t.mistakesNotebook}</span>
          </div>
          <h2 className="text-lg font-black text-white">
            {language === 'hi' ? 'पुनरावलोकन एवं अभ्यास' : 'Review & Conquer'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {t.mistakesNotebookDesc}
          </p>
        </div>

        <div className="text-center bg-slate-900/80 px-3 py-2 rounded-2xl border border-slate-700/80">
          <span className="text-base font-black font-mono text-rose-400 block">
            {mistakes.length}
          </span>
          <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">
            {t.toMaster}
          </span>
        </div>
      </div>

      {/* Action to launch quiz if mistakes exist */}
      {mistakes.length > 0 && (
        <button
          onClick={() => {
            Haptics.tap(hapticsEnabled);
            onStartMistakesQuiz();
          }}
          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20 active:scale-[0.98] transition-all"
        >
          <Play className="w-4 h-4 fill-slate-950" />
          <span>
            {language === 'hi'
              ? `सभी ${mistakes.length} गलत प्रश्नों का अभ्यास करें`
              : `Practice All ${mistakes.length} Missed Questions`}
          </span>
        </button>
      )}

      {/* List of mistakes */}
      {mistakes.length === 0 ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 mx-auto flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-white">{t.cleanSlate}</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            {t.cleanSlateDesc}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {mistakes.map((item, index) => {
            const letters = ['A', 'B', 'C', 'D'];

            return (
              <div
                key={item.questionId || index}
                className="p-3.5 rounded-2xl bg-slate-850 border border-slate-750 shadow-md relative"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-wider">
                    {t.question} #{index + 1}
                  </span>

                  <button
                    onClick={() => {
                      Haptics.tap(hapticsEnabled);
                      onRemoveMistake(item.questionId);
                    }}
                    aria-label="Remove from notebook"
                    title={language === 'hi' ? 'सीखा हुआ चिह्नित करें / हटाएं' : 'Mark as Mastered / Remove'}
                    className="p-1 rounded-lg hover:bg-slate-750 text-slate-400 hover:text-emerald-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs md:text-sm font-semibold text-slate-100 mb-2.5">
                  {item.questionText}
                </p>

                {/* Answers readout */}
                <div className="space-y-1 mb-2.5">
                  <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs flex items-center justify-between text-emerald-300">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[10px]">
                        {letters[item.correctIndex]}.
                      </span>
                      <span>{item.options[item.correctIndex]}</span>
                    </div>
                    <span className="text-[9px] uppercase font-bold text-emerald-400">
                      {t.correct}
                    </span>
                  </div>

                  {item.selectedIndex !== null && item.selectedIndex !== item.correctIndex && (
                    <div className="p-2 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs flex items-center justify-between text-rose-300 line-through">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[10px]">
                          {letters[item.selectedIndex]}.
                        </span>
                        <span>{item.options[item.selectedIndex]}</span>
                      </div>
                      <span className="text-[9px] uppercase font-bold text-rose-400">
                        {t.yourChoice}
                      </span>
                    </div>
                  )}
                </div>

                {/* Fact Note */}
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-2 text-xs text-slate-300">
                  <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed text-slate-300">
                    {item.explanation}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
