import { CelestialGalaxy, Planet } from './types';
import { distance } from './rules';

export function createDefaultGalaxies(): CelestialGalaxy[] {
  return [
    {
      id: 1,
      x: 700,
      y: 600,
      radius: 180,
      angle: 0.4,
      rotationSpeed: 0.012,
      arms: 2,
      colorCore: 'rgba(253, 224, 71, 0.7)', // Warm golden core
      colorArm: 'rgba(168, 85, 247, 0.25)', // Purple spiral arm
      parallaxFactor: 0.12,
    },
    {
      id: 2,
      x: 2000,
      y: 1800,
      radius: 220,
      angle: 1.8,
      rotationSpeed: -0.009,
      arms: 3,
      colorCore: 'rgba(56, 189, 248, 0.8)', // Cyan core
      colorArm: 'rgba(6, 182, 212, 0.22)', // Deep cyan arms
      parallaxFactor: 0.16,
    },
    {
      id: 3,
      x: 1300,
      y: 2200,
      radius: 140,
      angle: 2.5,
      rotationSpeed: 0.015,
      arms: 2,
      colorCore: 'rgba(244, 63, 94, 0.75)', // Rose nebula core
      colorArm: 'rgba(236, 72, 153, 0.2)', // Pink arms
      parallaxFactor: 0.14,
    },
  ];
}

export function createDefaultPlanets(): Planet[] {
  return [
    {
      id: 'planet_aura_major',
      nameTr: 'Aura Major',
      type: 'gas_giant',
      worldX: 620,
      worldY: 620,
      radius: 88,
      rotation: 0,
      rotationSpeed: 0.04,
      colorBase: '#0284c7', // Cyan blue
      colorSecondary: '#38bdf8',
      colorAtmosphere: 'rgba(56, 189, 248, 0.35)',
      hasRings: true,
      ringColor: 'rgba(6, 182, 212, 0.4)',
      ringTilt: 0.45,
      orbitRadius: 240,
      scanned: false,
      scanProgress: 0,
      perkEffectTr: 'Kalkan Dolum Alanı (+%30 Hız)',
      moons: [
        {
          distance: 140,
          radius: 9,
          angle: 0.5,
          speed: 0.3,
          color: '#cbd5e1',
        },
      ],
    },
    {
      id: 'planet_magma_prime',
      nameTr: 'Kızıl Magma',
      type: 'lava',
      worldX: 2050,
      worldY: 580,
      radius: 72,
      rotation: 1.2,
      rotationSpeed: -0.03,
      colorBase: '#991b1b', // Deep crimson
      colorSecondary: '#f97316', // Fiery orange cracks
      colorAtmosphere: 'rgba(239, 68, 68, 0.3)',
      hasRings: false,
      orbitRadius: 210,
      scanned: false,
      scanProgress: 0,
      perkEffectTr: 'Plazma Aşırı Isınma Alanı (+%20 Hasar)',
    },
    {
      id: 'planet_cryo_nova',
      nameTr: 'Buzul Nova',
      type: 'ice',
      worldX: 550,
      worldY: 2020,
      radius: 80,
      rotation: 2.1,
      rotationSpeed: 0.025,
      colorBase: '#1e3a8a', // Deep navy ice
      colorSecondary: '#93c5fd', // Glacial white/blue
      colorAtmosphere: 'rgba(147, 197, 253, 0.35)',
      hasRings: true,
      ringColor: 'rgba(186, 230, 253, 0.35)',
      ringTilt: -0.35,
      orbitRadius: 230,
      scanned: false,
      scanProgress: 0,
      perkEffectTr: 'Kriyojenik Soğutma (+%25 Ateş Hızı)',
    },
    {
      id: 'planet_cyber_citadel',
      nameTr: 'Siber Kale Kolonisi',
      type: 'cyber_citadel',
      worldX: 2050,
      worldY: 2050,
      radius: 68,
      rotation: 0.8,
      rotationSpeed: 0.02,
      colorBase: '#0f172a', // Obsidian dark
      colorSecondary: '#06b6d4', // Neon cyber grid lights
      colorAtmosphere: 'rgba(6, 182, 212, 0.4)',
      hasRings: false,
      orbitRadius: 200,
      scanned: false,
      scanProgress: 0,
      perkEffectTr: 'Koloni Radar Alanı (+%25 Manyetik Çekim)',
      moons: [
        {
          distance: 110,
          radius: 7,
          angle: 2.2,
          speed: -0.4,
          color: '#38bdf8',
        },
      ],
    },
  ];
}

export function isPlayerInPlanetOrbit(playerX: number, playerY: number, planet: Planet): boolean {
  return distance(playerX, playerY, planet.worldX, planet.worldY) <= planet.orbitRadius;
}

export function updatePlanetScan(
  planet: Planet,
  inOrbit: boolean,
  dt: number
): { completedNow: boolean } {
  if (planet.scanned) {
    return { completedNow: false };
  }

  if (inOrbit) {
    planet.scanProgress = Math.min(1.0, planet.scanProgress + dt * 0.35); // takes ~2.8s in orbit
    if (planet.scanProgress >= 1.0) {
      planet.scanned = true;
      return { completedNow: true };
    }
  } else {
    // slow decay if leaves orbit
    planet.scanProgress = Math.max(0, planet.scanProgress - dt * 0.15);
  }

  return { completedNow: false };
}

// Rendering Celestial Galaxies with Spiral Arms
export function drawGalaxy(
  ctx: CanvasRenderingContext2D,
  galaxy: CelestialGalaxy,
  camX: number,
  camY: number,
  screenWidth: number,
  screenHeight: number
) {
  // Parallax translation
  const screenX = ((galaxy.x - camX * galaxy.parallaxFactor) % 2600 + 2600) % 2600;
  const screenY = ((galaxy.y - camY * galaxy.parallaxFactor) % 2600 + 2600) % 2600;

  // Culling
  if (
    screenX + galaxy.radius < 0 ||
    screenX - galaxy.radius > screenWidth ||
    screenY + galaxy.radius < 0 ||
    screenY - galaxy.radius > screenHeight
  ) {
    return;
  }

  ctx.save();
  ctx.translate(screenX, screenY);
  ctx.rotate(galaxy.angle);

  // Core Glow
  const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, galaxy.radius * 0.4);
  coreGrad.addColorStop(0, '#ffffff');
  coreGrad.addColorStop(0.3, galaxy.colorCore);
  coreGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(0, 0, galaxy.radius * 0.4, 0, Math.PI * 2);
  ctx.fill();

  // Draw Spiral Arms with logarithmic / archimedean curvature
  ctx.fillStyle = galaxy.colorArm;
  for (let arm = 0; arm < galaxy.arms; arm++) {
    const armBaseAngle = (arm / galaxy.arms) * Math.PI * 2;
    for (let i = 8; i < galaxy.radius; i += 5) {
      const theta = armBaseAngle + (i / galaxy.radius) * 3.8;
      const px = Math.cos(theta) * i;
      const py = Math.sin(theta) * (i * 0.65); // elliptical tilt
      const dotSize = Math.max(1, 2.5 * (1 - i / galaxy.radius));

      ctx.beginPath();
      ctx.arc(px, py, dotSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

// Rendering Shaded Atmospheric Planets with Rings and Orbit Rings
export function drawPlanet(
  ctx: CanvasRenderingContext2D,
  planet: Planet,
  camX: number,
  camY: number,
  playerX: number,
  playerY: number
) {
  const sx = planet.worldX - camX;
  const sy = planet.worldY - camY;

  // Orbit Boundary Ring
  ctx.save();
  ctx.strokeStyle = planet.scanned
    ? 'rgba(34, 197, 94, 0.25)'
    : planet.scanProgress > 0
    ? 'rgba(6, 182, 212, 0.5)'
    : 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.arc(sx, sy, planet.orbitRadius, 0, Math.PI * 2);
  ctx.stroke();

  // Orbit Scan Progress HUD Arc
  if (!planet.scanned && planet.scanProgress > 0) {
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 4;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.arc(
      sx,
      sy,
      planet.orbitRadius,
      -Math.PI / 2,
      -Math.PI / 2 + planet.scanProgress * Math.PI * 2
    );
    ctx.stroke();

    // Text Progress
    ctx.font = '700 12px "Orbitron", sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.textAlign = 'center';
    ctx.fillText(
      `TARANIYOR: %${Math.round(planet.scanProgress * 100)}`,
      sx,
      sy + planet.orbitRadius + 22
    );
  }

  // Back half of planet rings (if any)
  if (planet.hasRings && planet.ringColor) {
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(planet.ringTilt || 0.4);
    ctx.scale(1, 0.32);

    ctx.strokeStyle = planet.ringColor;
    ctx.lineWidth = 16;
    ctx.beginPath();
    ctx.arc(0, 0, planet.radius * 1.8, Math.PI, 0); // back arc
    ctx.stroke();
    ctx.restore();
  }

  // Atmospheric Corona Glow
  const glowGrad = ctx.createRadialGradient(
    sx,
    sy,
    planet.radius * 0.8,
    sx,
    sy,
    planet.radius * 1.45
  );
  glowGrad.addColorStop(0, planet.colorAtmosphere);
  glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = glowGrad;
  ctx.beginPath();
  ctx.arc(sx, sy, planet.radius * 1.45, 0, Math.PI * 2);
  ctx.fill();

  // Spherical Shaded Planet Body
  ctx.save();
  ctx.beginPath();
  ctx.arc(sx, sy, planet.radius, 0, Math.PI * 2);
  ctx.clip();

  // Base spherical gradient with light from top-left (-0.35, -0.35)
  const sphereGrad = ctx.createRadialGradient(
    sx - planet.radius * 0.35,
    sy - planet.radius * 0.35,
    planet.radius * 0.1,
    sx,
    sy,
    planet.radius
  );
  sphereGrad.addColorStop(0, planet.colorSecondary);
  sphereGrad.addColorStop(0.5, planet.colorBase);
  sphereGrad.addColorStop(1, '#020617'); // Dark shadow side
  ctx.fillStyle = sphereGrad;
  ctx.fillRect(
    sx - planet.radius,
    sy - planet.radius,
    planet.radius * 2,
    planet.radius * 2
  );

  // Surface Details (Bands, Cracks, City lights)
  ctx.save();
  ctx.translate(sx, sy);
  ctx.rotate(planet.rotation);

  if (planet.type === 'gas_giant') {
    // Swirling atmospheric bands
    ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
    for (let b = -planet.radius; b < planet.radius; b += 22) {
      ctx.fillRect(-planet.radius, b, planet.radius * 2, 7);
    }
  } else if (planet.type === 'lava') {
    // Glowing lava fissures
    ctx.strokeStyle = 'rgba(251, 146, 60, 0.7)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-planet.radius * 0.6, -10);
    ctx.lineTo(-10, 20);
    ctx.lineTo(25, -15);
    ctx.lineTo(planet.radius * 0.7, 30);
    ctx.stroke();
  } else if (planet.type === 'ice') {
    // Polar ice caps
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.beginPath();
    ctx.arc(0, -planet.radius * 0.75, planet.radius * 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, planet.radius * 0.75, planet.radius * 0.35, 0, Math.PI * 2);
    ctx.fill();
  } else if (planet.type === 'cyber_citadel') {
    // Neon grid metropolis nodes
    ctx.fillStyle = '#06b6d4';
    for (let c = -40; c <= 40; c += 20) {
      ctx.beginPath();
      ctx.arc(c, (c * c) / 80 - 15, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  ctx.restore(); // end clip

  // Front half of planet rings (overlaying front of sphere)
  if (planet.hasRings && planet.ringColor) {
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(planet.ringTilt || 0.4);
    ctx.scale(1, 0.32);

    ctx.strokeStyle = planet.ringColor;
    ctx.lineWidth = 16;
    ctx.beginPath();
    ctx.arc(0, 0, planet.radius * 1.8, 0, Math.PI); // front arc
    ctx.stroke();
    ctx.restore();
  }

  // Moons
  if (planet.moons) {
    for (const moon of planet.moons) {
      const mx = sx + Math.cos(moon.angle) * moon.distance;
      const my = sy + Math.sin(moon.angle) * moon.distance;
      ctx.fillStyle = moon.color;
      ctx.beginPath();
      ctx.arc(mx, my, moon.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Planet Name Tag & Status
  ctx.font = '700 13px "Orbitron", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = planet.scanned ? '#4ade80' : '#ffffff';
  ctx.shadowColor = '#000000';
  ctx.shadowBlur = 6;
  ctx.fillText(planet.nameTr, sx, sy - planet.radius - 14);

  ctx.font = '600 10px "Rajdhani", sans-serif';
  ctx.fillStyle = planet.scanned ? '#86efac' : '#94a3b8';
  ctx.fillText(
    planet.scanned ? `KEŞFEDİLDİ · ${planet.perkEffectTr}` : 'GÖREV: YÖRÜNGE TARAMASI YAP',
    sx,
    sy - planet.radius - 2
  );

  ctx.restore();
}
