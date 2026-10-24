import { PlayerState, PerkId } from './types';

export function distance(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function circleIntersectsCircle(
  x1: number,
  y1: number,
  r1: number,
  x2: number,
  y2: number,
  r2: number
): boolean {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const totalRadius = r1 + r2;
  return dx * dx + dy * dy <= totalRadius * totalRadius;
}

export function calculateScore(baseValue: number, comboMultiplier: number): number {
  const mult = Math.max(1, Math.floor(comboMultiplier));
  return baseValue * mult;
}

export function getXpRequiredForLevel(level: number): number {
  // Scaling XP curve for roguelite progression
  return Math.round(35 * Math.pow(1.32, Math.max(0, level - 1)));
}

export interface DamageResult {
  shieldDamage: number;
  hpDamage: number;
  remainingShield: number;
  remainingHp: number;
  isDead: boolean;
}

export function applyDamageToPlayer(
  currentHp: number,
  currentShield: number,
  incomingDamage: number
): DamageResult {
  const clampedDamage = Math.max(0, incomingDamage);
  let shieldDamage = 0;
  let hpDamage = 0;

  let remShield = currentShield;
  let remHp = currentHp;

  if (remShield >= clampedDamage) {
    shieldDamage = clampedDamage;
    remShield -= clampedDamage;
  } else {
    shieldDamage = remShield;
    const leftover = clampedDamage - remShield;
    remShield = 0;
    hpDamage = Math.min(remHp, leftover);
    remHp = Math.max(0, remHp - leftover);
  }

  return {
    shieldDamage,
    hpDamage,
    remainingShield: remShield,
    remainingHp: remHp,
    isDead: remHp <= 0,
  };
}

export function applyPerk(player: PlayerState, perkId: PerkId): void {
  switch (perkId) {
    case 'double_barrel':
      player.doubleShot = true;
      break;
    case 'piercing_rounds':
      player.pierceCount += 2;
      break;
    case 'plasma_shield':
      player.maxShield += 50;
      player.shield = Math.min(player.maxShield, player.shield + 50);
      break;
    case 'overcharge_thrust':
      player.speed = Math.round(player.speed * 1.25);
      player.dashCooldown = Math.max(1.0, player.dashCooldown - 1.0);
      break;
    case 'magnetic_collector':
      player.magnetRadius *= 3;
      break;
    case 'emp_nova':
      player.empCooldown = 8.0;
      player.empTimer = 8.0;
      break;
    case 'nanite_repair':
      player.maxHp += 40;
      player.hp = Math.min(player.maxHp, player.hp + 60);
      break;
    case 'homing_missiles':
      player.homingCount += 2;
      break;
    case 'hyper_cooling':
      player.fireRate *= 1.35;
      player.bulletSpeed = Math.round(player.bulletSpeed * 1.2);
      break;
  }
}

export function checkWaveCompletion(enemiesAlive: number, waveSpawnRemaining: number): boolean {
  return enemiesAlive === 0 && waveSpawnRemaining <= 0;
}

export function getWaveTargetEnemies(wave: number): number {
  if (wave === 5) {
    // Wave 5 is Boss wave with guardian minions
    return 16;
  }
  return 12 + wave * 6;
}

export function calculateCombatIntensity(
  enemyCount: number,
  isBossAlive: boolean,
  playerHpRatio: number,
  combo: number
): number {
  const enemyFactor = Math.min(1.0, enemyCount / 14) * 0.45;
  const bossFactor = isBossAlive ? 0.35 : 0;
  const dangerFactor = playerHpRatio < 0.35 ? 0.2 : 0;
  const comboFactor = Math.min(0.2, Math.max(0, combo - 1) * 0.04);
  const total = enemyFactor + bossFactor + dangerFactor + comboFactor;
  return Math.max(0, Math.min(1.0, Math.round(total * 100) / 100));
}
