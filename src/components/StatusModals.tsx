import React, { useEffect } from 'react';
import { GameStatus, RunStats } from '../game/types';
import { Trophy, Skull, Play, RotateCcw, Home, Star, ArrowRight, Map } from 'lucide-react';
import { CAMPAIGN_SECTORS, getSectorById } from '../game/sectors';

interface StatusModalsProps {
  status: GameStatus;
  stats: RunStats;
  currentSectorId?: number;
  starsEarned?: number;
  onResume: () => void;
  onRestart: () => void;
  onHome: () => void;
  onNextSector?: (nextSectorId: number) => void;
  onOpenSectorMap?: () => void;
}

export const StatusModals: React.FC<StatusModalsProps> = ({
  status,
  stats,
  currentSectorId = 1,
  starsEarned = 1,
  onResume,
  onRestart,
  onHome,
  onNextSector,
  onOpenSectorMap,
}) => {
  const currentSector = getSectorById(currentSectorId);
  const isFinalCampaignSector = currentSectorId >= CAMPAIGN_SECTORS.length;
  const hasNextSector = !isFinalCampaignSector && onNextSector;

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (status === 'paused') {
        if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
          e.preventDefault();
          onResume();
        }
      } else if (status === 'gameover') {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onRestart();
        }
      } else if (status === 'victory') {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (hasNextSector) {
            onNextSector(currentSectorId + 1);
          } else {
            onRestart();
          }
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [status, onResume, onRestart, hasNextSector, onNextSector, currentSectorId]);

  if (status === 'paused') {
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs pointer-events-auto">
        <div className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900/95 p-6 shadow-2xl text-center space-y-6">
          <div>
            <span className="text-xs font-display tracking-widest text-cyan-400 uppercase font-semibold">
              SİSTEM BEKLEMEDE
            </span>
            <h2 className="text-3xl font-display font-black text-white mt-1">DURAKLATILDI</h2>
            <p className="text-xs text-slate-400 mt-1">
              {currentSector.code}: {currentSector.nameTr}
            </p>
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

            {onOpenSectorMap && (
              <button
                type="button"
                onClick={onOpenSectorMap}
                className="w-full py-2.5 px-4 rounded-xl font-display font-bold text-xs bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Map className="w-4 h-4 text-cyan-400" />
                SEKTÖR HARİTASI
              </button>
            )}

            <button
              type="button"
              onClick={onRestart}
              className="w-full py-2.5 px-4 rounded-xl font-display font-bold text-xs bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              YENİDEN BAŞLAT [R]
            </button>

            <button
              type="button"
              onClick={onHome}
              className="w-full py-2.5 px-4 rounded-xl font-display font-bold text-xs bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 flex items-center justify-center gap-2 cursor-pointer transition-all"
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
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md pointer-events-auto">
        <div className="w-full max-w-md rounded-2xl border border-cyan-400/60 bg-slate-900/95 p-6 md:p-8 shadow-[0_0_50px_rgba(6,182,212,0.35)] text-center space-y-5">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-cyan-950 border border-cyan-400/80 flex items-center justify-center mb-2 text-cyan-300 shadow-[0_0_25px_rgba(6,182,212,0.6)] animate-pulse">
              <Trophy className="w-8 h-8" />
            </div>

            <span className="text-[11px] font-display tracking-widest text-cyan-400 uppercase font-bold">
              {currentSector.code} TEMİZLENDİ!
            </span>
            <h2 className="text-2xl md:text-3xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-cyan-400 to-blue-400 mt-0.5">
              {currentSector.nameTr}
            </h2>

            {/* Stars display with animation */}
            <div className="flex items-center gap-2 mt-3 p-2 px-4 rounded-xl bg-slate-950/80 border border-amber-500/40">
              {[1, 2, 3].map((starIdx) => (
                <Star
                  key={starIdx}
                  className={`w-7 h-7 transition-all duration-300 ${
                    starIdx <= starsEarned
                      ? 'fill-amber-400 text-amber-400 scale-110 drop-shadow-[0_0_12px_rgba(245,158,11,0.8)]'
                      : 'text-slate-700'
                  }`}
                />
              ))}
              <span className="ml-1 text-xs font-display font-bold text-amber-300">
                {starsEarned} / 3 YILDIZ
              </span>
            </div>

            {isFinalCampaignSector ? (
              <div className="mt-2 text-xs font-bold text-amber-400 font-display animate-bounce">
                👑 TEBRİKLER! TÜM 10 SEKTÖRÜ TAMAMLAYIP GALAKSİYİ KURTARDINIZ!
              </div>
            ) : (
              <p className="text-xs text-slate-400 mt-2">
                Sonraki sektörün koordinatları ve erişim şifreleri açıldı.
              </p>
            )}
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-2.5 text-left">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] font-display text-slate-400 block uppercase">SEKTÖR SKORU</span>
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

          <div className="flex flex-col gap-2 pt-1">
            {hasNextSector && (
              <button
                type="button"
                data-start="true"
                onClick={() => onNextSector(currentSectorId + 1)}
                className="w-full py-3.5 px-6 rounded-xl font-display font-bold text-sm bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 shadow-[0_0_25px_rgba(6,182,212,0.6)] flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <span>SONRAKİ BÖLÜM ({currentSectorId + 1}/10)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onRestart}
                className="py-2.5 px-4 rounded-xl font-display font-bold text-xs bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>TEKRAR OYNA</span>
              </button>

              {onOpenSectorMap && (
                <button
                  type="button"
                  onClick={onOpenSectorMap}
                  className="py-2.5 px-4 rounded-xl font-display font-bold text-xs bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                >
                  <Map className="w-3.5 h-3.5 text-cyan-400" />
                  <span>BÖLÜM SEÇ</span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={onHome}
              className="w-full py-2 px-4 rounded-xl font-display font-semibold text-xs text-slate-400 hover:text-white bg-transparent hover:bg-slate-800/50 cursor-pointer transition-all"
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
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md pointer-events-auto">
        <div className="w-full max-w-md rounded-2xl border border-red-500/50 bg-slate-900/95 p-6 md:p-8 shadow-[0_0_50px_rgba(239,68,68,0.3)] text-center space-y-5">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-red-950/80 border border-red-500/80 flex items-center justify-center mb-2 text-red-400 shadow-[0_0_25px_rgba(239,68,68,0.5)]">
              <Skull className="w-8 h-8" />
            </div>
            <span className="text-[11px] font-display tracking-widest text-red-400 uppercase font-bold">
              GÖVDE İMHASI · {currentSector.code}
            </span>
            <h2 className="text-2xl md:text-3xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-red-200 via-red-400 to-rose-600 mt-0.5">
              OYUN BİTTİ
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Gemi kritik hasar alarak parçalandı.
            </p>
          </div>

          {/* Progress Toward Goal Metrics */}
          <div className="grid grid-cols-2 gap-2.5 text-left">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] font-display text-slate-400 block uppercase">ULAŞILAN DALGA</span>
              <span className="text-lg font-display font-bold text-white tabular-nums">
                {stats.waveReached} / {currentSector.targetWaves}
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

          <div className="flex flex-col gap-2 pt-1">
            <button
              type="button"
              data-start="true"
              onClick={onRestart}
              className="w-full py-3 px-6 rounded-xl font-display font-bold text-sm bg-red-600 hover:bg-red-500 text-white shadow-[0_0_25px_rgba(239,68,68,0.5)] cursor-pointer transition-all"
            >
              AYNI BÖLÜMÜ TEKRAR DENE
            </button>

            {onOpenSectorMap && (
              <button
                type="button"
                onClick={onOpenSectorMap}
                className="w-full py-2.5 px-4 rounded-xl font-display font-bold text-xs bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <Map className="w-3.5 h-3.5 text-cyan-400" />
                <span>BAŞKA BÖLÜM SEÇ</span>
              </button>
            )}

            <button
              type="button"
              onClick={onHome}
              className="w-full py-2 px-4 rounded-xl font-display font-semibold text-xs text-slate-400 hover:text-white bg-transparent hover:bg-slate-800/50 cursor-pointer transition-all"
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
