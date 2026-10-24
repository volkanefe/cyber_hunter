import { ActiveMissionBuffs, DailyMission, PlayerState, RunStats, ShipClass } from '../game/types';
import { ALL_PERKS } from '../game/constants';
import { Shield, Zap, Heart, Volume2, VolumeX, Pause, RotateCcw, Gift, Sparkles, Music } from 'lucide-react';
import { soundEngine } from '../game/audio';

interface HUDProps {
  player: PlayerState;
  stats: RunStats;
  currentWave: number;
  shipClass: ShipClass;
  isMuted: boolean;
  isMusicMuted: boolean;
  missions: DailyMission[];
  buffs: ActiveMissionBuffs;
  onOpenMissions: () => void;
  missionAlert: DailyMission | null;
  onToggleMute: () => void;
  onToggleMusic: () => void;
  onPause: () => void;
  onRestart: () => void;
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
  onOpenMissions,
  missionAlert,
  onToggleMute,
  onToggleMusic,
  onPause,
  onRestart,
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

  return (
    <div className="fixed inset-0 pointer-events-none z-20 flex flex-col justify-between p-4 md:p-6 select-none">
      {/* Critical Low HP Peripheral Vignette */}
      {isLowHp && (
        <div className="absolute inset-0 pointer-events-none border-[12px] border-red-600/30 animate-pulse" />
      )}

      {/* Top Header Row */}
      <div className="flex justify-between items-start w-full">
        {/* Top-Left: Player Vitality & Energy Sockets */}
        <div className="flex flex-col gap-2 w-64 md:w-80">
          {/* Level & Class tag */}
          <div className="flex items-center justify-between text-xs font-display">
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-bold">
                SEVİYE {player.level}
              </span>
              <span className="text-slate-400 font-semibold uppercase">{shipClass.nameTr}</span>
            </div>
            <span className="text-[11px] text-cyan-400/80 font-mono">
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
            <div className="flex justify-between text-[11px] font-mono text-slate-300 mb-1">
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <Heart className="w-3 h-3 fill-emerald-400" /> GÖVDE (HP)
              </span>
              <span>
                {Math.round(player.hp)} / {player.maxHp}
              </span>
            </div>
            <div className="relative w-full h-3.5 bg-slate-950 rounded-sm border border-slate-700/80 overflow-hidden">
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
            <div className="flex justify-between text-[11px] font-mono text-slate-300 mb-1">
              <span className="flex items-center gap-1 text-cyan-400 font-bold">
                <Shield className="w-3 h-3 fill-cyan-400" /> KALKAN
              </span>
              <span>
                {Math.round(player.shield)} / {player.maxShield}
              </span>
            </div>
            <div className="relative w-full h-2.5 bg-slate-950 rounded-sm border border-slate-700/80 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-100"
                style={{ width: `${shieldPct}%` }}
              />
            </div>
          </div>

          {/* Dash Cooldown Indicator */}
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] font-mono text-slate-400 tracking-wider">ATILMA [BOŞLUK]:</span>
            <div className="flex-1 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className={`h-full transition-all duration-75 ${
                  dashReady ? 'bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.8)]' : 'bg-slate-600'
                }`}
                style={{ width: `${dashCooldownPct}%` }}
              />
            </div>
            {dashReady && (
              <span className="text-[10px] font-display text-amber-400 font-bold animate-pulse">
                HAZIR
              </span>
            )}
          </div>
        </div>

        {/* Center: Wave Counter & Mission Completed Toast */}
        <div className="flex flex-col items-center relative">
          <div className="px-4 py-1.5 rounded-lg bg-slate-950/80 border border-slate-700/70 shadow-lg text-center">
            <div className="text-[10px] font-display tracking-widest text-slate-400">SEKTÖR DALGASI</div>
            <div className="text-xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400">
              {currentWave === 5 ? 'TİTAN SAVAŞI' : `DALGA ${currentWave} / 5`}
            </div>
          </div>

          {/* Mission Completed Toast Banner */}
          {missionAlert && (
            <div className="absolute top-16 z-30 pointer-events-none flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-900/95 border border-cyan-400 text-white shadow-[0_0_25px_rgba(6,182,212,0.6)] animate-bounce whitespace-nowrap">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="text-left font-display">
                <div className="text-[10px] text-cyan-300 tracking-wider uppercase font-bold">
                  GÜNLÜK GÖREV TAMAMLANDI!
                </div>
                <div className="text-xs font-bold text-white">
                  {missionAlert.titleTr} · <span className="text-amber-300 font-mono">{missionAlert.reward.labelTr}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Top-Right: Score, Combo & Utility Actions */}
        <div className="flex items-start gap-3">
          {/* Score, Bonus Multiplier & Combo */}
          <div className="flex flex-col items-end text-right">
            <div className="flex items-center gap-1.5">
              {buffs.scoreMultiplier > 1.0 && (
                <span className="text-[10px] font-mono text-amber-300 font-bold bg-amber-950/80 px-1.5 py-0.2 rounded border border-amber-500/40">
                  +{Math.round((buffs.scoreMultiplier - 1.0) * 100)}% GÖREV BONUSU
                </span>
              )}
              <span className="text-[10px] font-display tracking-widest text-slate-400">SKOR</span>
            </div>
            <div className="font-display font-black text-2xl md:text-3xl text-white tabular-nums drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]">
              {stats.score.toLocaleString()}
            </div>
            {stats.combo > 1 && (
              <div className="flex items-center gap-1 text-xs font-display font-bold text-amber-400 animate-bounce">
                <Zap className="w-3.5 h-3.5 fill-amber-400" />
                <span>x{stats.combo} SERİ KOMBO!</span>
              </div>
            )}
          </div>

          {/* Utility Buttons */}
          <div className="flex items-center gap-1.5 pointer-events-auto">
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
              className="flex items-center gap-1 px-2.5 py-2 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 hover:text-white transition-colors cursor-pointer text-xs font-display font-bold shadow-[0_0_10px_rgba(6,182,212,0.25)]"
            >
              <Gift className="w-4 h-4 text-cyan-400" />
              <span className="hidden md:inline">GÖREVLER</span>
              <span className="px-1 py-0.2 rounded-full bg-cyan-500 text-slate-950 text-[10px] font-black">
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
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                isMusicMuted
                  ? 'bg-slate-900/80 border-slate-700 text-slate-500 hover:text-slate-300'
                  : 'bg-cyan-950/70 border-cyan-500/50 text-cyan-300 hover:text-cyan-100 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
              }`}
            >
              <Music className={`w-4 h-4 ${!isMusicMuted ? 'animate-pulse' : ''}`} />
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
              className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            </button>

            <button
              type="button"
              tabIndex={-1}
              onClick={(e) => {
                e.currentTarget.blur();
                onPause();
              }}
              title="Duraklat [P]"
              aria-label="Oyunu Duraklat"
              className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <Pause className="w-4 h-4 text-cyan-400" />
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
              className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-cyan-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Dock: Active Perks Ribbon */}
      <div className="flex items-end justify-between w-full">
        {/* Active Perks List */}
        <div className="flex items-center gap-2">
          {stats.perks.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] font-display text-slate-400 uppercase mr-1">YÜKSELTMELER:</span>
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
        <div className="flex items-center gap-4 text-xs font-mono text-slate-400 bg-slate-950/70 px-3 py-1.5 rounded-lg border border-slate-800">
          <span>YOK EDİLEN: <b className="text-white font-display">{stats.kills}</b></span>
          <span>SÜRE: <b className="text-white">{Math.floor(stats.timeElapsed)}s</b></span>
        </div>
      </div>
    </div>
  );
};
