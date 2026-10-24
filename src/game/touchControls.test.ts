import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateJoystickVector, resolveMobileAimAngle } from './touchControls';

test('calculateJoystickVector returns zero at center', () => {
  const result = calculateJoystickVector(100, 100, 100, 100, 50, 0.1);
  assert.equal(result.active, false);
  assert.equal(result.x, 0);
  assert.equal(result.y, 0);
  assert.equal(result.distance, 0);
});

test('calculateJoystickVector ignores movement within deadzone', () => {
  // Move 4px away with maxRadius=50 (4/50 = 0.08, below 0.15 deadzone)
  const result = calculateJoystickVector(104, 100, 100, 100, 50, 0.15);
  assert.equal(result.active, false);
  assert.equal(result.x, 0);
  assert.equal(result.y, 0);
});

test('calculateJoystickVector correctly normalizes full deflection', () => {
  // Full deflection to the right: dx = 50, dy = 0
  const right = calculateJoystickVector(150, 100, 100, 100, 50, 0.1);
  assert.equal(right.active, true);
  assert.ok(Math.abs(right.x - 1.0) < 0.01);
  assert.ok(Math.abs(right.y) < 0.01);
  assert.ok(Math.abs(right.angle - 0) < 0.01);
  assert.equal(right.distance, 1.0);

  // Full deflection downward: dx = 0, dy = 50 -> angle = PI/2
  const down = calculateJoystickVector(100, 150, 100, 100, 50, 0.1);
  assert.equal(down.active, true);
  assert.ok(Math.abs(down.x) < 0.01);
  assert.ok(Math.abs(down.y - 1.0) < 0.01);
  assert.ok(Math.abs(down.angle - Math.PI / 2) < 0.01);

  // Clamps over-extension: touch 100px away with 50px radius
  const over = calculateJoystickVector(200, 100, 100, 100, 50, 0.1);
  assert.ok(over.distance <= 1.0);
  assert.ok(Math.abs(over.x - 1.0) < 0.01);
});

test('resolveMobileAimAngle prioritizes explicit touch aim angle', () => {
  const angle = resolveMobileAimAngle(
    Math.PI / 4, // explicit aim
    true,        // isFiring
    true,        // autoAimEnabled
    -Math.PI / 2,// nearest enemy
    1, 0,        // moving right
    0            // fallback
  );
  assert.ok(Math.abs(angle - Math.PI / 4) < 0.001);
});

test('resolveMobileAimAngle locks to nearest enemy when firing with auto-aim enabled', () => {
  const enemyAngle = -1.2;
  const angle = resolveMobileAimAngle(
    null,        // no explicit aim stick
    true,        // firing
    true,        // autoAim enabled
    enemyAngle,  // enemy located at -1.2 rad
    0, 1,        // moving down
    0            // fallback
  );
  assert.equal(angle, enemyAngle);
});

test('resolveMobileAimAngle falls back to movement heading when steering with joystick', () => {
  // Moving diagonally up-left: dx = -1, dy = -1 -> angle = -3*PI/4
  const expectedAngle = Math.atan2(-1, -1);
  const angle = resolveMobileAimAngle(
    null,
    false,
    true,
    null,
    -1, -1,
    0
  );
  assert.ok(Math.abs(angle - expectedAngle) < 0.001);
});

test('resolveMobileAimAngle preserves fallback heading when completely idle', () => {
  const angle = resolveMobileAimAngle(
    null,
    false,
    true,
    null,
    0, 0,
    1.57
  );
  assert.equal(angle, 1.57);
});
