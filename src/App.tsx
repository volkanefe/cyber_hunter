import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './game/engine';
import { GameStatus, Perk, PlayerState, RunStats, ShipClassId } from './game/types';
import { SHIP_CLASSES } from './game/constants';
import { soundEngine } from './game/audio';
import { TitleScreen } from './components/TitleScreen';
import { HUD } from './components/HUD';
import { PerkModal } from './components/PerkModal';
import { StatusModals } from './components/StatusModals';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [gameStatus, setGameStatus] = useState<GameStatus>('title');
  const [selectedClass, setSelectedClass] = useState<ShipClassId>('vanguard');
  const [perkChoices, setPerkChoices] = useState<Perk[]>([]);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentWave, setCurrentWave] = useState<number>(1);

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
    });
    engineRef.current = engine;
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

  const handleStartGame = () => {
    if (engineRef.current) {
      engineRef.current.startRun(selectedClass);
    }
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
      engineRef.current.startRun(selectedClass);
    }
  };

  const handleHome = () => {
    if (engineRef.current) {
      engineRef.current.setStatus('title');
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans">
      {/* 60 FPS Canvas */}
      <canvas
        ref={canvasRef}
        data-testid="game-canvas"
        className="absolute inset-0 block w-full h-full cursor-crosshair"
      />

      {/* Title Screen */}
      {gameStatus === 'title' && (
        <TitleScreen
          selectedClass={selectedClass}
          onSelectClass={handleSelectClass}
          onStart={handleStartGame}
          highScore={engineRef.current?.stats.highScore || 0}
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
          onToggleMute={handleToggleMute}
          onPause={handlePause}
          onRestart={handleRestart}
        />
      )}

      {/* Perk Selection Modal */}
      {gameStatus === 'perk_selection' && (
        <PerkModal perks={perkChoices} onSelect={handleSelectPerk} />
      )}

      {/* Status Modals: Paused, Victory, Game Over */}
      <StatusModals
        status={gameStatus}
        stats={engineRef.current?.stats || runStats}
        onResume={handleResume}
        onRestart={handleRestart}
        onHome={handleHome}
      />
    </div>
  );
}
