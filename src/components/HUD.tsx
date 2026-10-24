import React from 'react';
import { ActiveMissionBuffs, DailyMission, PlayerState, RunStats, ShipClass } from '../game/types';
import { ALL_PERKS } from '../game/constants';
import { getSectorById } from '../game/sectors';
import {
  Shield,
  Zap,
  Heart,
  Volume2,
  VolumeX,
  Pause,
  RotateCcw,
  Gift,
  Sparkles,
  Music,
  Map,
  Disc,
  Activity,
  Smartphone,
  Crosshair,
  Flame,
  Target,
} from 'lucide-react';
import { ALL_WEAPONS } from '../game/weapons';

interface HUDProps {
  player: PlayerState;
  stats: RunStats;
  currentWave: number;
  shipClass: ShipClass;
  isMuted: boolean;
  isMusicMuted: boolean;
  missions: DailyMission[];
  buffs: ActiveMissionBuffs;
  currentSectorId?: number;
  maxWaves?: number;
  combatIntensity?: number;
  currentBpm?: number;
  currentTrackName?: string;
  isMobileControlsVisible?: boolean;
  onToggleMobileControls?: () => void;
  onOpenMissions: () => void;
  onOpenSectorMap?: () => void;
  missionAlert: DailyMission | null;
  onToggleMute: () => void;
  onToggleMusic: () => void;
  onNextTrack?: () => void;
  onPause: () => void;
  onRestart: () => void;
  onCycleWeapon?: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  player,
  stats,
  currentWave,
  shipClass,
  isMuted,
  isMusicMuted,
  missions,
  buffs,
  currentSectorId = 1,
  maxWaves = 4,
  combatIntensity = 0.0,
  currentBpm = 120,
  currentTrackName = 'Kozmik Derinlik',
  isMobileControlsVisible = false,
  onToggleMobileControls,
  onOpenMissions,
  onOpenSectorMap,
  missionAlert,
  onToggleMute,
  onToggleMusic,
  onNextTrack,
  onPause,
  onRestart,
  onCycleWeapon,
}) => {
  const hpPct = Math.max(0, Math.min(100, (player.hp / player.maxHp) * 100));
  const ghostPct = Math.max(0, Math.min(100, (player.recentDamageGhost / player.maxHp) * 100));
  const shieldPct = Math.max(0, Math.min(100, (player.shield / player.maxShield) * 100));
  const xpPct = Math.max(0, Math.min(100, (player.xp / player.xpToNextLevel) * 100));
  const dashReady = player.dashTimer <= 0;
  const dashCooldownPct = dashReady
    ? 100
    : Math.max(0, (1 - player.dashTimer / player.dashCooldown) * 100);

  const isLowHp = player.hp < player.maxHp * 0.3;
  const sector = getSectorById(currentSectorId);
  const intensityPct = Math.round(combatIntensity * 100);

  const activeWeapon =
    ALL_WEAPONS[player.currentWeapon || 'plasma_blaster'] || ALL_WEAPONS.plasma_blaster;
  const wingRocketReady = player.wingRocketReady || player.wingRocketCooldown <= 0;
  const wingRocketPct = wingRocketReady
    ? 100
    : Math.max(
        0,
        (1 - player.wingRocketCooldown / (player.wingRocketMaxCooldown || 1.8)) * 100
      );

  return (
    <div className="fixed inset-0 pointer-events-none z-20 flex flex-col justify-between p-3 md:p-6 select-none">
      {/* Critical Low HP Peripheral Vignette */}
      {isLowHp && (
        <div className="absolute inset-0 pointer-events-none border-[12px] border-red-600/35 animate-pulse" />
      )}

      {/* Top Header Row */}
      <div className="flex flex-col w-full gap-1.5 pointer-events-none">
        <div className="flex justify-between items-start w-full gap-2">
          {/* Top-Left: Player Vitality & Energy Sockets */}
          <div className="flex flex-col gap-1 w-36 sm:w-56 md:w-72">
            {/* Level & Class tag */}
            <div className="flex items-center justify-between text-[11px] sm:text-xs font-display">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <span className="px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-bold text-[10px] sm:text-xs">
                  LV.{player.level}
                </span>
                <span className="text-slate-400 font-semibold uppercase truncate max-w-[80px] sm:max-w-none">
                  {shipClass.nameTr}
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] text-cyan-400/80 font-mono hidden sm:inline">
                XP {player.xp}/{player.xpToNextLevel}
              </span>
            </div>

            {/* XP Progress Bar */}
            <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-cyan-400 transition-all duration-150 shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                style={{ width: `${xpPct}%` }}
              />
            </div>

            {/* HP Bar with Trailing Damage Ghost */}
            <div className="relative flex flex-col">
              <div className="flex justify-between text-[10px] sm:text-[11px] font-mono text-slate-300 mb-0.5">
                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                  <Heart className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-emerald-400" /> HP
                </span>
                <span>
                  {Math.round(player.hp)}/{player.maxHp}
                </span>
              </div>
              <div className="relative w-full h-2.5 sm:h-3 bg-slate-950 rounded-sm border border-slate-700/80 overflow-hidden">
                {/* Trailing ghost bar */}
                <div
                  className="absolute top-0 bottom-0 left-0 bg-red-500/60 transition-all duration-300"
                  style={{ width: `${ghostPct}%` }}
                />
                {/* Active HP bar */}
                <div
                  className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-100"
                  style={{ width: `${hpPct}%` }}
                />
              </div>
            </div>

            {/* Shield Bar */}
            <div className="relative flex flex-col">
              <div className="flex justify-between text-[10px] sm:text-[11px] font-mono text-slate-300 mb-0.5">
                <span className="flex items-center gap-1 text-cyan-400 font-bold">
                  <Shield className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-cyan-400" /> KALKAN
                </span>
                <span>
                  {Math.round(player.shield)}/{player.maxShield}
                </span>
              </div>
              <div className="relative w-full h-1.5 sm:h-2 bg-slate-950 rounded-sm border border-slate-700/80 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-100"
                  style={{ width: `${shieldPct}%` }}
                />
              </div>
            </div>

            {/* Dash Cooldown Indicator */}
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[9px] sm:text-[10px] font-mono text-slate-400 tracking-wider">ATILMA:</span>
              <div className="flex-1 h-1 sm:h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className={`h-full transition-all duration-75 ${
                    dashReady ? 'bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.8)]' : 'bg-slate-600'
                  }`}
                  style={{ width: `${dashCooldownPct}%` }}
                />
              </div>
              {dashReady && (
                <span className="text-[9px] sm:text-[10px] font-display text-amber-400 font-bold animate-pulse">
                  HAZIR
                </span>
              )}
            </div>

            {/* Wing Rocket Pod Status Indicator */}
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] sm:text-[10px] font-mono text-slate-400 tracking-wider">KANAT ROKETİ:</span>
              <div className="flex-1 h-1 sm:h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className={`h-full transition-all duration-75 ${
                    wingRocketReady ? 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.8)]' : 'bg-slate-600'
                  }`}
                  style={{ width: `${wingRocketPct}%` }}
                />
              </div>
              {wingRocketReady ? (
                <span className="text-[9px] sm:text-[10px] font-display text-rose-400 font-bold animate-pulse">
                  HAZIR
                </span>
              ) : (
                <span className="text-[8px] font-mono text-slate-500">
                  {player.wingRocketCooldown.toFixed(1)}s
                </span>
              )}
            </div>
          </div>

          {/* Desktop Center: Sector Banner, Weapon Switcher & Music Gauge */}
          <div className="hidden md:flex flex-col items-center relative gap-1.5">
            <div className="px-4 py-1.5 rounded-xl bg-slate-950/85 border border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.25)] text-center">
              <div className="flex items-center justify-center gap-1.5 text-[10px] font-display tracking-widest text-cyan-400 font-bold">
                <span>{sector.code}</span>
                <span>·</span>
                <span className="text-white truncate max-w-[200px]">{sector.nameTr}</span>
              </div>
              <div className="text-lg md:text-xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-blue-400">
                {currentWave === maxWaves && sector.bossNameTr
                  ? sector.bossNameTr
                  : `DALGA ${currentWave} / ${maxWaves}`}
              </div>
            </div>

            {/* Active Cyber Weapon Switcher */}
            <button
              type="button"
              tabIndex={-1}
              onClick={(e) => {
                e.currentTarget.blur();
                onCycleWeapon?.();
              }}
              title="Aktif Silahı Değiştir [Q / E / 1-5]"
              aria-label="Aktif Silahı Değiştir"
              className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/90 hover:bg-slate-900 border border-slate-700 hover:border-cyan-400 transition-all cursor-pointer pointer-events-auto shadow-md group"
            >
              <div
                className="w-2.5 h-2.5 rounded-full animate-pulse"
                style={{ backgroundColor: activeWeapon.color, boxShadow: `0 0 8px ${activeWeapon.color}` }}
              />
              <span className="text-[9px] font-mono text-cyan-400 font-bold">[Q/E]</span>
              <span className="text-[11px] font-display font-bold text-white group-hover:text-cyan-300">
                {activeWeapon.nameTr}
              </span>
              <span className="text-[9px] font-mono text-slate-400 border-l border-slate-800 pl-1.5">
                x{activeWeapon.damageMultiplier}
              </span>
            </button>

            {/* Dynamic Music Tempo & Intensity Live Gauge */}
            {!isMusicMuted && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/90 border border-slate-800 text-[10px] font-mono text-slate-300 pointer-events-auto">
                <Disc className="w-3 h-3 text-cyan-400 animate-spin" />
                <span className="text-cyan-300 font-bold truncate max-w-[110px]">{currentTrackName}</span>
                <span className="text-amber-400 font-bold">[{currentBpm} BPM]</span>
                <div className="flex items-center gap-1 text-slate-400 border-l border-slate-800 pl-1.5">
                  <Activity className="w-3 h-3 text-rose-400" />
                  <span className={intensityPct > 50 ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                    %{intensityPct} Şiddet
                  </span>
                </div>
                {onNextTrack && (
                  <button
                    type="button"
                    onClick={onNextTrack}
                    className="ml-1 text-cyan-400 hover:text-cyan-200 underline cursor-pointer"
                    title="Sonraki Müzik Parçası [N]"
                  >
                    Sonraki
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Top-Right: Score & Utility Actions */}
          <div className="flex items-start gap-1.5 sm:gap-3">
            {/* Score & Combo */}
            <div className="flex flex-col items-end text-right">
              <div className="flex items-center gap-1">
                {buffs.scoreMultiplier > 1.0 && (
                  <span className="text-[9px] font-mono text-amber-300 font-bold bg-amber-950/80 px-1 py-0.2 rounded border border-amber-500/40">
                    +{Math.round((buffs.scoreMultiplier - 1.0) * 100)}%
                  </span>
                )}
                <span className="text-[9px] sm:text-[10px] font-display tracking-widest text-slate-400">SKOR</span>
              </div>
              <div className="font-display font-black text-base sm:text-2xl md:text-3xl text-white tabular-nums drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]">
                {stats.score.toLocaleString()}
              </div>
              {stats.combo > 1 && (
                <div className="flex items-center gap-0.5 text-[10px] sm:text-xs font-display font-bold text-amber-400 animate-bounce">
                  <Zap className="w-3 h-3 fill-amber-400" />
                  <span>x{stats.combo} KOMBO</span>
                </div>
              )}
            </div>

            {/* Utility Buttons */}
            <div className="flex items-center gap-1 sm:gap-1.5 pointer-events-auto">
              {/* Sector Map Button */}
              {onOpenSectorMap && (
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={(e) => {
                    e.currentTarget.blur();
                    onOpenSectorMap();
                  }}
                  title="Bölüm Haritası [C]"
                  aria-label="Bölüm Haritası"
                  className="hidden sm:flex p-1.5 sm:p-2 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/50 text-indigo-300 hover:text-white transition-colors cursor-pointer"
                >
                  <Map className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400" />
                </button>
              )}

              {/* Daily Missions Toggle Button */}
              <button
                type="button"
                tabIndex={-1}
                onClick={(e) => {
                  e.currentTarget.blur();
                  onOpenMissions();
                }}
                title="Günlük Görevler [G]"
                aria-label="Günlük Görevler"
                className="flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-2 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 hover:text-white transition-colors cursor-pointer text-xs font-display font-bold shadow-[0_0_10px_rgba(6,182,212,0.25)]"
              >
                <Gift className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
                <span className="px-1 py-0.2 rounded-full bg-cyan-500 text-slate-950 text-[9px] font-black">
                  {missions.filter((m) => m.completed).length}/{missions.length}
                </span>
              </button>

              {/* Background Music Toggle Button */}
              <button
                type="button"
                tabIndex={-1}
                onClick={(e) => {
                  e.currentTarget.blur();
                  onToggleMusic();
                }}
                title="Fon Müziğini Aç/Kapat [B]"
                aria-label="Fon Müziğini Aç/Kapat"
                className={`p-1.5 sm:p-2 rounded-lg border transition-colors cursor-pointer ${
                  isMusicMuted
                    ? 'bg-slate-900/80 border-slate-700 text-slate-500 hover:text-slate-300'
                    : 'bg-cyan-950/70 border-cyan-500/50 text-cyan-300 hover:text-cyan-100 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                }`}
              >
                <Music className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${!isMusicMuted ? 'animate-pulse' : ''}`} />
              </button>

              {/* Sound FX Toggle Button */}
              <button
                type="button"
                tabIndex={-1}
                onClick={(e) => {
                  e.currentTarget.blur();
                  onToggleMute();
                }}
                title="Ses Efektlerini Aç/Kapat [M]"
                aria-label="Ses Efektlerini Aç/Kapat"
                className="p-1.5 sm:p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />}
              </button>

              {/* Mobile Touch Controls Toggle Button */}
              {onToggleMobileControls && (
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={(e) => {
                    e.currentTarget.blur();
                    onToggleMobileControls();
                  }}
                  title="Mobil Dokunmatik Kontrolleri Aç/Kapat"
                  aria-label="Mobil Dokunmatik Kontroller"
                  className={`p-1.5 sm:p-2 rounded-lg border transition-colors cursor-pointer ${
                    isMobileControlsVisible
                      ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                      : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              )}

              <button
                type="button"
                tabIndex={-1}
                onClick={(e) => {
                  e.currentTarget.blur();
                  onPause();
                }}
                title="Duraklat [P]"
                aria-label="Oyunu Duraklat"
                className="p-1.5 sm:p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
              </button>

              <button
                type="button"
                tabIndex={-1}
                onClick={(e) => {
                  e.currentTarget.blur();
                  onRestart();
                }}
                title="Yeniden Başlat [R]"
                aria-label="Yeniden Başlat"
                className="p-1.5 sm:p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer hidden sm:block"
              >
                <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile-Only Second Row: Compact Sector Banner, Weapon Switcher & Music Pill */}
        <div className="flex md:hidden items-center justify-between px-2 py-0.5 rounded-lg bg-slate-950/85 border border-slate-800/80 text-[10px] font-display pointer-events-auto gap-1">
          <div className="flex items-center gap-1 text-cyan-400 font-bold truncate">
            <span>{sector.code}</span>
            <span>·</span>
            <span className="text-white truncate max-w-[95px]">{sector.nameTr}</span>
          </div>

          {/* Mobile Quick Weapon Pill */}
          <button
            type="button"
            onClick={onCycleWeapon}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 active:border-cyan-400 text-[9px] font-bold text-slate-200 cursor-pointer"
            title="Silah Değiştir"
          >
            <div
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: activeWeapon.color }}
            />
            <span className="truncate max-w-[80px]">{activeWeapon.nameTr}</span>
          </button>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="font-bold text-cyan-300">
              {currentWave === maxWaves && sector.bossNameTr ? sector.bossNameTr : `D${currentWave}/${maxWaves}`}
            </span>
            {!isMusicMuted && (
              <span className="text-amber-400 font-mono font-bold text-[9px]">
                {currentBpm} BPM
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Dock: Active Perks Ribbon & Quick Stats */}
      <div
        className={`flex items-end justify-between w-full transition-all duration-200 pointer-events-none ${
          isMobileControlsVisible ? 'mb-36 md:mb-0 px-2' : 'mb-0'
        }`}
      >
        {/* Active Perks List */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {stats.perks.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 backdrop-blur-xs">
              <span className="text-[10px] font-display text-slate-400 uppercase mr-1 hidden sm:inline">
                YÜKSELTMELER:
              </span>
              {stats.perks.map((pId, idx) => {
                const perk = ALL_PERKS.find((p) => p.id === pId);
                if (!perk) return null;
                return (
                  <div
                    key={`${pId}-${idx}`}
                    title={`${perk.nameTr}: ${perk.descriptionTr}`}
                    className="w-7 h-7 rounded bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-cyan-300 text-xs font-bold shadow-[0_0_6px_rgba(6,182,212,0.4)]"
                  >
                    {idx + 1}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Kills & Time Info */}
        <div className="flex items-center gap-3 sm:gap-4 text-xs font-mono text-slate-400 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800 backdrop-blur-xs pointer-events-auto">
          <span>DÜŞMAN: <b className="text-white font-display">{stats.kills}</b></span>
          <span>SÜRE: <b className="text-white">{Math.floor(stats.timeElapsed)}s</b></span>
        </div>
      </div>
    </div>
  );
};
