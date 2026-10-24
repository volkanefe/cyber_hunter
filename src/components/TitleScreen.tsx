import React, { useEffect } from 'react';
import { SHIP_CLASSES } from '../game/constants';
import { ActiveMissionBuffs, DailyMission, ShipClassId } from '../game/types';
import { getSectorById } from '../game/sectors';
import { Shield, Zap, Wind, Gift, Sparkles, Music, Map, Star, Disc } from 'lucide-react';

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
  currentSectorId?: number;
  onOpenSectorMap?: () => void;
  onCycleMusicTrack?: () => void;
  currentTrackName?: string;
  currentTrackBpm?: number;
  totalCampaignStars?: number;
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
  currentSectorId = 1,
  onOpenSectorMap,
  onCycleMusicTrack,
  currentTrackName = 'Kozmik Derinlik',
  currentTrackBpm = 96,
  totalCampaignStars = 0,
}) => {
  const currentSector = getSectorById(currentSectorId);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onStart();
      } else if (e.key === 'g' || e.key === 'G') {
        onOpenMissions();
      } else if ((e.key === 'c' || e.key === 'C') && onOpenSectorMap) {
        onOpenSectorMap();
      } else if ((e.key === 'n' || e.key === 'N') && onCycleMusicTrack) {
        onCycleMusicTrack();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onStart, onOpenMissions, onOpenSectorMap, onCycleMusicTrack]);

  const completedCount = missions.filter((m) => m.completed).length;
  const hasActiveBuffs =
    buffs.scoreMultiplier > 1.0 ||
    buffs.bonusMaxShield > 0 ||
    buffs.speedMultiplier > 1.0 ||
    buffs.damageMultiplier > 1.0;

  return (
    <div className="fixed inset-0 z-30 flex flex-col justify-between items-center p-4 md:p-8 pointer-events-auto bg-slate-950/75 backdrop-blur-xs select-none overflow-y-auto">
      {/* Top Banner / Highscore & Campaign & Daily Missions Button */}
      <div className="w-full max-w-5xl flex flex-wrap justify-between items-center gap-3 text-xs tracking-widest uppercase font-display">
        <div className="flex items-center gap-2 text-cyan-400/80">
          <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>SİBER SAVAŞ PROTOKOLÜ · 10 BÖLÜM SEFERİ</span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Campaign Sector Map Action */}
          {onOpenSectorMap && (
            <button
              type="button"
              onClick={onOpenSectorMap}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/50 text-indigo-300 text-xs font-display font-bold shadow-[0_0_12px_rgba(99,102,241,0.3)] transition-all cursor-pointer"
              title="Galaktik Sefer Haritası [C]"
            >
              <Map className="w-3.5 h-3.5 text-indigo-400" />
              <span>BÖLÜMLER (10)</span>
              <span className="flex items-center text-amber-300 text-[10px]">
                <Star className="w-3 h-3 fill-amber-400 inline mr-0.5" />
                {totalCampaignStars}/30
              </span>
            </button>
          )}

          {/* Background Music Toggle & Track Switcher */}
          <div className="flex items-center rounded-lg border border-slate-800 bg-slate-950/80 overflow-hidden">
            <button
              type="button"
              onClick={onToggleMusic}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-display font-bold transition-all cursor-pointer ${
                isMusicMuted
                  ? 'text-slate-500 hover:text-slate-400'
                  : 'text-cyan-300 hover:text-cyan-100 bg-cyan-950/60'
              }`}
              title="Fon Müziğini Aç/Kapat [B]"
            >
              <Music className={`w-3.5 h-3.5 ${!isMusicMuted ? 'text-cyan-400 animate-pulse' : 'text-slate-500'}`} />
              <span>{isMusicMuted ? 'MÜZİK: KAPALI' : 'MÜZİK: AÇIK'}</span>
            </button>

            {!isMusicMuted && onCycleMusicTrack && (
              <button
                type="button"
                onClick={onCycleMusicTrack}
                className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-display text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border-l border-slate-800 cursor-pointer transition-colors"
                title="Sıradaki Parçaya Geç (5 Müzik) [N]"
              >
                <Disc className="w-3 h-3 text-cyan-400 animate-spin" />
                <span className="max-w-[120px] truncate">{currentTrackName}</span>
                <span className="text-[10px] text-cyan-400 font-mono">[{currentTrackBpm} BPM]</span>
              </button>
            )}
          </div>

          {/* Daily Missions Action Button */}
          <button
            type="button"
            onClick={onOpenMissions}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 text-xs font-display font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all cursor-pointer"
          >
            <Gift className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">GÜNLÜK GÖREVLER</span>
            <span className="px-1.5 py-0.2 rounded-full bg-cyan-500 text-slate-950 text-[10px] font-black">
              {completedCount}/{missions.length}
            </span>
          </button>

          <div className="text-slate-400 hidden lg:block">
            REKOR: <span className="text-white text-sm font-bold tabular-nums">{highScore.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Centerpiece: Title Emblem & Ship Selector */}
      <div className="flex flex-col items-center max-w-4xl text-center space-y-5 my-auto w-full py-4">
        {/* SVG Title Lockup */}
        <div className="flex flex-col items-center">
          <svg className="w-16 h-16 md:w-20 md:h-20 text-cyan-400 drop-shadow-[0_0_20px_rgba(6,182,212,0.6)] mb-1" viewBox="0 0 100 100" fill="none">
            <polygon points="50,5 92,75 50,60 8,75" stroke="currentColor" strokeWidth="3" fill="rgba(6,182,212,0.15)" />
            <polygon points="50,25 75,70 50,60 25,70" stroke="#38bdf8" strokeWidth="2" fill="rgba(56,189,248,0.3)" />
            <circle cx="50" cy="50" r="6" fill="#ffffff" />
          </svg>
          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-cyan-200 via-cyan-400 to-blue-600 drop-shadow-[0_0_35px_rgba(6,182,212,0.5)]">
            SİBER AVCI
          </h1>
          <p className="text-xs md:text-sm text-cyan-200/80 tracking-widest font-semibold mt-1">
            2D NEON UZAY ROGUELITE ARENASI · 10 SEKTÖR SEFERİ
          </p>

          {/* Active Sector Quick Badge */}
          <div className="mt-2 flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-300 text-xs font-display font-medium">
              <span className="text-cyan-400 font-bold">{currentSector.code}:</span>
              <span>{currentSector.nameTr}</span>
              {currentSector.bossNameTr && (
                <span className="text-rose-400 font-bold text-[10px] ml-1">[{currentSector.bossNameTr}]</span>
              )}
            </div>
            {onOpenSectorMap && (
              <button
                type="button"
                onClick={onOpenSectorMap}
                className="text-xs text-cyan-400 underline hover:text-cyan-300 cursor-pointer font-display"
              >
                Değiştir
              </button>
            )}
          </div>

          {/* Active Buffs Pill Banner if any */}
          {hasActiveBuffs && (
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-400/50 text-cyan-300 text-xs font-mono font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)]">
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
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
                    : 'border-slate-800 bg-slate-900/40 hover:bg-slate-900/70 hover:border-slate-700'
                }`}
              >
                {isSelected && (
                  <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-cyan-500 text-slate-950 text-[10px] font-display font-black tracking-widest uppercase">
                    SEÇİLDİ
                  </span>
                )}

                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-display font-bold text-white tracking-wide">
                    {ship.nameTr}
                  </h3>
                  <div
                    className="w-3 h-3 rounded-full shadow-[0_0_8px_currentColor]"
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

        {/* Primary Action Buttons: Start Game & Sector Map */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
          <button
            type="button"
            data-start="true"
            onClick={onStart}
            className="w-full sm:w-64 py-3.5 px-8 rounded-xl font-display font-black text-base tracking-widest uppercase bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_30px_rgba(6,182,212,0.6)] hover:shadow-[0_0_40px_rgba(6,182,212,0.9)] transform hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
          >
            SAVAŞA BAŞLA
          </button>

          {onOpenSectorMap && (
            <button
              type="button"
              onClick={onOpenSectorMap}
              className="w-full sm:w-56 py-3.5 px-6 rounded-xl font-display font-bold text-sm tracking-wide bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.2)] flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Map className="w-4 h-4 text-cyan-400" />
              <span>BÖLÜM SEÇİMİ (10)</span>
            </button>
          )}
        </div>
        <span className="text-xs text-slate-400">
          veya <kbd className="px-1.5 py-0.5 bg-slate-800 text-cyan-300 rounded text-[10px] font-mono border border-slate-700">BOŞLUK</kbd> tuşuna basın
        </span>
      </div>

      {/* Control Hints Footer */}
      <div className="w-full text-center text-xs text-slate-400 tracking-wider flex flex-col items-center gap-1">
        <span className="hidden sm:inline">Klavye: WASD Hareket · Boşluk / Sol Tık Ateş · Shift Atılma · C Bölüm Haritası · N Müzik Değiştir · B Müzik Aç/Kapa · G Görevler</span>
        <span className="text-cyan-400 font-medium">📱 Dokunmatik / Mobil: Sol Sanal Joystick ile İlerle & Dön · Sağ Joystick ile Nişan Alıp Ateş Et · Atılma & Oto-Nişan Butonları</span>
      </div>
    </div>
  );
};
