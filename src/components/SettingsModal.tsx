import React, { useState } from 'react';
import {
  X,
  Volume2,
  VolumeX,
  Vibrate,
  Clock,
  Smartphone,
  Trash2,
  Info,
  ShieldAlert,
  Languages,
} from 'lucide-react';
import { AppSettings, Language } from '../types/quiz.js';
import { Haptics } from '../utils/haptics.js';
import { TRANSLATIONS } from '../data/translations.js';
import { ApkBuildSection } from './ApkBuildSection.js';

interface SettingsModalProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onResetAllData: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onResetAllData,
  onClose,
}) => {
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const t = TRANSLATIONS[settings.language];

  return (
    <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-750 shadow-2xl p-5 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div>
            <h2 className="text-base font-black text-white">{t.settings}</h2>
            <p className="text-[10px] text-slate-400">{t.settingsSub}</p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close settings"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3.5 max-h-[70vh] overflow-y-auto pr-1">
          {/* APK Build & Download Section */}
          <ApkBuildSection
            language={settings.language}
            soundEnabled={settings.soundEnabled}
            hapticsEnabled={settings.hapticsEnabled}
          />

          {/* Language selector */}
          <div className="p-3 rounded-2xl bg-slate-850 border border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <Languages className="w-4 h-4 text-cyan-400" />
              <div>
                <span className="text-xs font-bold text-white block">{t.language}</span>
                <span className="text-[10px] text-slate-400">{t.languageSub}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                onClick={() => {
                  Haptics.tap(settings.hapticsEnabled);
                  onUpdateSettings({ language: 'hi' });
                }}
                className={`py-2 px-3 rounded-xl flex items-center justify-center gap-2 border text-xs font-bold transition-all ${
                  settings.language === 'hi'
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-sm'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="text-sm">🇮🇳</span>
                <span>हिंदी (Hindi)</span>
              </button>

              <button
                onClick={() => {
                  Haptics.tap(settings.hapticsEnabled);
                  onUpdateSettings({ language: 'en' });
                }}
                className={`py-2 px-3 rounded-xl flex items-center justify-center gap-2 border text-xs font-bold transition-all ${
                  settings.language === 'en'
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-sm'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="text-sm">🇬🇧</span>
                <span>English</span>
              </button>
            </div>
          </div>

          {/* Audio toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-850 border border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-slate-800 text-slate-200">
                {settings.soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-500" />
                )}
              </div>
              <div>
                <span className="text-xs font-bold text-white block">{t.soundEffects}</span>
                <span className="text-[10px] text-slate-400">{t.soundEffectsSub}</span>
              </div>
            </div>

            <button
              onClick={() => {
                Haptics.tap(settings.hapticsEnabled);
                onUpdateSettings({ soundEnabled: !settings.soundEnabled });
              }}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                settings.soundEnabled ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.soundEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Haptics toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-850 border border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-slate-800 text-slate-200">
                <Vibrate className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">{t.haptics}</span>
                <span className="text-[10px] text-slate-400">{t.hapticsSub}</span>
              </div>
            </div>

            <button
              onClick={() => {
                const nextVal = !settings.hapticsEnabled;
                Haptics.tap(nextVal);
                onUpdateSettings({ hapticsEnabled: nextVal });
              }}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                settings.hapticsEnabled ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.hapticsEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Timer Speed setting */}
          <div className="p-3 rounded-2xl bg-slate-850 border border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-white">{t.timerDuration}</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { label: settings.language === 'hi' ? 'त्वरित' : 'Blitz', duration: 12 },
                { label: settings.language === 'hi' ? 'मानक' : 'Standard', duration: 20 },
                { label: settings.language === 'hi' ? 'विश्राम' : 'Relaxed', duration: 30 },
              ].map((opt) => (
                <button
                  key={opt.duration}
                  onClick={() => {
                    Haptics.tap(settings.hapticsEnabled);
                    onUpdateSettings({ timerDuration: opt.duration });
                  }}
                  className={`py-2 px-1 rounded-xl text-center border text-xs font-bold transition-all ${
                    settings.timerDuration === opt.duration
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="block">{opt.label}</span>
                  <span className="text-[10px] font-mono opacity-80">{opt.duration}s</span>
                </button>
              ))}
            </div>
          </div>

          {/* Phone Frame View toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-850 border border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-slate-800 text-slate-200">
                <Smartphone className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">{t.phoneFrame}</span>
                <span className="text-[10px] text-slate-400">{t.phoneFrameSub}</span>
              </div>
            </div>

            <button
              onClick={() => {
                Haptics.tap(settings.hapticsEnabled);
                onUpdateSettings({ phoneFrame: !settings.phoneFrame });
              }}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                settings.phoneFrame ? 'bg-purple-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.phoneFrame ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Reset progress */}
          <div className="pt-2">
            {!showConfirmReset ? (
              <button
                onClick={() => setShowConfirmReset(true)}
                className="w-full py-2.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {t.resetStats}
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/60 space-y-2">
                <div className="flex items-center gap-1.5 text-rose-400 text-xs font-bold">
                  <ShieldAlert className="w-4 h-4" />
                  <span>{t.resetConfirm}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      Haptics.tap(settings.hapticsEnabled);
                      onResetAllData();
                      setShowConfirmReset(false);
                      onClose();
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
                  >
                    {t.yesReset}
                  </button>
                  <button
                    onClick={() => setShowConfirmReset(false)}
                    className="flex-1 py-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-300 font-bold text-xs"
                  >
                    {t.cancel}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* App Footer Info */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span>TW OG GK v1.0 • Android Edition</span>
          <span>{settings.language === 'hi' ? '🇮🇳 हिंदी संस्करण' : 'Offline Ready'}</span>
        </div>
      </div>
    </div>
  );
};
