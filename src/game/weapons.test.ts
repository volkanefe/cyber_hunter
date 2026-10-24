import test from 'node:test';
import assert from 'node:assert/strict';
import { ALL_WEAPONS, getWeaponDef, getNextWeapon, calculateWeaponVolley, createWingMountedRocket } from './weapons';
import { PlayerState, WeaponId } from './types';

const mockPlayer: PlayerState = {
  x: 500,
  y: 500,
  vx: 0,
  vy: 0,
  angle: 0, // facing East / right
  hp: 100,
  maxHp: 100,
  shield: 100,
  maxShield: 100,
  shieldRechargeTimer: 0,
  speed: 280,
  fireRate: 4,
  fireCooldown: 0,
  dashCooldown: 2.5,
  dashTimer: 0,
  isDashing: false,
  bulletDamage: 25,
  bulletSpeed: 500,
  pierceCount: 0,
  doubleShot: false,
  homingCount: 0,
  magnetRadius: 100,
  empCooldown: 0,
  empTimer: 0,
  level: 1,
  xp: 0,
  xpToNextLevel: 50,
  hitFlashTimer: 0,
  invulnerabilityTimer: 0,
  recentDamageGhost: 100,
  ghostFadeTimer: 0,
  currentWeapon: 'plasma_blaster',
  unlockedWeapons: ['plasma_blaster', 'scatter_cannon', 'quantum_railgun', 'vortex_missiles', 'tesla_arc'],
  wingRocketCooldown: 0,
  wingRocketMaxCooldown: 1.8,
  wingRocketAlternate: false,
  wingRocketReady: true,
};

test('ALL_WEAPONS contains 5 unique weapon types', () => {
  const ids = Object.keys(ALL_WEAPONS) as WeaponId[];
  assert.equal(ids.length, 5);
  assert.ok(ids.includes('plasma_blaster'));
  assert.ok(ids.includes('scatter_cannon'));
  assert.ok(ids.includes('quantum_railgun'));
  assert.ok(ids.includes('vortex_missiles'));
  assert.ok(ids.includes('tesla_arc'));
});

test('getNextWeapon cycles properly through unlocked weapons', () => {
  const unlocked: WeaponId[] = ['plasma_blaster', 'quantum_railgun'];
  assert.equal(getNextWeapon('plasma_blaster', unlocked), 'quantum_railgun');
  assert.equal(getNextWeapon('quantum_railgun', unlocked), 'plasma_blaster');
});

test('calculateWeaponVolley produces correct projectile counts per weapon', () => {
  // Scatter cannon produces 5 burst bullets
  const scatterVolley = calculateWeaponVolley(ALL_WEAPONS.scatter_cannon, mockPlayer, 100);
  assert.equal(scatterVolley.length, 5);
  assert.equal(scatterVolley[0].isPlayer, true);

  // Railgun produces 1 heavy piercing bullet
  const railgunVolley = calculateWeaponVolley(ALL_WEAPONS.quantum_railgun, mockPlayer, 200);
  assert.equal(railgunVolley.length, 1);
  assert.ok(railgunVolley[0].pierce >= 4);
  assert.ok(railgunVolley[0].damage > mockPlayer.bulletDamage);
});

test('createWingMountedRocket creates rocket from left and right wing coordinates', () => {
  const leftRocket = createWingMountedRocket(mockPlayer, 301, true);
  const rightRocket = createWingMountedRocket(mockPlayer, 302, false);

  assert.equal(leftRocket.isRocket, true);
  assert.equal(rightRocket.isRocket, true);
  assert.equal(leftRocket.homing, true);
  assert.ok(leftRocket.damage > mockPlayer.bulletDamage);

  // When facing angle = 0 (right), perpX is 0, perpY is 1
  // Left wing (offset +17) should have a different Y position than right wing (offset -17)
  assert.notEqual(leftRocket.y, rightRocket.y);
  assert.ok(Math.abs(leftRocket.y - (mockPlayer.y + 17)) < 2);
  assert.ok(Math.abs(rightRocket.y - (mockPlayer.y - 17)) < 2);
});
