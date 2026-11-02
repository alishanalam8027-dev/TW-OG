import React from 'react';
import {
  Landmark,
  Atom,
  Globe2,
  Cpu,
  Trophy,
  Palette,
  Play,
  Sparkles,
} from 'lucide-react';
import { Category, Language } from '../types/quiz.js';
import { CATEGORIES } from '../data/gkQuestions.js';
import { Haptics } from '../utils/haptics.js';
import { TRANSLATIONS } from '../data/translations.js';

interface CategoriesViewProps {
  onSelectCategory: (category: Category) => void;
  hapticsEnabled: boolean;
  language: Language;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Landmark,
  Atom,
  Globe2,
  Cpu,
  Trophy,
  Palette,
};

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  onSelectCategory,
  hapticsEnabled,
  language,
}) => {
  const t = TRANSLATIONS[language];

  return (
    <div className="flex-1 min-h-0 p-4 bg-slate-900 overflow-y-auto select-none space-y-4">
      {/* Header Banner */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-cyan-500/20 via-blue-500/10 to-slate-800 border border-cyan-500/30">
        <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-black uppercase tracking-wider mb-1">
          <Sparkles className="w-4 h-4" />
          <span>{language === 'hi' ? 'विशेष ज्ञान अखाड़े' : 'Specialized Arenas'}</span>
        </div>
        <h2 className="text-lg font-black text-white">{t.topicArenas}</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          {t.categoriesSub}
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {CATEGORIES.map((cat) => {
          const IconComponent = ICON_MAP[cat.icon] || Sparkles;
          const categoryTitle = language === 'hi' ? cat.titleHi : cat.title;
          const categorySubtitle = language === 'hi' ? cat.subtitleHi : cat.subtitle;

          return (
            <div
              key={cat.id}
              className="p-4 rounded-2xl bg-slate-850 border border-slate-700/80 hover:border-slate-600 transition-all duration-200 flex flex-col justify-between shadow-md"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-md"
                    style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                  >
                    <IconComponent className="w-5 h-5" />
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cat.badgeBg}`}>
                    {language === 'hi' ? '10 प्रश्न' : '10 Questions'}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white mb-1">{categoryTitle}</h3>
                <p className="text-xs text-slate-400 leading-snug mb-3">
                  {categorySubtitle}
                </p>
              </div>

              <button
                onClick={() => {
                  Haptics.tap(hapticsEnabled);
                  onSelectCategory(cat.id);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 active:scale-95 transition-all"
              >
                <Play className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
                <span>
                  {language === 'hi' ? `${categoryTitle.split(' ')[0]} क्विज़ शुरू करें` : `Start ${cat.title.split(' ')[0]} Quiz`}
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
