export type ShipClassId = 'interceptor' | 'dreadnought' | 'vanguard';

export interface ShipClass {
  id: ShipClassId;
  nameTr: string;
  nameEn: string;
  taglineTr: string;
  speed: number;
  maxHp: number;
  maxShield: number;
  shieldRechargeRate: number; // shield per sec
  fireRate: number; // shots per sec
  bulletDamage: number;
  bulletSpeed: number;
  dashCooldown: number; // seconds
  color: string;
  trailColor: string;
}

export type EnemyType = 'swarmer' | 'sniper' | 'charger' | 'titan_boss';

export interface Enemy {
  id: number;
  type: EnemyType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hp: number;
  maxHp: number;
  speed: number;
  scoreValue: number;
  xpValue: number;
  color: string;
  angle: number;
  telegraphProgress: number; // 0 to 1 when winding up an attack
  state: 'idle' | 'telegraphing' | 'attacking' | 'recovering';
  stateTimer: number;
  attackCooldown: number;
  hitFlashTimer: number;
  // Archetype specifics
  aimX?: number;
  aimY?: number;
  chargeTargetX?: number;
  chargeTargetY?: number;
}

export interface Bullet {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  isPlayer: boolean;
  color: string;
  pierce: number;
  homing: boolean;
  life: number;
  maxLife: number;
}

export interface Gem {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  value: number;
  type: 'xp' | 'heal' | 'shield';
  radius: number;
}

export interface Particle {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  alpha: number;
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
  vy: number;
}

export type PerkId =
  | 'double_barrel'
  | 'piercing_rounds'
  | 'plasma_shield'
  | 'overcharge_thrust'
  | 'magnetic_collector'
  | 'emp_nova'
  | 'nanite_repair'
  | 'homing_missiles'
  | 'hyper_cooling';

export interface Perk {
  id: PerkId;
  nameTr: string;
  nameEn: string;
  descriptionTr: string;
  descriptionEn: string;
  icon: string;
  tier: 'common' | 'rare' | 'legendary';
}

export interface PlayerState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  hp: number;
  maxHp: number;
  shield: number;
  maxShield: number;
  shieldRechargeTimer: number;
  speed: number;
  fireRate: number;
  fireCooldown: number;
  dashCooldown: number;
  dashTimer: number;
  isDashing: boolean;
  bulletDamage: number;
  bulletSpeed: number;
  pierceCount: number;
  doubleShot: boolean;
  homingCount: number;
  magnetRadius: number;
  empCooldown: number;
  empTimer: number;
  level: number;
  xp: number;
  xpToNextLevel: number;
  hitFlashTimer: number;
  invulnerabilityTimer: number; // i-frames after taking damage
  recentDamageGhost: number; // for trailing damage bar
  ghostFadeTimer: number;
}

export interface RunStats {
  score: number;
  highScore: number;
  combo: number;
  highestCombo: number;
  comboTimer: number;
  kills: number;
  damageDealt: number;
  waveReached: number;
  timeElapsed: number; // in seconds
  perks: PerkId[];
}

export type GameStatus = 'title' | 'playing' | 'paused' | 'perk_selection' | 'gameover' | 'victory';
