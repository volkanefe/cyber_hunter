import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './game/engine';
import {
  ActiveMissionBuffs,
  DailyMission,
  GameStatus,
  Perk,
  PlayerState,
  RunStats,
  ShipClassId,
} from './game/types';
import { SHIP_CLASSES } from './game/constants';
import { soundEngine } from './game/audio';
import { CAMPAIGN_SECTORS, SectorProgress, loadSavedSectorProgress } from './game/sectors';
import { TitleScreen } from './components/TitleScreen';
import { HUD } from './components/HUD';
import { PerkModal } from './components/PerkModal';
import { StatusModals } from './components/StatusModals';
import { DailyMissionModal } from './components/DailyMissionModal';
import { SectorSelectModal } from './components/SectorSelectModal';
import { MobileControls } from './components/MobileControls';
import { detectTouchDevice } from './game/touchControls';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [gameStatus, setGameStatus] = useState<GameStatus>('title');
  const [selectedClass, setSelectedClass] = useState<ShipClassId>('vanguard');
  const [perkChoices, setPerkChoices] = useState<Perk[]>([]);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isMusicMuted, setIsMusicMuted] = useState<boolean>(() => soundEngine.isMusicMuted());
  const [currentWave, setCurrentWave] = useState<number>(1);

  // Campaign Sectors Progression (10 Levels)
  const [currentSectorId, setCurrentSectorId] = useState<number>(1);
  const [sectorProgress, setSectorProgress] = useState<SectorProgress[]>(() =>
    loadSavedSectorProgress()
  );
  const [isSectorMapOpen, setIsSectorMapOpen] = useState<boolean>(false);
  const [starsEarned, setStarsEarned] = useState<number>(1);

  // Dynamic Audio & Adaptive Music State
  const [combatIntensity, setCombatIntensity] = useState<number>(0);
  const [currentBpm, setCurrentBpm] = useState<number>(() => soundEngine.getCurrentBpm());
  const [currentTrackName, setCurrentTrackName] = useState<string>(
    () => soundEngine.getCurrentTrack().nameTr
  );

  // Daily Missions state
  const [dailyMissions, setDailyMissions] = useState<DailyMission[]>([]);
  const [activeBuffs, setActiveBuffs] = useState<ActiveMissionBuffs>({
    scoreMultiplier: 1.0,
    bonusMaxHp: 0,
    bonusMaxShield: 0,
    speedMultiplier: 1.0,
    damageMultiplier: 1.0,
  });
  const [isMissionsOpen, setIsMissionsOpen] = useState<boolean>(false);
  const [missionAlert, setMissionAlert] = useState<DailyMission | null>(null);

  // Mobile Touch Controls & Auto-Aim State
  const [showMobileControls, setShowMobileControls] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return detectTouchDevice() || window.innerWidth <= 1024;
  });
  const [autoAimEnabled, setAutoAimEnabled] = useState<boolean>(true);

  const [playerState, setPlayerState] = useState<PlayerState>(() => ({
    x: 1300,
    y: 1300,
    vx: 0,
    vy: 0,
    angle: 0,
    hp: SHIP_CLASSES.vanguard.maxHp,
    maxHp: SHIP_CLASSES.vanguard.maxHp,
    shield: SHIP_CLASSES.vanguard.maxShield,
    maxShield: SHIP_CLASSES.vanguard.maxShield,
    shieldRechargeTimer: 0,
    speed: SHIP_CLASSES.vanguard.speed,
    fireRate: SHIP_CLASSES.vanguard.fireRate,
    fireCooldown: 0,
    dashCooldown: SHIP_CLASSES.vanguard.dashCooldown,
    dashTimer: 0,
    isDashing: false,
    bulletDamage: SHIP_CLASSES.vanguard.bulletDamage,
    bulletSpeed: SHIP_CLASSES.vanguard.bulletSpeed,
    pierceCount: 0,
    doubleShot: false,
    homingCount: 0,
    magnetRadius: 110,
    empCooldown: 0,
    empTimer: 0,
    level: 1,
    xp: 0,
    xpToNextLevel: 35,
    hitFlashTimer: 0,
    invulnerabilityTimer: 2.0,
    recentDamageGhost: SHIP_CLASSES.vanguard.maxHp,
    ghostFadeTimer: 0,
    currentWeapon: 'plasma_blaster',
    unlockedWeapons: [
      'plasma_blaster',
      'scatter_cannon',
      'quantum_railgun',
      'vortex_missiles',
      'tesla_arc',
    ],
    wingRocketCooldown: 0,
    wingRocketMaxCooldown: 1.8,
    wingRocketAlternate: false,
    wingRocketReady: true,
  }));

  const [runStats, setRunStats] = useState<RunStats>(() => ({
    score: 0,
    highScore: 0,
    combo: 1,
    highestCombo: 1,
    comboTimer: 0,
    kills: 0,
    damageDealt: 0,
    waveReached: 1,
    timeElapsed: 0,
    perks: [],
  }));

  // Resize canvas helper
  const handleResize = useCallback(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    handleResize();
    window.addEventListener('resize', handleResize);

    const engine = new GameEngine(canvas, {
      onStateChange: (state) => setGameStatus(state),
      onStatsUpdate: (stats) => setRunStats(stats),
      onPlayerUpdate: (player) => setPlayerState(player),
      onPerkSelectionRequired: (perks) => setPerkChoices(perks),
      onWaveStart: (wave) => setCurrentWave(wave),
      onMissionsUpdate: (missions, buffs) => {
        setDailyMissions(missions);
        setActiveBuffs(buffs);
      },
      onMissionCompletedAlert: (mission) => {
        setMissionAlert(mission);
        setTimeout(() => setMissionAlert(null), 4000);
      },
      onSectorVictory: (data) => {
        setStarsEarned(data.stars);
        setSectorProgress([...(engineRef.current?.sectorProgress || loadSavedSectorProgress())]);
      },
      onIntensityChange: (intensity, bpm) => {
        setCombatIntensity(intensity);
        setCurrentBpm(bpm);
        setCurrentTrackName(soundEngine.getCurrentTrack().nameTr);
      },
      onSectorChange: (sector) => {
        setCurrentSectorId(sector.id);
      },
    });
    engineRef.current = engine;
    (window as any).__ENGINE__ = engine;
    engine.startLoop();

    // Check autostart query param
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      engine.startRun();
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      engine.destroy();
    };
  }, [handleResize]);

  // Audio gesture initialization for browser autoplay policy
  useEffect(() => {
    const handleFirstGesture = () => {
      soundEngine.startMusic('title');
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
    };
    window.addEventListener('click', handleFirstGesture, { once: true });
    window.addEventListener('keydown', handleFirstGesture, { once: true });
    return () => {
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
    };
  }, []);

  // Global key shortcuts for daily missions, music, sound and campaign map
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'g' || e.key === 'G') && gameStatus !== 'title') {
        setIsMissionsOpen((prev) => !prev);
      }
      if (e.key === 'c' || e.key === 'C') {
        setIsSectorMapOpen((prev) => !prev);
      }
      if (e.key === 'b' || e.key === 'B') {
        const nextMuted = soundEngine.toggleMusicMute();
        setIsMusicMuted(nextMuted);
      }
      if (e.key === 'n' || e.key === 'N') {
        const track = soundEngine.nextTrack();
        setCurrentTrackName(track.nameTr);
        setCurrentBpm(soundEngine.getCurrentBpm());
      }
      if (e.key === 'm' || e.key === 'M') {
        const nextMuted = soundEngine.toggleMute();
        setIsMuted(nextMuted);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStatus]);

  const handleStartGame = () => {
    if (engineRef.current) {
      engineRef.current.startRun(selectedClass, currentSectorId);
    }
  };

  const handleSelectSector = (sectorId: number) => {
    setCurrentSectorId(sectorId);
    if (engineRef.current) {
      engineRef.current.selectSector(sectorId);
      if (gameStatus !== 'title') {
        const shouldPreserve = gameStatus === 'victory';
        engineRef.current.startRun(selectedClass, sectorId, shouldPreserve);
      }
    }
  };

  const handleNextSector = (nextSectorId: number) => {
    setCurrentSectorId(nextSectorId);
    if (engineRef.current) {
      // Preserve all ship upgrades, perks, levels, and weapons into the next sector!
      engineRef.current.startRun(selectedClass, nextSectorId, true);
    }
  };

  const handleCycleMusicTrack = () => {
    const track = soundEngine.nextTrack();
    setCurrentTrackName(track.nameTr);
    setCurrentBpm(soundEngine.getCurrentBpm());
  };

  const handleSelectClass = (classId: ShipClassId) => {
    setSelectedClass(classId);
    if (engineRef.current) {
      engineRef.current.setShipClass(classId);
      setPlayerState({ ...engineRef.current.player });
    }
  };

  const handleSelectPerk = (perk: Perk) => {
    if (engineRef.current) {
      engineRef.current.selectPerk(perk);
      setPerkChoices([]);
    }
  };

  const handleToggleMute = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
  };

  const handleToggleMusic = () => {
    const muted = soundEngine.toggleMusicMute();
    setIsMusicMuted(muted);
  };

  const handlePause = () => {
    if (engineRef.current && gameStatus === 'playing') {
      engineRef.current.setStatus('paused');
    }
  };

  const handleResume = () => {
    if (engineRef.current && gameStatus === 'paused') {
      engineRef.current.setStatus('playing');
    }
  };

  const handleRestart = () => {
    if (engineRef.current) {
      engineRef.current.startRun(selectedClass, currentSectorId);
    }
  };

  const handleHome = () => {
    if (engineRef.current) {
      engineRef.current.setStatus('title');
    }
  };

  const handleClaimMission = (missionId: string) => {
    if (engineRef.current) {
      engineRef.current.claimMission(missionId);
    }
  };

  const handleToggleMobileControls = () => {
    setShowMobileControls((prev) => !prev);
  };

  const handleToggleAutoAim = () => {
    if (engineRef.current) {
      const next = engineRef.current.toggleAutoAim();
      setAutoAimEnabled(next);
    } else {
      setAutoAimEnabled((prev) => !prev);
    }
  };

  const handleCycleWeapon = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.cycleWeapon();
    }
  }, []);

  const totalCampaignStars = sectorProgress.reduce((sum, p) => sum + (p.stars || 0), 0);
  const currentSectorDef = engineRef.current?.currentSector || CAMPAIGN_SECTORS[0];

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans">
      {/* 60 FPS Canvas */}
      <canvas
        ref={canvasRef}
        data-testid="game-canvas"
        className="absolute inset-0 block w-full h-full cursor-crosshair touch-none"
      />

      {/* Title Screen */}
      {gameStatus === 'title' && (
        <TitleScreen
          selectedClass={selectedClass}
          onSelectClass={handleSelectClass}
          onStart={handleStartGame}
          highScore={engineRef.current?.stats.highScore || 0}
          missions={dailyMissions}
          buffs={activeBuffs}
          onOpenMissions={() => setIsMissionsOpen(true)}
          isMusicMuted={isMusicMuted}
          onToggleMusic={handleToggleMusic}
          currentSectorId={currentSectorId}
          onOpenSectorMap={() => setIsSectorMapOpen(true)}
          onCycleMusicTrack={handleCycleMusicTrack}
          currentTrackName={currentTrackName}
          currentTrackBpm={currentBpm}
          totalCampaignStars={totalCampaignStars}
        />
      )}

      {/* Active In-Game HUD */}
      {(gameStatus === 'playing' || gameStatus === 'paused') && (
        <HUD
          player={playerState}
          stats={engineRef.current?.stats || runStats}
          currentWave={currentWave}
          shipClass={SHIP_CLASSES[selectedClass]}
          isMuted={isMuted}
          isMusicMuted={isMusicMuted}
          missions={dailyMissions}
          buffs={activeBuffs}
          currentSectorId={currentSectorId}
          maxWaves={currentSectorDef.targetWaves}
          combatIntensity={combatIntensity}
          currentBpm={currentBpm}
          currentTrackName={currentTrackName}
          isMobileControlsVisible={showMobileControls}
          onToggleMobileControls={handleToggleMobileControls}
          onOpenMissions={() => setIsMissionsOpen(true)}
          onOpenSectorMap={() => setIsSectorMapOpen(true)}
          missionAlert={missionAlert}
          onToggleMute={handleToggleMute}
          onToggleMusic={handleToggleMusic}
          onNextTrack={handleCycleMusicTrack}
          onPause={handlePause}
          onRestart={handleRestart}
          onCycleWeapon={handleCycleWeapon}
        />
      )}

      {/* Mobile Touch Virtual Controls Overlay */}
      {showMobileControls && (gameStatus === 'playing' || gameStatus === 'paused') && (
        <MobileControls
          engine={engineRef.current}
          dashReady={playerState.dashTimer <= 0}
          dashCooldownPct={
            playerState.dashTimer <= 0
              ? 100
              : Math.max(0, (1 - playerState.dashTimer / playerState.dashCooldown) * 100)
          }
          autoAimEnabled={autoAimEnabled}
          onToggleAutoAim={handleToggleAutoAim}
          onCycleWeapon={handleCycleWeapon}
          currentWeaponId={playerState.currentWeapon}
          wingRocketReady={playerState.wingRocketReady || playerState.wingRocketCooldown <= 0}
        />
      )}

      {/* Campaign Sector Selection Modal */}
      {isSectorMapOpen && (
        <SectorSelectModal
          currentSectorId={currentSectorId}
          progressList={sectorProgress}
          onSelectSector={handleSelectSector}
          onClose={() => setIsSectorMapOpen(false)}
        />
      )}

      {/* Perk Selection Modal */}
      {gameStatus === 'perk_selection' && (
        <PerkModal perks={perkChoices} onSelect={handleSelectPerk} />
      )}

      {/* Daily Missions Modal */}
      {isMissionsOpen && (
        <DailyMissionModal
          missions={dailyMissions}
          buffs={activeBuffs}
          onClose={() => setIsMissionsOpen(false)}
          onClaim={handleClaimMission}
        />
      )}

      {/* Status Modals: Paused, Victory, Game Over */}
      <StatusModals
        status={gameStatus}
        stats={engineRef.current?.stats || runStats}
        currentSectorId={currentSectorId}
        starsEarned={starsEarned}
        onResume={handleResume}
        onRestart={handleRestart}
        onHome={handleHome}
        onNextSector={handleNextSector}
        onOpenSectorMap={() => setIsSectorMapOpen(true)}
      />
    </div>
  );
}
