import { Bullet, PlayerState, WeaponDef, WeaponId } from './types';

export const ALL_WEAPONS: Record<WeaponId, WeaponDef> = {
  plasma_blaster: {
    id: 'plasma_blaster',
    nameTr: 'İkiz Foton Lazer',
    nameEn: 'Twin Photon Laser',
    descriptionTr: 'Yüksek ateş hızlı, dengeli standart siber foton topları.',
    fireRate: 5.5,
    damageMultiplier: 1.0,
    speedMultiplier: 1.0,
    radius: 4.5,
    color: '#38bdf8', // Sky Blue
    burstCount: 2,
    spread: 0.05,
    pierce: 0,
    homing: false,
    icon: 'zap',
  },
  scatter_cannon: {
    id: 'scatter_cannon',
    nameTr: 'Plazma Dağıtıcı (Pompalı)',
    nameEn: 'Scatter Plasma Cannon',
    descriptionTr: 'Geniş açılı 5 plazma mermisi saçar, yakın mesafede ölümcüldür.',
    fireRate: 2.2,
    damageMultiplier: 0.75,
    speedMultiplier: 0.95,
    radius: 5,
    color: '#f97316', // Neon Orange
    burstCount: 5,
    spread: 0.42,
    pierce: 1,
    homing: false,
    icon: 'flame',
  },
  quantum_railgun: {
    id: 'quantum_railgun',
    nameTr: 'Kuantum Raylı Top (Railgun)',
    nameEn: 'Quantum Railgun',
    descriptionTr: 'Düşman saflarını delip geçen yüksek hızlı kuantum ışını.',
    fireRate: 1.8,
    damageMultiplier: 2.6,
    speedMultiplier: 1.6,
    radius: 6,
    color: '#ec4899', // Neon Fuchsia
    burstCount: 1,
    spread: 0,
    pierce: 4,
    homing: false,
    icon: 'crosshair',
  },
  vortex_missiles: {
    id: 'vortex_missiles',
    nameTr: 'Girdap Güdümlü Füzeleri',
    nameEn: 'Vortex Guided Missiles',
    descriptionTr: 'Düşmanları takip eden ve patlayıcı hasar veren mikro füzeler.',
    fireRate: 2.5,
    damageMultiplier: 1.6,
    speedMultiplier: 0.85,
    radius: 5.5,
    color: '#eab308', // Amber Gold
    burstCount: 2,
    spread: 0.35,
    pierce: 1,
    homing: true,
    isRocket: true,
    icon: 'target',
  },
  tesla_arc: {
    id: 'tesla_arc',
    nameTr: 'Tesla İyon Arkı',
    nameEn: 'Tesla Ion Arc',
    descriptionTr: 'Kalkanları hızla eriten, yüksek frekanslı elektrik plazması.',
    fireRate: 4.0,
    damageMultiplier: 1.35,
    speedMultiplier: 1.25,
    radius: 5,
    color: '#a855f7', // Electric Violet
    burstCount: 2,
    spread: 0.12,
    pierce: 2,
    homing: false,
    icon: 'activity',
  },
};

export function getWeaponDef(id: WeaponId): WeaponDef {
  return ALL_WEAPONS[id] || ALL_WEAPONS.plasma_blaster;
}

export function getNextWeapon(current: WeaponId, unlocked: WeaponId[]): WeaponId {
  if (!unlocked || unlocked.length === 0) return 'plasma_blaster';
  const idx = unlocked.indexOf(current);
  if (idx === -1) return unlocked[0];
  return unlocked[(idx + 1) % unlocked.length];
}

/**
 * Calculates bullets for a weapon discharge based on player angle, position and perks.
 */
export function calculateWeaponVolley(
  weapon: WeaponDef,
  p: PlayerState,
  startId: number
): Bullet[] {
  const bullets: Bullet[] = [];
  const forwardX = Math.cos(p.angle);
  const forwardY = Math.sin(p.angle);
  const perpX = -forwardY;
  const perpY = forwardX;

  const baseSpeed = p.bulletSpeed * weapon.speedMultiplier;
  const baseDamage = Math.round(p.bulletDamage * weapon.damageMultiplier);
  const pierce = weapon.pierce + p.pierceCount;

  if (weapon.id === 'plasma_blaster') {
    // Twin parallel cannons from ship nose wings
    const offset = 8;
    bullets.push({
      id: startId,
      x: p.x + perpX * offset + forwardX * 16,
      y: p.y + perpY * offset + forwardY * 16,
      vx: forwardX * baseSpeed,
      vy: forwardY * baseSpeed,
      radius: weapon.radius,
      damage: baseDamage,
      isPlayer: true,
      color: weapon.color,
      pierce,
      homing: false,
      life: 2.5,
      maxLife: 2.5,
    });
    bullets.push({
      id: startId + 1,
      x: p.x - perpX * offset + forwardX * 16,
      y: p.y - perpY * offset + forwardY * 16,
      vx: forwardX * baseSpeed,
      vy: forwardY * baseSpeed,
      radius: weapon.radius,
      damage: baseDamage,
      isPlayer: true,
      color: weapon.color,
      pierce,
      homing: false,
      life: 2.5,
      maxLife: 2.5,
    });
  } else if (weapon.id === 'scatter_cannon') {
    // 5-shot scatter cone
    const count = weapon.burstCount;
    for (let i = 0; i < count; i++) {
      const spreadAngle = p.angle + (i - (count - 1) / 2) * (weapon.spread / (count - 1));
      bullets.push({
        id: startId + i,
        x: p.x + forwardX * 18,
        y: p.y + forwardY * 18,
        vx: Math.cos(spreadAngle) * (baseSpeed * (0.9 + Math.random() * 0.2)),
        vy: Math.sin(spreadAngle) * (baseSpeed * (0.9 + Math.random() * 0.2)),
        radius: weapon.radius,
        damage: baseDamage,
        isPlayer: true,
        color: weapon.color,
        pierce,
        homing: false,
        life: 1.6,
        maxLife: 1.6,
      });
    }
  } else if (weapon.id === 'quantum_railgun') {
    // Single hyper-penetrating hyper-dense railgun beam
    bullets.push({
      id: startId,
      x: p.x + forwardX * 22,
      y: p.y + forwardY * 22,
      vx: forwardX * baseSpeed,
      vy: forwardY * baseSpeed,
      radius: weapon.radius,
      damage: baseDamage,
      isPlayer: true,
      color: weapon.color,
      pierce,
      homing: false,
      life: 2.8,
      maxLife: 2.8,
    });
  } else if (weapon.id === 'vortex_missiles') {
    // Dual seeking rockets launched with angled spread
    const angles = [-0.25, 0.25];
    for (let i = 0; i < angles.length; i++) {
      const mAngle = p.angle + angles[i];
      bullets.push({
        id: startId + i,
        x: p.x + perpX * (i === 0 ? 14 : -14) + forwardX * 10,
        y: p.y + perpY * (i === 0 ? 14 : -14) + forwardY * 10,
        vx: Math.cos(mAngle) * baseSpeed,
        vy: Math.sin(mAngle) * baseSpeed,
        radius: weapon.radius,
        damage: baseDamage,
        isPlayer: true,
        color: weapon.color,
        pierce,
        homing: true,
        isRocket: true,
        trailColor: '#f59e0b',
        life: 2.4,
        maxLife: 2.4,
      });
    }
  } else if (weapon.id === 'tesla_arc') {
    // High-voltage twin arcs with jitter
    const offsets = [7, -7];
    for (let i = 0; i < offsets.length; i++) {
      const jitter = (Math.random() - 0.5) * 0.08;
      const arcAngle = p.angle + jitter;
      bullets.push({
        id: startId + i,
        x: p.x + perpX * offsets[i] + forwardX * 16,
        y: p.y + perpY * offsets[i] + forwardY * 16,
        vx: Math.cos(arcAngle) * baseSpeed,
        vy: Math.sin(arcAngle) * baseSpeed,
        radius: weapon.radius,
        damage: baseDamage,
        isPlayer: true,
        color: weapon.color,
        pierce,
        homing: false,
        isArc: true,
        life: 2.2,
        maxLife: 2.2,
      });
    }
  }

  return bullets;
}

/**
 * Creates a heavy wing-mounted rocket launch from the player's left or right wing pod.
 */
export function createWingMountedRocket(
  p: PlayerState,
  startId: number,
  isLeftWing: boolean
): Bullet {
  const forwardX = Math.cos(p.angle);
  const forwardY = Math.sin(p.angle);
  const perpX = -forwardY;
  const perpY = forwardX;

  // Wing tip rocket pod offset
  const wingOffset = isLeftWing ? 17 : -17;
  const spawnX = p.x + perpX * wingOffset + forwardX * 6;
  const spawnY = p.y + perpY * wingOffset + forwardY * 6;

  // Initial outward ejection velocity before seeking
  const ejectAngle = p.angle + (isLeftWing ? 0.35 : -0.35);
  const rocketSpeed = p.bulletSpeed * 0.9;
  const damage = Math.round(p.bulletDamage * 1.85);

  return {
    id: startId,
    x: spawnX,
    y: spawnY,
    vx: Math.cos(ejectAngle) * rocketSpeed,
    vy: Math.sin(ejectAngle) * rocketSpeed,
    radius: 5.5,
    damage,
    isPlayer: true,
    color: '#f43f5e', // Rose Rocket Warhead
    pierce: 1,
    homing: true,
    isRocket: true,
    trailColor: '#fb923c',
    life: 2.6,
    maxLife: 2.6,
  };
}
