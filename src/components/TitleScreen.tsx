import React, { useEffect } from 'react';
import { SHIP_CLASSES } from '../game/constants';
import { ShipClassId } from '../game/types';
import { Shield, Zap, Wind, Crosshair } from 'lucide-react';

interface TitleScreenProps {
  selectedClass: ShipClassId;
  onSelectClass: (id: ShipClassId) => void;
  onStart: () => void;
  highScore: number;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  selectedClass,
  onSelectClass,
  onStart,
  highScore,
}) => {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onStart();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onStart]);

  return (
    <div className="fixed inset-0 z-30 flex flex-col justify-between items-center p-6 md:p-10 pointer-events-auto bg-slate-950/70 backdrop-blur-xs select-none">
      {/* Top Banner / Highscore */}
      <div className="w-full max-w-4xl flex justify-between items-center text-xs tracking-widest uppercase text-cyan-400/80 font-display">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>SİBER SAVAŞ PROTOKOLÜ v2.6</span>
        </div>
        <div>
          EN YÜKSEK SKOR:{' '}
          <span className="text-white text-sm font-bold tabular-nums">
            {highScore.toLocaleString()}
          </span>
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
        <span>WASD Hareket · Fare / Boşluk Ateş · Sağ Tık / Shift Atılma · P Duraklat · M Ses Aç/Kapa</span>
      </div>
    </div>
  );
};
