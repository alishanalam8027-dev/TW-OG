import React, { useEffect, useState } from 'react';
import { Wifi, BatteryMedium, Signal, Smartphone } from 'lucide-react';

interface AndroidFrameProps {
  children: React.ReactNode;
  isFrameActive: boolean;
  onToggleFrame: () => void;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
  isFrameActive,
  onToggleFrame,
}) => {
  const [timeStr, setTimeStr] = useState('12:00');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen w-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-0 md:p-3 overflow-hidden transition-colors">
      {/* Frame wrapper */}
      <div
        className={`w-full transition-all duration-300 flex flex-col overflow-hidden ${
          isFrameActive
            ? 'max-w-[410px] h-[860px] max-h-[94vh] rounded-[48px] border-[10px] border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.08)] bg-slate-900 relative'
            : 'max-w-2xl h-full md:h-[92vh] md:max-h-[92vh] md:rounded-3xl border-0 md:border md:border-slate-800/80 shadow-2xl bg-slate-900 relative'
        }`}
      >
        {/* Android Status Bar */}
        <header aria-label="Android Status Bar" className="w-full h-10 px-5 flex items-center justify-between text-xs font-semibold text-slate-300 select-none bg-slate-900 z-30 shrink-0 border-b border-slate-850">
          <span className="font-mono tracking-tight text-[12px]">{timeStr}</span>

          {/* Camera Punch Hole in phone frame */}
          {isFrameActive && (
            <div className="w-3.5 h-3.5 rounded-full bg-black border border-slate-800 shadow-inner flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <Signal className="w-3 h-3 text-slate-300" />
            <Wifi className="w-3 h-3 text-slate-300" />
            <span className="text-[10px] font-mono mr-0.5">5G</span>
            <BatteryMedium className="w-3.5 h-3.5 text-emerald-400" />
          </div>
        </header>

        {/* App Content */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden relative">
          {children}
        </div>

        {/* Android Bottom Gesture Navigation Pill */}
        <footer aria-label="Android Navigation Bar" className="w-full h-5 flex items-center justify-center bg-slate-900 shrink-0 z-30">
          <div className="w-28 h-1 rounded-full bg-slate-600/70 hover:bg-slate-500 transition-colors cursor-pointer" />
        </footer>
      </div>

      {/* Frame Mode Floating Switcher for desktop convenience */}
      <div className="hidden md:flex items-center gap-2 mt-3 text-xs text-slate-400 select-none">
        <button
          onClick={onToggleFrame}
          aria-label="Toggle Android device frame view"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 shadow-sm transition-all"
        >
          <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
          <span>{isFrameActive ? 'Switch to Expanded View' : 'Switch to Android Frame'}</span>
        </button>
      </div>
    </div>
  );
};
