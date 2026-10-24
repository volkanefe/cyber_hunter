import React, { useEffect } from 'react';
import { SHIP_CLASSES } from '../game/constants';
import { ActiveMissionBuffs, DailyMission, ShipClassId } from '../game/types';
import { Shield, Zap, Wind, Gift, Sparkles, Music } from 'lucide-react';

interface TitleScreenProps {
  selectedClass: ShipClassId;
  onSelectClass: (id: ShipClassId) => void;
  onStart: () => void;
  highScore: number;
  missions: DailyMission[];
  buffs: ActiveMissionBuffs;
  onOpenMissions: () => void;
  isMusicMuted: boolean;
  onToggleMusic: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  selectedClass,
  onSelectClass,
  onStart,
  highScore,
  missions,
  buffs,
  onOpenMissions,
  isMusicMuted,
  onToggleMusic,
}) => {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onStart();
      } else if (e.key === 'g' || e.key === 'G') {
        onOpenMissions();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onStart, onOpenMissions]);

  const completedCount = missions.filter((m) => m.completed).length;
  const hasActiveBuffs =
    buffs.scoreMultiplier > 1.0 ||
    buffs.bonusMaxShield > 0 ||
    buffs.speedMultiplier > 1.0 ||
    buffs.damageMultiplier > 1.0;

  return (
    <div className="fixed inset-0 z-30 flex flex-col justify-between items-center p-6 md:p-10 pointer-events-auto bg-slate-950/70 backdrop-blur-xs select-none">
      {/* Top Banner / Highscore & Daily Missions Button */}
      <div className="w-full max-w-4xl flex justify-between items-center text-xs tracking-widest uppercase font-display">
        <div className="flex items-center gap-2 text-cyan-400/80">
          <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>SİBER SAVAŞ PROTOKOLÜ v2.6</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Background Music Toggle */}
          <button
            type="button"
            onClick={onToggleMusic}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-display font-bold transition-all cursor-pointer ${
              isMusicMuted
                ? 'bg-slate-900/80 hover:bg-slate-800 border-slate-700 text-slate-500'
                : 'bg-cyan-950/80 hover:bg-cyan-900 border-cyan-500/50 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
            }`}
            title="Fon Müziğini Aç/Kapat [B]"
          >
            <Music className={`w-3.5 h-3.5 ${!isMusicMuted ? 'text-cyan-400 animate-pulse' : 'text-slate-500'}`} />
            <span>{isMusicMuted ? 'MÜZİK: KAPALI' : 'MÜZİK: AÇIK'}</span>
          </button>

          {/* Daily Missions Action Button */}
          <button
            type="button"
            onClick={onOpenMissions}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 text-xs font-display font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all cursor-pointer"
          >
            <Gift className="w-4 h-4 text-cyan-400" />
            <span>GÜNLÜK GÖREVLER</span>
            <span className="px-1.5 py-0.2 rounded-full bg-cyan-500 text-slate-950 text-[10px] font-black">
              {completedCount}/{missions.length}
            </span>
          </button>

          <div className="text-slate-400">
            EN YÜKSEK SKOR:{' '}
            <span className="text-white text-sm font-bold tabular-nums">
              {highScore.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Centerpiece: Title Emblem & Ship Selector */}
      <div className="flex flex-col items-center max-w-3xl text-center space-y-6 my-auto">
        {/* SVG Title Lockup */}
        <div className="flex flex-col items-center">
          <svg className="w-20 h-20 text-cyan-400 drop-shadow-[0_0_20px_rgba(6,182,212,0.6)] mb-2" viewBox="0 0 100 100" fill="none">
            <polygon points="50,5 92,75 50,60 8,75" stroke="currentColor" strokeWidth="3" fill="rgba(6,182,212,0.15)" />
            <polygon points="50,25 75,70 50,60 25,70" stroke="#38bdf8" strokeWidth="2" fill="rgba(56,189,248,0.3)" />
            <circle cx="50" cy="50" r="6" fill="#ffffff" />
          </svg>
          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-cyan-200 via-cyan-400 to-blue-600 drop-shadow-[0_0_35px_rgba(6,182,212,0.5)]">
            SİBER AVCI
          </h1>
          <p className="text-sm md:text-base text-cyan-200/80 tracking-widest font-semibold mt-1">
            2D NEON UZAY ROGUELITE ARENASI
          </p>

          {/* Active Buffs Pill Banner if any */}
          {hasActiveBuffs && (
            <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-400/50 text-cyan-300 text-xs font-mono font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>GÖREV GÜÇLENDİRMELERİ AKTİF:</span>
              {buffs.scoreMultiplier > 1.0 && (
                <span className="text-amber-300">+{Math.round((buffs.scoreMultiplier - 1.0) * 100)}% Skor</span>
              )}
              {buffs.bonusMaxShield > 0 && (
                <span className="text-cyan-300">+{buffs.bonusMaxShield} Kalkan</span>
              )}
            </div>
          )}
        </div>

        {/* Ship Class Selection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full mt-4">
          {(Object.keys(SHIP_CLASSES) as ShipClassId[]).map((classId) => {
            const ship = SHIP_CLASSES[classId];
            const isSelected = selectedClass === classId;

            return (
              <button
                key={classId}
                type="button"
                onClick={() => onSelectClass(classId)}
                className={`relative flex flex-col p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_25px_rgba(6,182,212,0.35)] scale-[1.02]'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-600 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-display font-bold text-base text-white">
                    {ship.nameTr}
                  </span>
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: ship.color }}
                  />
                </div>
                <p className="text-xs text-slate-300 line-clamp-2 mb-3">
                  {ship.taglineTr}
                </p>

                {/* Stat Meters */}
                <div className="space-y-1.5 text-[11px] text-slate-400 mt-auto">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Wind className="w-3 h-3 text-cyan-400" /> Hız
                    </span>
                    <span className="font-mono text-white">{ship.speed}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Shield className="w-3 h-3 text-emerald-400" /> Gövde / Kalkan
                    </span>
                    <span className="font-mono text-white">
                      {ship.maxHp} / {ship.maxShield}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-400" /> Hasar
                    </span>
                    <span className="font-mono text-white">{ship.bulletDamage}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Primary Start CTA */}
        <div className="pt-4 flex flex-col items-center">
          <button
            type="button"
            data-start="true"
            onClick={onStart}
            className="w-64 py-4 px-8 rounded-xl font-display font-black text-lg tracking-widest uppercase bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_30px_rgba(6,182,212,0.6)] hover:shadow-[0_0_40px_rgba(6,182,212,0.9)] transform hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
          >
            SAVAŞA BAŞLA
          </button>
          <span className="text-xs text-slate-400 mt-2">
            veya <kbd className="px-1.5 py-0.5 bg-slate-800 text-cyan-300 rounded text-[10px] font-mono border border-slate-700">BOŞLUK</kbd> tuşuna basın
          </span>
        </div>
      </div>

      {/* Flat Control Hints Footer */}
      <div className="w-full text-center text-xs text-slate-400 tracking-wider">
        <span>WASD Hareket · Fare / Boşluk Ateş · Sağ Tık / Shift Atılma · P Duraklat · M Sesler · B Müzik · G Görevler</span>
      </div>
    </div>
  );
};
