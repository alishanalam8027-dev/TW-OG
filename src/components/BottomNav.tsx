import React from 'react';
import { Home, Compass, Map, BookOpen, Trophy } from 'lucide-react';
import { Haptics } from '../utils/haptics.js';

import { Language } from '../types/quiz.js';
import { TRANSLATIONS } from '../data/translations.js';

export type TabType = 'home' | 'campaign' | 'categories' | 'notebook' | 'profile';

interface BottomNavProps {
  currentTab: TabType;
  onChangeTab: (tab: TabType) => void;
  mistakesCount: number;
  hapticsEnabled: boolean;
  language: Language;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onChangeTab,
  mistakesCount,
  hapticsEnabled,
  language,
}) => {
  const t = TRANSLATIONS[language];

  const tabs = [
    { id: 'home' as TabType, label: t.play, icon: Home },
    { id: 'campaign' as TabType, label: t.campaign, icon: Map },
    { id: 'categories' as TabType, label: t.topics, icon: Compass },
    { id: 'notebook' as TabType, label: t.review, icon: BookOpen, badge: mistakesCount },
    { id: 'profile' as TabType, label: t.badges, icon: Trophy },
  ];

  const handleSelect = (id: TabType) => {
    Haptics.tap(hapticsEnabled);
    onChangeTab(id);
  };

  return (
    <nav
      aria-label="Bottom Navigation"
      className="w-full bg-slate-900 border-t border-slate-800/80 px-2 py-1 flex items-center justify-around shrink-0 z-20 select-none"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => handleSelect(tab.id)}
            aria-label={tab.label}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 relative ${
              isActive
                ? 'text-cyan-400 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-200 font-medium'
            }`}
          >
            <div
              className={`p-1 rounded-xl transition-colors ${
                isActive ? 'bg-cyan-500/15' : 'bg-transparent'
              }`}
            >
              <Icon className="w-5 h-5" />
            </div>

            <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>

            {/* Badge for mistakes if any */}
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className="absolute top-0.5 right-2 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-[9px] font-black text-white flex items-center justify-center">
                {tab.badge > 99 ? '99+' : tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};
