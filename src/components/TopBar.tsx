import React from 'react';
import { Flame, Coins, Volume2, VolumeX, Settings, ChevronLeft } from 'lucide-react';
import { SoundEngine } from '../utils/audio.js';
import { Haptics } from '../utils/haptics.js';

interface TopBarProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  streak: number;
  coins: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenSettings: () => void;
  language: 'hi' | 'en';
  onToggleLanguage: () => void;
  hapticsEnabled: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  title = 'TW OG GK',
  subtitle,
  showBack = false,
  onBack,
  streak,
  coins,
  soundEnabled,
  onToggleSound,
  onOpenSettings,
  language,
  onToggleLanguage,
  hapticsEnabled,
}) => {
  const handleSoundClick = () => {
    Haptics.tap(hapticsEnabled);
    if (!soundEnabled) {
      SoundEngine.playTick(true);
    }
    onToggleSound();
  };

  const handleSettingsClick = () => {
    Haptics.tap(hapticsEnabled);
    onOpenSettings();
  };

  const handleBackClick = () => {
    Haptics.tap(hapticsEnabled);
    onBack?.();
  };

  return (
    <header className="w-full px-4 py-2.5 bg-slate-900/95 border-b border-slate-800/80 flex items-center justify-between shrink-0 sticky top-0 z-20 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        {showBack && onBack ? (
          <button
            onClick={handleBackClick}
            aria-label="Go back"
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-200 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        ) : (
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center shadow-md shadow-rose-500/20">
            <span className="text-xs font-black text-slate-950 tracking-tighter">OG</span>
          </div>
        )}

        <div>
          <h1 className="text-base font-black tracking-tight leading-none text-white">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[10px] font-medium text-slate-400 leading-tight mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Streak Pill */}
        <div
          title={`${streak} Day Streak`}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold font-mono"
        >
          <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500 animate-pulse" />
          <span>{streak}</span>
        </div>

        {/* Coins Pill */}
        <div
          title={`${coins} OG Coins`}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 text-xs font-bold font-mono"
        >
          <Coins className="w-3.5 h-3.5 text-yellow-400" />
          <span>{coins}</span>
        </div>

        {/* Language Switcher Pill */}
        <button
          onClick={() => {
            Haptics.tap(hapticsEnabled);
            onToggleLanguage();
          }}
          aria-label={language === 'hi' ? 'Switch to English' : 'हिंदी में बदलें'}
          title={language === 'hi' ? 'हिंदी सक्रिय है (Switch to English)' : 'English active (Switch to Hindi)'}
          className="flex items-center gap-1 px-2 py-1 rounded-full bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-750 text-[11px] font-bold transition-all active:scale-95"
        >
          <span>{language === 'hi' ? '🇮🇳' : '🇬🇧'}</span>
          <span className="font-sans">{language === 'hi' ? 'हिंदी' : 'EN'}</span>
        </button>

        {/* Sound Toggle */}
        <button
          onClick={handleSoundClick}
          aria-label={soundEnabled ? 'Mute sound effects' : 'Unmute sound effects'}
          className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-500" />
          )}
        </button>

        {/* Settings Button */}
        <button
          onClick={handleSettingsClick}
          aria-label="Open settings"
          className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
