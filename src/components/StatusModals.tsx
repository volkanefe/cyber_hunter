import React, { useEffect } from 'react';
import { GameStatus, RunStats } from '../game/types';
import { Trophy, Skull, Play, RotateCcw, Home } from 'lucide-react';

interface StatusModalsProps {
  status: GameStatus;
  stats: RunStats;
  onResume: () => void;
  onRestart: () => void;
  onHome: () => void;
}

export const StatusModals: React.FC<StatusModalsProps> = ({
  status,
  stats,
  onResume,
  onRestart,
  onHome,
}) => {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (status === 'paused') {
        if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
          e.preventDefault();
          onResume();
        }
      } else if (status === 'gameover' || status === 'victory') {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onRestart();
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [status, onResume, onRestart]);

  if (status === 'paused') {
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs pointer-events-auto">
        <div className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900/95 p-6 shadow-2xl text-center space-y-6">
          <div>
            <span className="text-xs font-display tracking-widest text-cyan-400 uppercase font-semibold">
              SİSTEM BEKLEMEDE
            </span>
            <h2 className="text-3xl font-display font-black text-white mt-1">DURAKLATILDI</h2>
          </div>

          <div className="space-y-2.5">
            <button
              type="button"
              onClick={onResume}
              className="w-full py-3 px-4 rounded-xl font-display font-bold text-sm bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              DEVAM ET [P / ESC]
            </button>

            <button
              type="button"
              onClick={onRestart}
              className="w-full py-3 px-4 rounded-xl font-display font-bold text-sm bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              YENİDEN BAŞLAT [R]
            </button>

            <button
              type="button"
              onClick={onHome}
              className="w-full py-3 px-4 rounded-xl font-display font-bold text-sm bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Home className="w-4 h-4" />
              ANA MENÜ
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'victory') {
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xs pointer-events-auto">
        <div className="w-full max-w-md rounded-2xl border border-cyan-400/60 bg-slate-900/95 p-6 md:p-8 shadow-[0_0_50px_rgba(6,182,212,0.35)] text-center space-y-6">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-cyan-950 border border-cyan-400/80 flex items-center justify-center mb-3 text-cyan-300 shadow-[0_0_25px_rgba(6,182,212,0.6)]">
              <Trophy className="w-8 h-8" />
            </div>
            <span className="text-xs font-display tracking-widest text-cyan-400 uppercase font-semibold">
              GÖREV TAMAMLANDI
            </span>
            <h2 className="text-3xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-cyan-400 to-blue-400 mt-1">
              ZAFER!
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Titan Void Muhafızı yok edildi, uzay sektörü kurtarıldı.
            </p>
          </div>

          {/* Mastery Metrics */}
          <div className="grid grid-cols-2 gap-3 text-left">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] font-display text-slate-400 block uppercase">SON SKOR</span>
              <span className="text-lg font-display font-bold text-white tabular-nums">
                {stats.score.toLocaleString()}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] font-display text-slate-400 block uppercase">EN YÜKSEK SKOR</span>
              <span className="text-lg font-display font-bold text-cyan-300 tabular-nums">
                {stats.highScore.toLocaleString()}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] font-display text-slate-400 block uppercase">DÜŞMAN İMHASI</span>
              <span className="text-lg font-display font-bold text-white tabular-nums">
                {stats.kills}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] font-display text-slate-400 block uppercase">MAKSİMUM KOMBO</span>
              <span className="text-lg font-display font-bold text-amber-400 tabular-nums">
                x{stats.highestCombo}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <button
              type="button"
              data-start="true"
              onClick={onRestart}
              className="w-full py-3.5 px-6 rounded-xl font-display font-bold text-base bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_25px_rgba(6,182,212,0.6)] cursor-pointer transition-all"
            >
              YENİDEN OYNA
            </button>
            <button
              type="button"
              onClick={onHome}
              className="w-full py-2.5 px-4 rounded-xl font-display font-semibold text-xs text-slate-400 hover:text-white bg-transparent hover:bg-slate-800/50 cursor-pointer transition-all"
            >
              ANA MENÜYE DÖN
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'gameover') {
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xs pointer-events-auto">
        <div className="w-full max-w-md rounded-2xl border border-red-500/50 bg-slate-900/95 p-6 md:p-8 shadow-[0_0_50px_rgba(239,68,68,0.3)] text-center space-y-6">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-red-950/80 border border-red-500/80 flex items-center justify-center mb-3 text-red-400 shadow-[0_0_25px_rgba(239,68,68,0.5)]">
              <Skull className="w-8 h-8" />
            </div>
            <span className="text-xs font-display tracking-widest text-red-400 uppercase font-semibold">
              GÖVDE İMHASI
            </span>
            <h2 className="text-3xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-red-200 via-red-400 to-rose-600 mt-1">
              OYUN BİTTİ
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Gemi kritik hasar aldı ve parçalandı.
            </p>
          </div>

          {/* Progress Toward Goal Metrics */}
          <div className="grid grid-cols-2 gap-3 text-left">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] font-display text-slate-400 block uppercase">ULAŞILAN DALGA</span>
              <span className="text-lg font-display font-bold text-white tabular-nums">
                {stats.waveReached} / 5
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] font-display text-slate-400 block uppercase">SKOR</span>
              <span className="text-lg font-display font-bold text-white tabular-nums">
                {stats.score.toLocaleString()}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] font-display text-slate-400 block uppercase">YOK EDİLEN</span>
              <span className="text-lg font-display font-bold text-white tabular-nums">
                {stats.kills}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] font-display text-slate-400 block uppercase">EN YÜKSEK SKOR</span>
              <span className="text-lg font-display font-bold text-cyan-300 tabular-nums">
                {stats.highScore.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <button
              type="button"
              data-start="true"
              onClick={onRestart}
              className="w-full py-3.5 px-6 rounded-xl font-display font-bold text-base bg-red-600 hover:bg-red-500 text-white shadow-[0_0_25px_rgba(239,68,68,0.5)] cursor-pointer transition-all"
            >
              TEKRAR DENE
            </button>
            <button
              type="button"
              onClick={onHome}
              className="w-full py-2.5 px-4 rounded-xl font-display font-semibold text-xs text-slate-400 hover:text-white bg-transparent hover:bg-slate-800/50 cursor-pointer transition-all"
            >
              ANA MENÜYE DÖN
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
