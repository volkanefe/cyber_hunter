/**
 * Pure helper functions for Mobile Touch Controls (Virtual Joysticks, Vectors, Deadzones & Aim Angle Resolution).
 * Fully decoupled and unit-testable.
 */

export interface JoystickVector {
  x: number; // Normalized -1.0 to 1.0
  y: number; // Normalized -1.0 to 1.0
  angle: number; // Angle in radians
  distance: number; // Normalized 0.0 to 1.0
  active: boolean; // Whether distance exceeds deadzone
}

/**
 * Calculates normalized joystick coordinates and angle from touch position and base origin.
 * @param touchX Current touch client X
 * @param touchY Current touch client Y
 * @param originX Joystick center client X
 * @param originY Joystick center client Y
 * @param maxRadius Maximum travel radius in pixels (e.g. 50px)
 * @param deadzone Deadzone threshold (0 to 1, default 0.12)
 */
export function calculateJoystickVector(
  touchX: number,
  touchY: number,
  originX: number,
  originY: number,
  maxRadius: number,
  deadzone: number = 0.12
): JoystickVector {
  const dx = touchX - originX;
  const dy = touchY - originY;
  const dist = Math.hypot(dx, dy);

  if (dist === 0) {
    return { x: 0, y: 0, angle: 0, distance: 0, active: false };
  }

  const angle = Math.atan2(dy, dx);
  const normalizedDist = Math.min(1.0, dist / Math.max(1, maxRadius));

  if (normalizedDist < deadzone) {
    return { x: 0, y: 0, angle, distance: 0, active: false };
  }

  // Rescale distance beyond deadzone for smooth transition
  const scaledDist = (normalizedDist - deadzone) / (1.0 - deadzone);
  const x = Math.cos(angle) * scaledDist;
  const y = Math.sin(angle) * scaledDist;

  return {
    x: Math.max(-1.0, Math.min(1.0, x)),
    y: Math.max(-1.0, Math.min(1.0, y)),
    angle,
    distance: scaledDist,
    active: true,
  };
}

/**
 * Resolves the player's ship facing/aim angle based on mobile inputs:
 * 1. Explicit aim stick angle (highest priority)
 * 2. Auto-aim lock on nearest enemy if firing and auto-aim is enabled
 * 3. Movement vector heading (so ship faces where it flies when moving)
 * 4. Fallback previous angle
 */
export function resolveMobileAimAngle(
  touchAimAngle: number | null,
  isFiring: boolean,
  autoAimEnabled: boolean,
  nearestEnemyAngle: number | null,
  moveX: number,
  moveY: number,
  fallbackAngle: number
): number {
  // 1. Explicit aim from right joystick
  if (touchAimAngle !== null) {
    return touchAimAngle;
  }

  // 2. Auto-aim lock if firing and enemy in range
  if (isFiring && autoAimEnabled && nearestEnemyAngle !== null) {
    return nearestEnemyAngle;
  }

  // 3. Movement direction heading
  if (Math.hypot(moveX, moveY) > 0.05) {
    return Math.atan2(moveY, moveX);
  }

  // 4. Preserve existing heading
  return fallbackAngle;
}

/**
 * Checks if the user is running on a touch-capable device.
 */
export function detectTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    window.matchMedia('(pointer: coarse)').matches
  );
}
