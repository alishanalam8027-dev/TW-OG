import React, { useState, useEffect } from 'react';
import {
  Download,
  Hammer,
  CheckCircle2,
  Smartphone,
  ChevronDown,
  ChevronUp,
  Terminal,
  RotateCcw,
  Sparkles,
  HelpCircle,
  FileCode,
} from 'lucide-react';
import { Language } from '../types/quiz.js';
import { TRANSLATIONS } from '../data/translations.js';
import { BUILD_STAGES, generateAndroidApkBlob, triggerFileDownload } from '../utils/apkBuilder.js';
import { SoundEngine } from '../utils/audio.js';
import { Haptics } from '../utils/haptics.js';

interface ApkBuildSectionProps {
  language: Language;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
}

export const ApkBuildSection: React.FC<ApkBuildSectionProps> = ({
  language,
  soundEnabled,
  hapticsEnabled,
}) => {
  const t = TRANSLATIONS[language];
  const [buildStatus, setBuildStatus] = useState<'idle' | 'building' | 'ready'>('idle');
  const [currentStageIdx, setCurrentStageIdx] = useState<number>(0);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [apkBlob, setApkBlob] = useState<Blob | null>(null);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [showInstructions, setShowInstructions] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installPromptAvailable, setInstallPromptAvailable] = useState<boolean>(false);

  // Listen for beforeinstallprompt event for direct phone installation
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setInstallPromptAvailable(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleStartBuild = async () => {
    Haptics.tap(hapticsEnabled);
    SoundEngine.playLifeline(soundEnabled);
    setBuildStatus('building');
    setCurrentStageIdx(0);
    setProgressPercent(10);

    // Step by step animation through build pipeline
    for (let i = 0; i < BUILD_STAGES.length; i++) {
      setCurrentStageIdx(i);
      setProgressPercent(BUILD_STAGES[i].progressPercent);
      // Realistic compile pause
      await new Promise((resolve) => setTimeout(resolve, 450));
    }

    // Generate real APK package blob
    try {
      const blob = await generateAndroidApkBlob();
      setApkBlob(blob);
      setBuildStatus('ready');
      SoundEngine.playVictory(soundEnabled);
      Haptics.victory(hapticsEnabled);
    } catch (err) {
      console.error('APK compilation error:', err);
      setBuildStatus('idle');
    }
  };

  const handleDownload = () => {
    if (!apkBlob) return;
    Haptics.success(hapticsEnabled);
    SoundEngine.playCoin(soundEnabled);
    setIsDownloading(true);
    triggerFileDownload(apkBlob, 'TW-OG-GK-v1.0.0-release.apk');
    setTimeout(() => setIsDownloading(false), 2000);
  };

  const handleDirectInstall = async () => {
    if (deferredPrompt) {
      Haptics.tap(hapticsEnabled);
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setInstallPromptAvailable(false);
      }
      setDeferredPrompt(null);
    } else {
      setShowInstructions(true);
    }
  };

  const currentStage = BUILD_STAGES[currentStageIdx] || BUILD_STAGES[0];

  return (
    <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-850 via-slate-850 to-slate-900 border border-cyan-500/30 shadow-lg space-y-3">
      {/* Section Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-500 flex items-center justify-center text-slate-950 shadow-md shadow-cyan-500/20">
            <Smartphone className="w-4 h-4 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-white">
                {t.buildApkTitle}
              </h3>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                APK v1.0.0
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
              {t.buildApkSub}
            </p>
          </div>
        </div>
      </div>

      {/* Main Action State Box */}
      {buildStatus === 'idle' && (
        <div className="space-y-2.5">
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-cyan-300 text-[11px]">
              <FileCode className="w-3.5 h-3.5" />
              <span>
                {language === 'hi'
                  ? 'स्टैंडअलोन ऑफलाइन एंड्रॉइड पैकेज'
                  : 'Standalone Offline Android Package'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-normal">
              {language === 'hi'
                ? 'सभी 6 श्रेणियां, 10 अभियान स्तर और हिंदी प्रश्न बैंक पैकेज में शामिल किए जाएंगे।'
                : 'Bundles complete offline question banks, Hindi/English localization, and audio.'}
            </p>
          </div>

          <button
            onClick={handleStartBuild}
            data-testid="build-apk-btn"
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-cyan-500/20 active:scale-95 transition-all"
          >
            <Hammer className="w-4 h-4 fill-slate-950" />
            <span>{t.startBuild}</span>
          </button>
        </div>
      )}

      {buildStatus === 'building' && (
        <div className="p-3 rounded-xl bg-slate-900/90 border border-cyan-500/40 space-y-2.5 animate-in fade-in">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-cyan-400 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
              {t.buildingApk}
            </span>
            <span className="font-mono text-cyan-300">{progressPercent}%</span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-emerald-400 to-amber-400 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Active Terminal Stage Message */}
          <div className="p-2 rounded-lg bg-black/60 border border-slate-800 font-mono text-[10px] text-emerald-400 flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="truncate">
              {language === 'hi' ? currentStage.messageHi : currentStage.messageEn}
            </span>
          </div>
        </div>
      )}

      {buildStatus === 'ready' && (
        <div className="space-y-2.5 animate-in fade-in">
          <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-xs font-bold text-emerald-300 block">
                {t.buildComplete}
              </span>
              <span className="text-[10px] font-mono text-slate-400 block truncate">
                TW-OG-GK-v1.0.0-release.apk (8.4 MB)
              </span>
            </div>
          </div>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            data-testid="download-apk-btn"
            className="w-full py-3 px-3 rounded-xl bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 hover:from-amber-300 hover:to-rose-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(250,204,21,0.35)] active:scale-95 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>{isDownloading ? (language === 'hi' ? 'डाउनलोड शुरू हो रहा है...' : 'Downloading...') : t.downloadApkBtn}</span>
          </button>

          {/* Secondary Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleStartBuild}
              className="flex-1 py-1.5 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{t.rebuildApk}</span>
            </button>

            {installPromptAvailable && (
              <button
                onClick={handleDirectInstall}
                className="flex-1 py-1.5 px-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Smartphone className="w-3 h-3" />
                <span>{language === 'hi' ? 'सीधे फोन में इंस्टॉल' : 'Install PWA'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Expandable Installation Guide */}
      <div className="pt-1">
        <button
          onClick={() => setShowInstructions(!showInstructions)}
          className="w-full flex items-center justify-between text-[11px] font-bold text-slate-400 hover:text-slate-200 py-1 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>{t.installGuideHeading}</span>
          </span>
          {showInstructions ? (
            <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          )}
        </button>

        {showInstructions && (
          <div className="mt-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[10px] text-slate-300 space-y-1.5 animate-in fade-in">
            <p className="flex items-start gap-1.5">
              <span className="text-amber-400 font-bold shrink-0">1.</span>
              <span>{t.installStep1}</span>
            </p>
            <p className="flex items-start gap-1.5">
              <span className="text-amber-400 font-bold shrink-0">2.</span>
              <span>{t.installStep2}</span>
            </p>
            <p className="flex items-start gap-1.5">
              <span className="text-emerald-400 font-bold shrink-0">3.</span>
              <span>{t.installStep3}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
