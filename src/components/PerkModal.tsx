import React, { useEffect } from 'react';
import { Perk } from '../game/types';
import { Zap, Shield, Wind, Crosshair, Magnet, Radio, Activity, Target, Flame } from 'lucide-react';

interface PerkModalProps {
  perks: Perk[];
  onSelect: (perk: Perk) => void;
}

export const PerkModal: React.FC<PerkModalProps> = ({ perks, onSelect }) => {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === '1' && perks[0]) onSelect(perks[0]);
      if (e.key === '2' && perks[1]) onSelect(perks[1]);
      if (e.key === '3' && perks[2]) onSelect(perks[2]);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [perks, onSelect]);

  const getPerkIcon = (id: string) => {
    switch (id) {
      case 'double_barrel':
        return <Zap className="w-8 h-8 text-amber-400" />;
      case 'piercing_rounds':
        return <Crosshair className="w-8 h-8 text-cyan-400" />;
      case 'plasma_shield':
        return <Shield className="w-8 h-8 text-blue-400" />;
      case 'overcharge_thrust':
        return <Wind className="w-8 h-8 text-emerald-400" />;
      case 'magnetic_collector':
        return <Magnet className="w-8 h-8 text-purple-400" />;
      case 'emp_nova':
        return <Radio className="w-8 h-8 text-sky-400" />;
      case 'nanite_repair':
        return <Activity className="w-8 h-8 text-rose-400" />;
      case 'homing_missiles':
        return <Target className="w-8 h-8 text-red-400" />;
      case 'hyper_cooling':
        return <Flame className="w-8 h-8 text-orange-400" />;
      default:
        return <Zap className="w-8 h-8 text-cyan-400" />;
    }
  };

  const getTierBadge = (tier: string) => {
    if (tier === 'legendary') {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/50">
          Efsanevi
        </span>
      );
    }
    if (tier === 'rare') {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/50">
          Nadir
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-700/50 text-slate-300 border border-slate-600">
        Yaygın
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs pointer-events-auto">
      <div className="flex flex-col items-center max-w-3xl w-full">
        {/* Modal Header */}
        <div className="text-center mb-6">
          <span className="text-xs font-display tracking-widest text-cyan-400 uppercase font-semibold">
            SİSTEM GÜNCELLEMESİ
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-black text-white mt-1">
            BİR YÜKSELTME SEÇİN
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Geminizi bir sonraki dalgaya hazırlamak için sistem yükseltmesi seçin.
          </p>
        </div>

        {/* 3 Perk Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
          {perks.map((perk, index) => (
            <button
              key={perk.id}
              type="button"
              onClick={() => onSelect(perk)}
              className="group relative flex flex-col items-center text-center p-5 rounded-xl border border-slate-800 bg-slate-900/90 hover:border-cyan-400 hover:bg-slate-800/90 transition-all duration-200 transform hover:-translate-y-1 shadow-lg hover:shadow-[0_0_25px_rgba(6,182,212,0.3)] cursor-pointer"
            >
              <div className="absolute top-3 left-3 w-6 h-6 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-[11px] font-mono font-bold text-cyan-300 group-hover:bg-cyan-900 group-hover:border-cyan-500">
                {index + 1}
              </div>

              <div className="absolute top-3 right-3">{getTierBadge(perk.tier)}</div>

              <div className="my-5 p-3 rounded-xl bg-slate-950 border border-slate-800 group-hover:border-cyan-500/50 transition-colors">
                {getPerkIcon(perk.id)}
              </div>

              <h3 className="font-display font-bold text-base text-white group-hover:text-cyan-300 transition-colors mb-2">
                {perk.nameTr}
              </h3>

              <p className="text-xs text-slate-300 leading-relaxed">
                {perk.descriptionTr}
              </p>
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-500 font-mono mt-6">
          Klavye kısayolu: <kbd className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">1</kbd>, <kbd className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">2</kbd>, <kbd className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">3</kbd>
        </div>
      </div>
    </div>
  );
};
