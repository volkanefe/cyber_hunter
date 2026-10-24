import React, { useEffect, useState } from 'react';
import { ActiveMissionBuffs, DailyMission } from '../game/types';
import { Crosshair, Clock, Zap, Award, CheckCircle, Gift, X, Sparkles, Shield, Globe, Star } from 'lucide-react';

interface DailyMissionModalProps {
  missions: DailyMission[];
  buffs: ActiveMissionBuffs;
  onClose: () => void;
  onClaim: (missionId: string) => void;
}

type FilterCategory = 'all' | 'daily' | 'celestial_exploration' | 'sector_bounty';

export const DailyMissionModal: React.FC<DailyMissionModalProps> = ({
  missions,
  buffs,
  onClose,
  onClaim,
}) => {
  const [filter, setFilter] = useState<FilterCategory>('all');

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const getMissionIcon = (icon: DailyMission['icon']) => {
    switch (icon) {
      case 'crosshair':
        return <Crosshair className="w-5 h-5 text-cyan-400" />;
      case 'clock':
        return <Clock className="w-5 h-5 text-amber-400" />;
      case 'zap':
        return <Zap className="w-5 h-5 text-emerald-400" />;
      case 'award':
        return <Award className="w-5 h-5 text-rose-400" />;
      case 'globe':
        return <Globe className="w-5 h-5 text-blue-400" />;
      case 'star':
        return <Star className="w-5 h-5 text-yellow-400" />;
      default:
        return <Shield className="w-5 h-5 text-cyan-400" />;
    }
  };

  const completedCount = missions.filter((m) => m.completed).length;

  const filteredMissions = missions.filter((m) => {
    if (filter === 'all') return true;
    if (filter === 'daily') return m.category === 'daily' || !m.category;
    return m.category === filter;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xs pointer-events-auto select-none">
      <div className="w-full max-w-2xl rounded-2xl border border-cyan-500/40 bg-slate-900/95 p-6 shadow-[0_0_50px_rgba(6,182,212,0.25)] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/50 text-cyan-300">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-display tracking-widest text-cyan-400 uppercase font-semibold">
                  SİBER AVCI GÖREV İSTASYONU
                </span>
                <span className="px-2 py-0.2 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700/60 text-[10px] font-mono font-bold">
                  {completedCount}/{missions.length} TAMAMLANDI
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-display font-black text-white mt-0.5">
                GÖREVLER & GALAKTİK KEŞİFLER
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 mt-3 pt-1 border-b border-slate-800/60 pb-2">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-display font-bold transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.5)]'
                : 'bg-slate-800/60 text-slate-400 hover:text-white'
            }`}
          >
            TÜMÜ ({missions.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('daily')}
            className={`px-3 py-1 rounded-lg text-xs font-display font-bold transition-all cursor-pointer ${
              filter === 'daily'
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.5)]'
                : 'bg-slate-800/60 text-slate-400 hover:text-white'
            }`}
          >
            GÜNLÜK PROTOKOL
          </button>
          <button
            type="button"
            onClick={() => setFilter('celestial_exploration')}
            className={`px-3 py-1 rounded-lg text-xs font-display font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filter === 'celestial_exploration'
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.5)]'
                : 'bg-slate-800/60 text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            GEZEGEN KEŞFİ
          </button>
          <button
            type="button"
            onClick={() => setFilter('sector_bounty')}
            className={`px-3 py-1 rounded-lg text-xs font-display font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filter === 'sector_bounty'
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.5)]'
                : 'bg-slate-800/60 text-slate-400 hover:text-white'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            TİTAN AVI
          </button>
        </div>

        {/* Active Buffs Summary Banner */}
        <div className="mt-3 p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="font-display uppercase tracking-wider text-[11px] text-slate-300">
              AKTİF GALAKSİ GÜÇLENDİRMELERİ:
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {buffs.scoreMultiplier > 1.0 && (
              <span className="px-2 py-1 rounded bg-amber-950/60 text-amber-300 border border-amber-500/40 font-bold">
                +{Math.round((buffs.scoreMultiplier - 1.0) * 100)}% SKOR ÇARPANI
              </span>
            )}
            {buffs.bonusMaxShield > 0 && (
              <span className="px-2 py-1 rounded bg-blue-950/60 text-cyan-300 border border-cyan-500/40 font-bold">
                +{buffs.bonusMaxShield} KALKAN
              </span>
            )}
            {buffs.speedMultiplier > 1.0 && (
              <span className="px-2 py-1 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 font-bold">
                +{Math.round((buffs.speedMultiplier - 1.0) * 100)}% HIZ
              </span>
            )}
            {buffs.damageMultiplier > 1.0 && (
              <span className="px-2 py-1 rounded bg-rose-950/60 text-rose-300 border border-rose-500/40 font-bold">
                +{Math.round((buffs.damageMultiplier - 1.0) * 100)}% HASAR
              </span>
            )}
            {buffs.scoreMultiplier === 1.0 &&
              buffs.bonusMaxShield === 0 &&
              buffs.speedMultiplier === 1.0 &&
              buffs.damageMultiplier === 1.0 && (
                <span className="text-slate-500 text-[11px]">
                  Görevleri tamamlayarak ve gezegenleri keşfederek kalıcı çarpanlar kazanın!
                </span>
              )}
          </div>
        </div>

        {/* Mission Cards List */}
        <div className="mt-3.5 space-y-3 overflow-y-auto pr-1 flex-1">
          {filteredMissions.map((mission) => {
            const pct = Math.min(100, Math.round((mission.current / mission.target) * 100));

            return (
              <div
                key={mission.id}
                className={`p-4 rounded-xl border transition-all duration-150 ${
                  mission.completed
                    ? 'bg-slate-900/80 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                    : 'bg-slate-950/60 border-slate-800/80'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left: Icon & Info */}
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700/60 mt-0.5">
                      {getMissionIcon(mission.icon)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-display font-bold text-sm text-white">
                          {mission.titleTr}
                        </h3>
                        {mission.completed && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-1.5 py-0.2 rounded">
                            <CheckCircle className="w-3 h-3" /> TAMAMLANDI
                          </span>
                        )}
                        {mission.category === 'celestial_exploration' && (
                          <span className="text-[10px] font-mono text-blue-400 bg-blue-950/50 border border-blue-600/40 px-1.5 py-0.2 rounded">
                            GEZEGEN
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {mission.descriptionTr}
                      </p>
                    </div>
                  </div>

                  {/* Right: Reward & Action */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 self-end sm:self-center w-full sm:w-auto">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] font-display text-slate-400 block uppercase">
                        ÖDÜL
                      </span>
                      <span className="text-xs font-display font-bold text-cyan-300">
                        {mission.reward.labelTr}
                      </span>
                    </div>

                    {mission.completed ? (
                      mission.claimed ? (
                        <div className="px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs font-display font-bold flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5" />
                          AKTİF
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onClaim(mission.id)}
                          className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-display font-bold shadow-[0_0_15px_rgba(6,182,212,0.5)] cursor-pointer transition-all animate-pulse"
                        >
                          ÖDÜLÜ AL
                        </button>
                      )
                    ) : (
                      <div className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-500 text-[11px] font-mono">
                        %{pct}
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mb-1">
                    <span>İlerleme:</span>
                    <span className="font-bold text-slate-300">
                      {mission.current} / {mission.target}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full transition-all duration-300 ${
                        mission.completed
                          ? 'bg-gradient-to-r from-emerald-500 to-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]'
                          : 'bg-cyan-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
          <span>Arenadaki gezegenleri keşfederek ve görevleri yaparak güçlenin.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-display font-bold text-xs cursor-pointer transition-colors"
          >
            KAPAT [ESC]
          </button>
        </div>
      </div>
    </div>
  );
};
