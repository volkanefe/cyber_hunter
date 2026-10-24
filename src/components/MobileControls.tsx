import React, { useRef, useState, useEffect, useCallback } from 'react';
import { GameEngine } from '../game/engine';
import { calculateJoystickVector } from '../game/touchControls';
import { Crosshair, Zap, Globe, Target, Flame, RefreshCw, Rocket } from 'lucide-react';
import { ALL_WEAPONS } from '../game/weapons';
import { WeaponId } from '../game/types';

interface MobileControlsProps {
  engine: GameEngine | null;
  dashReady: boolean;
  dashCooldownPct: number;
  autoAimEnabled: boolean;
  onToggleAutoAim: () => void;
  onCycleWeapon?: () => void;
  currentWeaponId?: WeaponId;
  wingRocketReady?: boolean;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  engine,
  dashReady,
  dashCooldownPct,
  autoAimEnabled,
  onToggleAutoAim,
  onCycleWeapon,
  currentWeaponId = 'plasma_blaster',
  wingRocketReady = true,
}) => {
  // Left Movement Joystick State
  const leftBaseRef = useRef<HTMLDivElement | null>(null);
  const leftTouchIdRef = useRef<number | null>(null);
  const [leftKnobPos, setLeftKnobPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isLeftActive, setIsLeftActive] = useState<boolean>(false);

  // Right Aim & Fire Joystick State
  const rightBaseRef = useRef<HTMLDivElement | null>(null);
  const rightTouchIdRef = useRef<number | null>(null);
  const [rightKnobPos, setRightKnobPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isRightActive, setIsRightActive] = useState<boolean>(false);

  // Fire button state
  const [isHoldingFireButton, setIsHoldingFireButton] = useState<boolean>(false);
  const fireButtonTouchIdRef = useRef<number | null>(null);

  // In-orbit detection for planet interaction
  const [nearPlanetName, setNearPlanetName] = useState<string | null>(null);

  const JOYSTICK_MAX_RADIUS = 46;

  // Poll planet proximity periodically
  useEffect(() => {
    const timer = setInterval(() => {
      if (!engine) return;
      const planet = engine.isPlayerNearPlanet();
      setNearPlanetName(planet && !planet.scanned ? planet.nameTr : null);
    }, 400);
    return () => clearInterval(timer);
  }, [engine]);

  // --- LEFT JOYSTICK HANDLERS (Movement & Steering) ---
  const handleLeftTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      if (!leftBaseRef.current || leftTouchIdRef.current !== null) return;
      const touch = e.changedTouches[0];
      leftTouchIdRef.current = touch.identifier;
      setIsLeftActive(true);

      const rect = leftBaseRef.current.getBoundingClientRect();
      const originX = rect.left + rect.width / 2;
      const originY = rect.top + rect.height / 2;

      const vec = calculateJoystickVector(touch.clientX, touch.clientY, originX, originY, JOYSTICK_MAX_RADIUS);
      setLeftKnobPos({ x: vec.x * JOYSTICK_MAX_RADIUS, y: vec.y * JOYSTICK_MAX_RADIUS });
      engine?.setTouchMovement(vec.x, vec.y);
    },
    [engine]
  );

  const handleLeftTouchMove = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      if (!leftBaseRef.current || leftTouchIdRef.current === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === leftTouchIdRef.current) {
          const rect = leftBaseRef.current.getBoundingClientRect();
          const originX = rect.left + rect.width / 2;
          const originY = rect.top + rect.height / 2;

          const vec = calculateJoystickVector(
            touch.clientX,
            touch.clientY,
            originX,
            originY,
            JOYSTICK_MAX_RADIUS
          );
          setLeftKnobPos({ x: vec.x * JOYSTICK_MAX_RADIUS, y: vec.y * JOYSTICK_MAX_RADIUS });
          engine?.setTouchMovement(vec.x, vec.y);
          break;
        }
      }
    },
    [engine]
  );

  const handleLeftTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (leftTouchIdRef.current === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === leftTouchIdRef.current) {
          leftTouchIdRef.current = null;
          setIsLeftActive(false);
          setLeftKnobPos({ x: 0, y: 0 });
          engine?.setTouchMovement(0, 0);
          break;
        }
      }
    },
    [engine]
  );

  // --- RIGHT JOYSTICK HANDLERS (Aim & Continuous Fire) ---
  const handleRightTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      if (!rightBaseRef.current || rightTouchIdRef.current !== null) return;
      const touch = e.changedTouches[0];
      rightTouchIdRef.current = touch.identifier;
      setIsRightActive(true);

      const rect = rightBaseRef.current.getBoundingClientRect();
      const originX = rect.left + rect.width / 2;
      const originY = rect.top + rect.height / 2;

      const vec = calculateJoystickVector(touch.clientX, touch.clientY, originX, originY, JOYSTICK_MAX_RADIUS);
      setRightKnobPos({ x: vec.x * JOYSTICK_MAX_RADIUS, y: vec.y * JOYSTICK_MAX_RADIUS });

      engine?.setTouchFiring(true);
      if (vec.active) {
        engine?.setTouchAim(vec.angle);
      }
    },
    [engine]
  );

  const handleRightTouchMove = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      if (!rightBaseRef.current || rightTouchIdRef.current === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === rightTouchIdRef.current) {
          const rect = rightBaseRef.current.getBoundingClientRect();
          const originX = rect.left + rect.width / 2;
          const originY = rect.top + rect.height / 2;

          const vec = calculateJoystickVector(
            touch.clientX,
            touch.clientY,
            originX,
            originY,
            JOYSTICK_MAX_RADIUS
          );
          setRightKnobPos({ x: vec.x * JOYSTICK_MAX_RADIUS, y: vec.y * JOYSTICK_MAX_RADIUS });

          engine?.setTouchFiring(true);
          if (vec.active) {
            engine?.setTouchAim(vec.angle);
          }
          break;
        }
      }
    },
    [engine]
  );

  const handleRightTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (rightTouchIdRef.current === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === rightTouchIdRef.current) {
          rightTouchIdRef.current = null;
          setIsRightActive(false);
          setRightKnobPos({ x: 0, y: 0 });
          engine?.setTouchAim(null);
          // Only stop firing if separate fire button is not also being held
          if (!isHoldingFireButton) {
            engine?.setTouchFiring(false);
          }
          break;
        }
      }
    },
    [engine, isHoldingFireButton]
  );

  // --- DEDICATED FIRE BUTTON HANDLERS ---
  const handleFireButtonStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      if (fireButtonTouchIdRef.current !== null) return;
      const touch = e.changedTouches[0];
      fireButtonTouchIdRef.current = touch.identifier;
      setIsHoldingFireButton(true);
      engine?.setTouchFiring(true);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate(10);
        } catch {}
      }
    },
    [engine]
  );

  const handleFireButtonEnd = useCallback(
    (e: React.TouchEvent) => {
      if (fireButtonTouchIdRef.current === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === fireButtonTouchIdRef.current) {
          fireButtonTouchIdRef.current = null;
          setIsHoldingFireButton(false);
          if (!isRightActive) {
            engine?.setTouchFiring(false);
          }
          break;
        }
      }
    },
    [engine, isRightActive]
  );

  // --- DASH BUTTON HANDLER ---
  const handleDashClick = useCallback(() => {
    engine?.triggerDash();
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(25);
      } catch {}
    }
  }, [engine]);

  return (
    <div className="fixed inset-0 pointer-events-none z-25 select-none touch-none overflow-hidden">
      {/* LEFT QUADRANT: Movement Virtual Joystick */}
      <div className="absolute bottom-4 left-4 sm:bottom-8 sm:left-8 pointer-events-auto flex flex-col items-center">
        <div
          ref={leftBaseRef}
          onTouchStart={handleLeftTouchStart}
          onTouchMove={handleLeftTouchMove}
          onTouchEnd={handleLeftTouchEnd}
          onTouchCancel={handleLeftTouchEnd}
          aria-label="Sanal Hareket Joystick'i"
          className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 transition-colors duration-200 flex items-center justify-center backdrop-blur-sm cursor-grab active:cursor-grabbing shadow-[0_0_20px_rgba(6,182,212,0.25)] ${
            isLeftActive
              ? 'bg-cyan-950/70 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.6)]'
              : 'bg-slate-950/50 border-cyan-500/40 hover:border-cyan-400/60'
          }`}
          style={{ touchAction: 'none' }}
        >
          {/* Base Crosshairs Indicator */}
          <div className="absolute w-full h-[1px] bg-cyan-500/20 pointer-events-none" />
          <div className="absolute h-full w-[1px] bg-cyan-500/20 pointer-events-none" />
          <div className="absolute w-7 h-7 rounded-full border border-cyan-500/30 pointer-events-none" />

          {/* Draggable Glowing Thumb Knob */}
          <div
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full border-2 flex items-center justify-center transition-transform duration-75 shadow-lg ${
              isLeftActive
                ? 'bg-gradient-to-br from-cyan-400 to-blue-600 border-white text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.8)] scale-105'
                : 'bg-cyan-950/80 border-cyan-400 text-cyan-300'
            }`}
            style={{
              transform: `translate(${leftKnobPos.x}px, ${leftKnobPos.y}px)`,
            }}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_6px_#fff]" />
          </div>
        </div>
        <span className="mt-1 text-[9px] sm:text-[10px] font-display font-bold tracking-widest text-cyan-400/80 uppercase">
          İLERLE / DÖN
        </span>
      </div>

      {/* RIGHT QUADRANT: Aim & Action Cluster (Never crosses into left screen half) */}
      <div className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8 pointer-events-auto flex flex-col items-end gap-2">
        {/* Top Mini-Bar: Auto-Aim Toggle & In-Orbit Status */}
        <div className="flex items-center gap-2 pr-1">
          {nearPlanetName && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-950/85 border border-amber-400 text-amber-300 text-[9px] font-display font-bold animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.4)]">
              <Globe className="w-2.5 h-2.5 text-amber-400" />
              <span>{nearPlanetName}</span>
            </div>
          )}

          <button
            type="button"
            onClick={onToggleAutoAim}
            aria-label="Otomatik Nişan Aç/Kapat"
            className={`flex items-center gap-1 px-2 py-1 rounded-full border text-[9px] sm:text-[10px] font-display font-bold tracking-wider transition-all cursor-pointer shadow-md ${
              autoAimEnabled
                ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.35)]'
                : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Target className="w-3 h-3 text-current" />
            <span>{autoAimEnabled ? 'OTO NİŞAN' : 'SERBEST'}</span>
          </button>

          {/* Wing Rocket Readiness Indicator Badge */}
          <div
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] font-display font-bold tracking-wider transition-all ${
              wingRocketReady
                ? 'bg-rose-950/80 border-rose-400 text-rose-300 shadow-[0_0_8px_rgba(244,63,94,0.4)] animate-pulse'
                : 'bg-slate-900/60 border-slate-800 text-slate-500'
            }`}
          >
            <Rocket className="w-3 h-3" />
            <span>{wingRocketReady ? 'ROKET: HAZIR' : 'DOLUYOR'}</span>
          </div>
        </div>

        {/* Action Controls Row: Weapon Switch, Dash, Fire, Aim Joystick */}
        <div className="flex items-end gap-1.5 sm:gap-2.5">
          {/* Quick Weapon Switch Button */}
          <div className="flex flex-col items-center">
            <button
              type="button"
              onClick={() => {
                if (onCycleWeapon) onCycleWeapon();
                else engine?.cycleWeapon();
              }}
              aria-label="Silah Değiştir"
              className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 flex items-center justify-center font-display font-bold transition-all shadow-lg active:scale-95 cursor-pointer bg-slate-950/90 text-cyan-300"
              style={{
                borderColor: ALL_WEAPONS[currentWeaponId]?.color || '#38bdf8',
                boxShadow: `0 0 10px ${ALL_WEAPONS[currentWeaponId]?.color || '#38bdf8'}60`,
              }}
            >
              <RefreshCw className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-current animate-spin" style={{ animationDuration: '10s' }} />
              <div
                className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border border-slate-950"
                style={{ backgroundColor: ALL_WEAPONS[currentWeaponId]?.color || '#38bdf8' }}
              />
            </button>
            <span className="mt-1 text-[8px] sm:text-[9px] font-display font-bold text-cyan-300/90 tracking-wider">
              SİLAH
            </span>
          </div>

          {/* Dash Button */}
          <div className="flex flex-col items-center">
            <button
              type="button"
              onClick={handleDashClick}
              disabled={!dashReady}
              aria-label="Atılma (Dash) Yeteneği"
              className={`relative w-11 h-11 sm:w-13 sm:h-13 rounded-full border-2 flex items-center justify-center font-display font-bold transition-all shadow-lg active:scale-95 cursor-pointer ${
                dashReady
                  ? 'bg-gradient-to-br from-amber-500 to-amber-700 border-amber-300 text-slate-950 shadow-[0_0_16px_rgba(245,158,11,0.6)] animate-pulse'
                  : 'bg-slate-900/80 border-slate-700 text-slate-500 cursor-not-allowed opacity-75'
              }`}
            >
              <Zap className={`w-4 h-4 sm:w-5 sm:h-5 ${dashReady ? 'fill-slate-950' : 'text-slate-500'}`} />
              {!dashReady && (
                <div
                  className="absolute inset-0 rounded-full border-2 border-amber-400/40"
                  style={{ opacity: dashCooldownPct / 100 }}
                />
              )}
            </button>
            <span className="mt-1 text-[8px] sm:text-[9px] font-display font-bold text-amber-400/90 tracking-wider">
              ATILMA
            </span>
          </div>

          {/* Quick Fire Button */}
          <div className="flex flex-col items-center">
            <button
              type="button"
              onTouchStart={handleFireButtonStart}
              onTouchEnd={handleFireButtonEnd}
              onTouchCancel={handleFireButtonEnd}
              onMouseDown={() => {
                setIsHoldingFireButton(true);
                engine?.setTouchFiring(true);
              }}
              onMouseUp={() => {
                setIsHoldingFireButton(false);
                if (!isRightActive) engine?.setTouchFiring(false);
              }}
              aria-label="Ateş Etme Düğmesi"
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 flex items-center justify-center font-display font-bold transition-transform shadow-lg active:scale-95 cursor-pointer ${
                isHoldingFireButton
                  ? 'bg-rose-500 border-white text-white shadow-[0_0_20px_rgba(244,63,94,0.8)] scale-105'
                  : 'bg-gradient-to-br from-rose-600/90 to-red-800/90 border-rose-400 text-rose-100 shadow-[0_0_15px_rgba(244,63,94,0.45)]'
              }`}
              style={{ touchAction: 'none' }}
            >
              <Flame className="w-5 h-5 sm:w-6 sm:h-6 fill-current animate-pulse" />
            </button>
            <span className="mt-1 text-[8px] sm:text-[9px] font-display font-bold text-rose-400 tracking-wider">
              ATEŞ
            </span>
          </div>

          {/* Right Aim & Fire Joystick (360 Degree Aim + Auto-Fire) */}
          <div className="flex flex-col items-center">
            <div
              ref={rightBaseRef}
              onTouchStart={handleRightTouchStart}
              onTouchMove={handleRightTouchMove}
              onTouchEnd={handleRightTouchEnd}
              onTouchCancel={handleRightTouchEnd}
              aria-label="Sanal Nişan ve Ateş Joystick'i"
              className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 transition-colors duration-200 flex items-center justify-center backdrop-blur-sm cursor-grab active:cursor-grabbing shadow-[0_0_20px_rgba(244,63,94,0.25)] ${
                isRightActive
                  ? 'bg-rose-950/70 border-rose-400 shadow-[0_0_25px_rgba(244,63,94,0.6)]'
                  : 'bg-slate-950/50 border-rose-500/40 hover:border-rose-400/60'
              }`}
              style={{ touchAction: 'none' }}
            >
              {/* Base Reticle Indicator */}
              <div className="absolute w-full h-[1px] bg-rose-500/20 pointer-events-none" />
              <div className="absolute h-full w-[1px] bg-rose-500/20 pointer-events-none" />
              <div className="absolute w-7 h-7 rounded-full border border-rose-500/30 pointer-events-none" />

              {/* Draggable Glowing Aim Thumb Knob */}
              <div
                className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full border-2 flex items-center justify-center transition-transform duration-75 shadow-lg ${
                  isRightActive
                    ? 'bg-gradient-to-br from-rose-500 to-amber-600 border-white text-white shadow-[0_0_15px_rgba(244,63,94,0.8)] scale-105'
                    : 'bg-rose-950/80 border-rose-400 text-rose-300'
                }`}
                style={{
                  transform: `translate(${rightKnobPos.x}px, ${rightKnobPos.y}px)`,
                }}
              >
                <Crosshair className="w-4 h-4 sm:w-5 sm:h-5 text-current animate-spin" style={{ animationDuration: '6s' }} />
              </div>
            </div>
            <span className="mt-1 text-[9px] sm:text-[10px] font-display font-bold tracking-widest text-rose-400/80 uppercase">
              NİŞAN & ATEŞ
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
