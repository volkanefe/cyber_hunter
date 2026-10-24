import React from 'react';
import { CAMPAIGN_SECTORS, SectorDef, SectorProgress } from '../game/sectors';
import { MUSIC_TRACKS } from '../game/audio';
import { X, Lock, Play, Star, AlertTriangle, ShieldCheck, Music } from 'lucide-react';

interface SectorSelectModalProps {
  currentSectorId: number;
  progressList: SectorProgress[];
  onSelectSector: (sectorId: number) => void;
  onClose: () => void;
}

export const SectorSelectModal: React.FC<SectorSelectModalProps> = ({
  currentSectorId,
  progressList,
  onSelectSector,
  onClose,
}) => {
  const totalStars = progressList.reduce((acc, p) => acc + (p.stars || 0), 0);
  const maxPossibleStars = CAMPAIGN_SECTORS.length * 3;
  const completedSectorsCount = progressList.filter((p) => p.completed).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-md pointer-events-auto select-none">
      <div className="relative flex flex-col w-full max-w-5xl max-h-[92vh] rounded-2xl border border-cyan-500/50 bg-slate-900/95 shadow-[0_0_50px_rgba(6,182,212,0.3)] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/60 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-display tracking-widest text-cyan-400 uppercase font-semibold">
                GALAKTİK SEFER HARİTASI
              </div>
              <h2 className="text-xl md:text-2xl font-display font-black text-white">
                SEKTÖR SEÇİMİ (10 BÖLÜM)
              </h2>
            </div>
          </div>

          {/* Campaign Mastery Progress Pill */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-950 border border-amber-500/40 text-amber-300 font-display text-xs">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="font-bold">
                {totalStars} / {maxPossibleStars} YILDIZ
              </span>
              <span className="text-slate-500">|</span>
              <span className="text-cyan-300 font-bold">
                {completedSectorsCount} / {CAMPAIGN_SECTORS.length} BÖLÜM
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Kapat [ESC]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sectors Grid */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-3.5 custom-scrollbar">
          {CAMPAIGN_SECTORS.map((sector: SectorDef) => {
            const progress = progressList.find((p) => p.sectorId === sector.id);
            const isUnlocked = progress ? progress.unlocked : sector.id === 1;
            const isCompleted = progress ? progress.completed : false;
            const stars = progress ? progress.stars : 0;
            const isSelected = currentSectorId === sector.id;
            const track = MUSIC_TRACKS[sector.recommendedTrackId] || MUSIC_TRACKS[0];

            return (
              <div
                key={sector.id}
                className={`relative flex flex-col justify-between p-4 rounded-xl border transition-all duration-200 ${
                  isSelected
                    ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                    : isUnlocked
                    ? 'border-slate-800 hover:border-slate-700 bg-slate-950/60 hover:bg-slate-850'
                    : 'border-slate-900 bg-slate-950/30 opacity-60'
                }`}
              >
                <div>
                  {/* Top line: Sector code, recommended music & Stars */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-display font-bold bg-slate-800 text-cyan-300 border border-slate-700">
                        {sector.code}
                      </span>
                      {sector.bossNameTr && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-display font-bold bg-rose-950 border border-rose-500/50 text-rose-300 animate-pulse">
                          BOSS SAVAŞI
                        </span>
                      )}
                    </div>

                    {/* Star ratings */}
                    <div className="flex items-center gap-1">
                      {[1, 2, 3].map((starIdx) => (
                        <Star
                          key={starIdx}
                          className={`w-4 h-4 ${
                            starIdx <= stars
                              ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.6)]'
                              : 'text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="text-base font-display font-bold text-white flex items-center gap-2">
                    {sector.id}. {sector.nameTr}
                  </h3>
                  <p className="text-xs text-cyan-300/80 font-medium mt-0.5">
                    {sector.subtitleTr}
                  </p>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                    {sector.descriptionTr}
                  </p>

                  {/* Hazard info pill */}
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                      <AlertTriangle className="w-3 h-3 text-amber-400" />
                      <span>{sector.hazardNameTr}: {sector.hazardDescriptionTr}</span>
                    </div>

                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                      <Music className="w-3 h-3 text-cyan-400" />
                      <span>Müzik: {track.nameTr} ({track.baseBpm} BPM)</span>
                    </div>
                  </div>
                </div>

                {/* Bottom line: High Score & Launch Button */}
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800/80">
                  <div className="text-xs">
                    <span className="text-slate-500 block text-[10px] font-mono">REKOR SKOR</span>
                    <span className="text-white font-mono font-bold">
                      {progress && progress.highScore > 0
                        ? progress.highScore.toLocaleString()
                        : '---'}
                    </span>
                  </div>

                  {isUnlocked ? (
                    <button
                      type="button"
                      onClick={() => {
                        onSelectSector(sector.id);
                        onClose();
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-display font-bold text-xs cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.5)]'
                          : 'bg-slate-800 hover:bg-cyan-600 text-slate-200 hover:text-white border border-slate-700 hover:border-cyan-500'
                      }`}
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{isCompleted ? 'TEKRAR OYNA' : 'BÖLÜME GİT'}</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 text-slate-500 text-xs font-display">
                      <Lock className="w-3.5 h-3.5" />
                      <span>KİLİTLİ</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400 font-display">
          <span>İpucu: Her bölümü tamamladığınızda bir sonraki bölümün kilidi açılır.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors cursor-pointer"
          >
            KAPAT
          </button>
        </div>
      </div>
    </div>
  );
};
