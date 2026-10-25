import { CelestialGalaxy, Planet } from './types';
import { distance } from './rules';

export function createDefaultGalaxies(): CelestialGalaxy[] {
  return createSectorGalaxies(1);
}

export function createSectorGalaxies(sectorId: number): CelestialGalaxy[] {
  switch (sectorId) {
    case 2: // Krynn Asteroid Belt (Emerald / Jade / Amber)
      return [
        {
          id: 1,
          archetype: 'barred_spiral',
          x: 650,
          y: 550,
          radius: 230,
          angle: 0.35,
          rotationSpeed: 0.009,
          arms: 2,
          colorCore: 'rgba(52, 211, 153, 0.85)',
          colorArm: 'rgba(16, 185, 129, 0.35)',
          colorDust: 'rgba(110, 231, 183, 0.4)',
          tilt: 0.55,
          parallaxFactor: 0.12,
        },
        {
          id: 2,
          archetype: 'ring',
          x: 2100,
          y: 650,
          radius: 190,
          angle: 1.2,
          rotationSpeed: -0.008,
          arms: 2,
          colorCore: 'rgba(250, 204, 21, 0.9)',
          colorArm: 'rgba(234, 179, 8, 0.32)',
          colorDust: 'rgba(253, 224, 71, 0.5)',
          tilt: 0.65,
          parallaxFactor: 0.15,
        },
        {
          id: 3,
          archetype: 'grand_spiral',
          x: 1850,
          y: 1950,
          radius: 260,
          angle: 2.1,
          rotationSpeed: 0.007,
          arms: 4,
          colorCore: 'rgba(16, 185, 129, 0.9)',
          colorArm: 'rgba(5, 150, 105, 0.32)',
          colorDust: 'rgba(52, 211, 153, 0.45)',
          tilt: 0.7,
          parallaxFactor: 0.14,
        },
        {
          id: 4,
          archetype: 'starburst',
          x: 600,
          y: 2100,
          radius: 175,
          angle: 0.8,
          rotationSpeed: -0.012,
          arms: 2,
          colorCore: 'rgba(253, 224, 71, 0.95)',
          colorArm: 'rgba(16, 185, 129, 0.28)',
          colorDust: 'rgba(250, 204, 21, 0.4)',
          tilt: 0.6,
          parallaxFactor: 0.16,
        },
        {
          id: 5,
          archetype: 'elliptical',
          x: 1350,
          y: 1300,
          radius: 160,
          angle: 1.5,
          rotationSpeed: 0.005,
          arms: 2,
          colorCore: 'rgba(110, 231, 183, 0.75)',
          colorArm: 'rgba(16, 185, 129, 0.22)',
          tilt: 0.45,
          parallaxFactor: 0.1,
        },
        {
          id: 6,
          archetype: 'grand_spiral',
          x: 2350,
          y: 1350,
          radius: 210,
          angle: 3.0,
          rotationSpeed: 0.011,
          arms: 3,
          colorCore: 'rgba(56, 189, 248, 0.8)',
          colorArm: 'rgba(16, 185, 129, 0.25)',
          tilt: 0.6,
          parallaxFactor: 0.13,
        },
      ];

    case 3: // Violet Ion Rift (Ultraviolet / Purple / Magenta)
      return [
        {
          id: 1,
          archetype: 'grand_spiral',
          x: 700,
          y: 600,
          radius: 270,
          angle: 0.6,
          rotationSpeed: 0.01,
          arms: 3,
          colorCore: 'rgba(232, 121, 249, 0.9)',
          colorArm: 'rgba(168, 85, 247, 0.35)',
          colorDust: 'rgba(192, 132, 252, 0.45)',
          tilt: 0.65,
          parallaxFactor: 0.14,
        },
        {
          id: 2,
          archetype: 'barred_spiral',
          x: 2000,
          y: 700,
          radius: 240,
          angle: 1.9,
          rotationSpeed: -0.009,
          arms: 2,
          colorCore: 'rgba(192, 132, 252, 0.85)',
          colorArm: 'rgba(236, 72, 153, 0.32)',
          colorDust: 'rgba(244, 114, 182, 0.4)',
          tilt: 0.55,
          parallaxFactor: 0.12,
        },
        {
          id: 3,
          archetype: 'ring',
          x: 1900,
          y: 2000,
          radius: 195,
          angle: 2.7,
          rotationSpeed: 0.008,
          arms: 2,
          colorCore: 'rgba(129, 140, 248, 0.9)',
          colorArm: 'rgba(168, 85, 247, 0.3)',
          colorDust: 'rgba(192, 132, 252, 0.4)',
          tilt: 0.6,
          parallaxFactor: 0.15,
        },
        {
          id: 4,
          archetype: 'starburst',
          x: 650,
          y: 2050,
          radius: 185,
          angle: 0.2,
          rotationSpeed: -0.014,
          arms: 2,
          colorCore: 'rgba(255, 255, 255, 0.95)',
          colorArm: 'rgba(168, 85, 247, 0.38)',
          colorDust: 'rgba(236, 72, 153, 0.45)',
          tilt: 0.7,
          parallaxFactor: 0.17,
        },
        {
          id: 5,
          archetype: 'elliptical',
          x: 1300,
          y: 1350,
          radius: 170,
          angle: 1.1,
          rotationSpeed: 0.006,
          arms: 2,
          colorCore: 'rgba(216, 180, 254, 0.8)',
          colorArm: 'rgba(147, 51, 234, 0.25)',
          tilt: 0.5,
          parallaxFactor: 0.11,
        },
        {
          id: 6,
          archetype: 'grand_spiral',
          x: 2300,
          y: 1300,
          radius: 220,
          angle: 2.4,
          rotationSpeed: 0.012,
          arms: 4,
          colorCore: 'rgba(244, 63, 94, 0.85)',
          colorArm: 'rgba(168, 85, 247, 0.28)',
          tilt: 0.62,
          parallaxFactor: 0.13,
        },
      ];

    case 4: // Solar Flare Expanse (Coronal Gold / Orange / Fiery Crimson)
      return [
        {
          id: 1,
          archetype: 'starburst',
          x: 750,
          y: 650,
          radius: 250,
          angle: 0.4,
          rotationSpeed: -0.011,
          arms: 2,
          colorCore: 'rgba(254, 240, 138, 0.95)',
          colorArm: 'rgba(249, 115, 22, 0.38)',
          colorDust: 'rgba(250, 204, 21, 0.5)',
          tilt: 0.6,
          parallaxFactor: 0.15,
        },
        {
          id: 2,
          archetype: 'barred_spiral',
          x: 2100,
          y: 750,
          radius: 240,
          angle: 1.7,
          rotationSpeed: 0.009,
          arms: 2,
          colorCore: 'rgba(250, 204, 21, 0.9)',
          colorArm: 'rgba(234, 88, 12, 0.34)',
          colorDust: 'rgba(251, 146, 60, 0.4)',
          tilt: 0.52,
          parallaxFactor: 0.13,
        },
        {
          id: 3,
          archetype: 'grand_spiral',
          x: 1850,
          y: 1950,
          radius: 280,
          angle: 2.3,
          rotationSpeed: 0.008,
          arms: 3,
          colorCore: 'rgba(253, 186, 116, 0.88)',
          colorArm: 'rgba(239, 68, 68, 0.32)',
          colorDust: 'rgba(249, 115, 22, 0.45)',
          tilt: 0.68,
          parallaxFactor: 0.14,
        },
        {
          id: 4,
          archetype: 'ring',
          x: 600,
          y: 2000,
          radius: 190,
          angle: 0.9,
          rotationSpeed: -0.007,
          arms: 2,
          colorCore: 'rgba(254, 240, 138, 0.92)',
          colorArm: 'rgba(245, 158, 11, 0.35)',
          colorDust: 'rgba(253, 224, 71, 0.45)',
          tilt: 0.64,
          parallaxFactor: 0.16,
        },
        {
          id: 5,
          archetype: 'elliptical',
          x: 1400,
          y: 1300,
          radius: 165,
          angle: 1.3,
          rotationSpeed: 0.006,
          arms: 2,
          colorCore: 'rgba(253, 224, 71, 0.8)',
          colorArm: 'rgba(249, 115, 22, 0.25)',
          tilt: 0.48,
          parallaxFactor: 0.1,
        },
        {
          id: 6,
          archetype: 'grand_spiral',
          x: 2350,
          y: 1400,
          radius: 215,
          angle: 3.1,
          rotationSpeed: 0.01,
          arms: 4,
          colorCore: 'rgba(251, 146, 60, 0.85)',
          colorArm: 'rgba(220, 38, 38, 0.28)',
          tilt: 0.58,
          parallaxFactor: 0.12,
        },
      ];

    case 5: // Cyber Citadel Alpha (Indigo / Cobalt / Neon Cyan)
      return [
        {
          id: 1,
          archetype: 'barred_spiral',
          x: 700,
          y: 550,
          radius: 250,
          angle: 0.5,
          rotationSpeed: 0.01,
          arms: 2,
          colorCore: 'rgba(129, 140, 248, 0.9)',
          colorArm: 'rgba(99, 102, 241, 0.35)',
          colorDust: 'rgba(165, 180, 252, 0.4)',
          tilt: 0.54,
          parallaxFactor: 0.13,
        },
        {
          id: 2,
          archetype: 'grand_spiral',
          x: 2050,
          y: 680,
          radius: 270,
          angle: 1.8,
          rotationSpeed: -0.008,
          arms: 3,
          colorCore: 'rgba(56, 189, 248, 0.9)',
          colorArm: 'rgba(79, 70, 229, 0.32)',
          colorDust: 'rgba(34, 211, 238, 0.45)',
          tilt: 0.65,
          parallaxFactor: 0.14,
        },
        {
          id: 3,
          archetype: 'starburst',
          x: 1850,
          y: 1950,
          radius: 190,
          angle: 2.2,
          rotationSpeed: 0.012,
          arms: 2,
          colorCore: 'rgba(255, 255, 255, 0.95)',
          colorArm: 'rgba(99, 102, 241, 0.35)',
          colorDust: 'rgba(129, 140, 248, 0.45)',
          tilt: 0.6,
          parallaxFactor: 0.16,
        },
        {
          id: 4,
          archetype: 'ring',
          x: 650,
          y: 2050,
          radius: 180,
          angle: 0.7,
          rotationSpeed: -0.007,
          arms: 2,
          colorCore: 'rgba(34, 211, 238, 0.9)',
          colorArm: 'rgba(99, 102, 241, 0.3)',
          colorDust: 'rgba(165, 180, 252, 0.4)',
          tilt: 0.62,
          parallaxFactor: 0.15,
        },
        {
          id: 5,
          archetype: 'elliptical',
          x: 1350,
          y: 1250,
          radius: 175,
          angle: 1.4,
          rotationSpeed: 0.005,
          arms: 2,
          colorCore: 'rgba(165, 180, 252, 0.8)',
          colorArm: 'rgba(67, 56, 202, 0.25)',
          tilt: 0.46,
          parallaxFactor: 0.1,
        },
        {
          id: 6,
          archetype: 'grand_spiral',
          x: 2300,
          y: 1350,
          radius: 220,
          angle: 2.9,
          rotationSpeed: 0.011,
          arms: 4,
          colorCore: 'rgba(192, 132, 252, 0.85)',
          colorArm: 'rgba(99, 102, 241, 0.28)',
          tilt: 0.6,
          parallaxFactor: 0.12,
        },
      ];

    case 6: // Quantum Singularity Field (Aqua / Turquoise / Emerald Marine)
      return [
        {
          id: 1,
          archetype: 'grand_spiral',
          x: 720,
          y: 620,
          radius: 260,
          angle: 0.4,
          rotationSpeed: 0.009,
          arms: 4,
          colorCore: 'rgba(45, 212, 191, 0.9)',
          colorArm: 'rgba(13, 148, 136, 0.35)',
          colorDust: 'rgba(94, 234, 212, 0.45)',
          tilt: 0.66,
          parallaxFactor: 0.14,
        },
        {
          id: 2,
          archetype: 'starburst',
          x: 2050,
          y: 700,
          radius: 195,
          angle: 1.6,
          rotationSpeed: -0.013,
          arms: 2,
          colorCore: 'rgba(255, 255, 255, 0.95)',
          colorArm: 'rgba(20, 184, 166, 0.38)',
          colorDust: 'rgba(45, 212, 191, 0.5)',
          tilt: 0.6,
          parallaxFactor: 0.16,
        },
        {
          id: 3,
          archetype: 'ring',
          x: 1900,
          y: 1950,
          radius: 185,
          angle: 2.4,
          rotationSpeed: 0.008,
          arms: 2,
          colorCore: 'rgba(94, 234, 212, 0.9)',
          colorArm: 'rgba(15, 118, 110, 0.3)',
          colorDust: 'rgba(45, 212, 191, 0.4)',
          tilt: 0.62,
          parallaxFactor: 0.15,
        },
        {
          id: 4,
          archetype: 'barred_spiral',
          x: 600,
          y: 2050,
          radius: 235,
          angle: 0.85,
          rotationSpeed: 0.01,
          arms: 2,
          colorCore: 'rgba(45, 212, 191, 0.88)',
          colorArm: 'rgba(20, 184, 166, 0.32)',
          colorDust: 'rgba(153, 246, 228, 0.4)',
          tilt: 0.54,
          parallaxFactor: 0.12,
        },
        {
          id: 5,
          archetype: 'elliptical',
          x: 1350,
          y: 1300,
          radius: 165,
          angle: 1.2,
          rotationSpeed: 0.005,
          arms: 2,
          colorCore: 'rgba(153, 246, 228, 0.8)',
          colorArm: 'rgba(13, 148, 136, 0.22)',
          tilt: 0.48,
          parallaxFactor: 0.1,
        },
        {
          id: 6,
          archetype: 'grand_spiral',
          x: 2300,
          y: 1300,
          radius: 215,
          angle: 2.8,
          rotationSpeed: -0.009,
          arms: 3,
          colorCore: 'rgba(56, 189, 248, 0.85)',
          colorArm: 'rgba(20, 184, 166, 0.26)',
          tilt: 0.6,
          parallaxFactor: 0.13,
        },
      ];

    case 8: // Bio-Swarm Infestation (Rose / Magenta / Crimson Spores)
      return [
        {
          id: 1,
          archetype: 'grand_spiral',
          x: 700,
          y: 600,
          radius: 270,
          angle: 0.5,
          rotationSpeed: 0.011,
          arms: 3,
          colorCore: 'rgba(251, 113, 133, 0.9)',
          colorArm: 'rgba(244, 63, 94, 0.35)',
          colorDust: 'rgba(253, 164, 175, 0.45)',
          tilt: 0.65,
          parallaxFactor: 0.14,
        },
        {
          id: 2,
          archetype: 'ring',
          x: 2050,
          y: 700,
          radius: 195,
          angle: 1.8,
          rotationSpeed: -0.008,
          arms: 2,
          colorCore: 'rgba(244, 63, 94, 0.9)',
          colorArm: 'rgba(225, 29, 72, 0.32)',
          colorDust: 'rgba(251, 113, 133, 0.45)',
          tilt: 0.62,
          parallaxFactor: 0.15,
        },
        {
          id: 3,
          archetype: 'barred_spiral',
          x: 1850,
          y: 1950,
          radius: 245,
          angle: 2.2,
          rotationSpeed: 0.009,
          arms: 2,
          colorCore: 'rgba(253, 164, 175, 0.88)',
          colorArm: 'rgba(244, 63, 94, 0.32)',
          colorDust: 'rgba(254, 205, 211, 0.4)',
          tilt: 0.54,
          parallaxFactor: 0.12,
        },
        {
          id: 4,
          archetype: 'starburst',
          x: 600,
          y: 2050,
          radius: 185,
          angle: 0.8,
          rotationSpeed: -0.013,
          arms: 2,
          colorCore: 'rgba(255, 255, 255, 0.95)',
          colorArm: 'rgba(244, 63, 94, 0.38)',
          colorDust: 'rgba(251, 113, 133, 0.5)',
          tilt: 0.6,
          parallaxFactor: 0.16,
        },
        {
          id: 5,
          archetype: 'elliptical',
          x: 1350,
          y: 1300,
          radius: 170,
          angle: 1.3,
          rotationSpeed: 0.005,
          arms: 2,
          colorCore: 'rgba(254, 205, 211, 0.8)',
          colorArm: 'rgba(190, 18, 60, 0.22)',
          tilt: 0.48,
          parallaxFactor: 0.1,
        },
        {
          id: 6,
          archetype: 'grand_spiral',
          x: 2300,
          y: 1350,
          radius: 220,
          angle: 3.0,
          rotationSpeed: 0.01,
          arms: 4,
          colorCore: 'rgba(236, 72, 153, 0.85)',
          colorArm: 'rgba(225, 29, 72, 0.28)',
          tilt: 0.6,
          parallaxFactor: 0.13,
        },
      ];

    case 9: // Plasma Reactor Core (Solar Gold / Incandescent Amber)
      return [
        {
          id: 1,
          archetype: 'starburst',
          x: 750,
          y: 600,
          radius: 260,
          angle: 0.35,
          rotationSpeed: -0.012,
          arms: 2,
          colorCore: 'rgba(254, 240, 138, 0.98)',
          colorArm: 'rgba(234, 179, 8, 0.42)',
          colorDust: 'rgba(253, 224, 71, 0.55)',
          tilt: 0.6,
          parallaxFactor: 0.15,
        },
        {
          id: 2,
          archetype: 'barred_spiral',
          x: 2050,
          y: 700,
          radius: 250,
          angle: 1.7,
          rotationSpeed: 0.01,
          arms: 2,
          colorCore: 'rgba(250, 204, 21, 0.92)',
          colorArm: 'rgba(245, 158, 11, 0.38)',
          colorDust: 'rgba(253, 224, 71, 0.45)',
          tilt: 0.52,
          parallaxFactor: 0.13,
        },
        {
          id: 3,
          archetype: 'grand_spiral',
          x: 1850,
          y: 1950,
          radius: 280,
          angle: 2.2,
          rotationSpeed: 0.008,
          arms: 4,
          colorCore: 'rgba(253, 224, 71, 0.9)',
          colorArm: 'rgba(217, 119, 6, 0.34)',
          colorDust: 'rgba(250, 204, 21, 0.48)',
          tilt: 0.68,
          parallaxFactor: 0.14,
        },
        {
          id: 4,
          archetype: 'ring',
          x: 600,
          y: 2050,
          radius: 195,
          angle: 0.9,
          rotationSpeed: -0.008,
          arms: 2,
          colorCore: 'rgba(254, 240, 138, 0.92)',
          colorArm: 'rgba(245, 158, 11, 0.36)',
          colorDust: 'rgba(253, 224, 71, 0.5)',
          tilt: 0.64,
          parallaxFactor: 0.16,
        },
        {
          id: 5,
          archetype: 'elliptical',
          x: 1350,
          y: 1300,
          radius: 175,
          angle: 1.3,
          rotationSpeed: 0.006,
          arms: 2,
          colorCore: 'rgba(253, 224, 71, 0.85)',
          colorArm: 'rgba(245, 158, 11, 0.28)',
          tilt: 0.48,
          parallaxFactor: 0.1,
        },
        {
          id: 6,
          archetype: 'grand_spiral',
          x: 2350,
          y: 1350,
          radius: 220,
          angle: 3.1,
          rotationSpeed: 0.011,
          arms: 3,
          colorCore: 'rgba(250, 204, 21, 0.88)',
          colorArm: 'rgba(217, 119, 6, 0.3)',
          tilt: 0.58,
          parallaxFactor: 0.12,
        },
      ];

    case 10: // Omega Titan Primus (Dark Void Violet / Blood Crimson / Golden Singularity)
      return [
        {
          id: 1,
          archetype: 'starburst',
          x: 700,
          y: 600,
          radius: 280,
          angle: 0.3,
          rotationSpeed: -0.013,
          arms: 2,
          colorCore: 'rgba(255, 255, 255, 0.98)',
          colorArm: 'rgba(147, 51, 234, 0.45)',
          colorDust: 'rgba(250, 204, 21, 0.55)',
          tilt: 0.65,
          parallaxFactor: 0.16,
        },
        {
          id: 2,
          archetype: 'barred_spiral',
          x: 2100,
          y: 680,
          radius: 260,
          angle: 1.8,
          rotationSpeed: 0.01,
          arms: 2,
          colorCore: 'rgba(250, 204, 21, 0.95)',
          colorArm: 'rgba(239, 68, 68, 0.38)',
          colorDust: 'rgba(252, 165, 165, 0.45)',
          tilt: 0.52,
          parallaxFactor: 0.13,
        },
        {
          id: 3,
          archetype: 'grand_spiral',
          x: 1850,
          y: 1950,
          radius: 290,
          angle: 2.3,
          rotationSpeed: 0.009,
          arms: 4,
          colorCore: 'rgba(192, 132, 252, 0.92)',
          colorArm: 'rgba(126, 34, 206, 0.38)',
          colorDust: 'rgba(250, 204, 21, 0.45)',
          tilt: 0.7,
          parallaxFactor: 0.14,
        },
        {
          id: 4,
          archetype: 'ring',
          x: 600,
          y: 2050,
          radius: 200,
          angle: 0.85,
          rotationSpeed: -0.008,
          arms: 2,
          colorCore: 'rgba(254, 240, 138, 0.95)',
          colorArm: 'rgba(239, 68, 68, 0.36)',
          colorDust: 'rgba(250, 204, 21, 0.5)',
          tilt: 0.64,
          parallaxFactor: 0.15,
        },
        {
          id: 5,
          archetype: 'elliptical',
          x: 1350,
          y: 1300,
          radius: 180,
          angle: 1.4,
          rotationSpeed: 0.006,
          arms: 2,
          colorCore: 'rgba(250, 204, 21, 0.85)',
          colorArm: 'rgba(147, 51, 234, 0.3)',
          tilt: 0.5,
          parallaxFactor: 0.1,
        },
        {
          id: 6,
          archetype: 'grand_spiral',
          x: 2350,
          y: 1350,
          radius: 230,
          angle: 3.0,
          rotationSpeed: 0.012,
          arms: 3,
          colorCore: 'rgba(239, 68, 68, 0.9)',
          colorArm: 'rgba(147, 51, 234, 0.32)',
          tilt: 0.6,
          parallaxFactor: 0.12,
        },
      ];

    case 1: // Nova Station Outpost (Default: Deep Sapphire / Electric Cyan / Golden Core)
    default:
      return [
        {
          id: 1,
          archetype: 'barred_spiral',
          x: 700,
          y: 600,
          radius: 240,
          angle: 0.4,
          rotationSpeed: 0.01,
          arms: 2,
          colorCore: 'rgba(254, 240, 138, 0.9)',
          colorArm: 'rgba(6, 182, 212, 0.35)',
          colorDust: 'rgba(56, 189, 248, 0.45)',
          tilt: 0.55,
          parallaxFactor: 0.12,
        },
        {
          id: 2,
          archetype: 'grand_spiral',
          x: 2050,
          y: 680,
          radius: 260,
          angle: 1.8,
          rotationSpeed: -0.009,
          arms: 3,
          colorCore: 'rgba(56, 189, 248, 0.9)',
          colorArm: 'rgba(59, 130, 246, 0.32)',
          colorDust: 'rgba(14, 165, 233, 0.45)',
          tilt: 0.65,
          parallaxFactor: 0.15,
        },
        {
          id: 3,
          archetype: 'ring',
          x: 1850,
          y: 1950,
          radius: 190,
          angle: 2.2,
          rotationSpeed: 0.008,
          arms: 2,
          colorCore: 'rgba(250, 204, 21, 0.9)',
          colorArm: 'rgba(6, 182, 212, 0.3)',
          colorDust: 'rgba(56, 189, 248, 0.4)',
          tilt: 0.6,
          parallaxFactor: 0.14,
        },
        {
          id: 4,
          archetype: 'starburst',
          x: 600,
          y: 2050,
          radius: 180,
          angle: 0.8,
          rotationSpeed: -0.012,
          arms: 2,
          colorCore: 'rgba(255, 255, 255, 0.95)',
          colorArm: 'rgba(56, 189, 248, 0.38)',
          colorDust: 'rgba(254, 240, 138, 0.45)',
          tilt: 0.6,
          parallaxFactor: 0.16,
        },
        {
          id: 5,
          archetype: 'elliptical',
          x: 1350,
          y: 1250,
          radius: 165,
          angle: 1.4,
          rotationSpeed: 0.005,
          arms: 2,
          colorCore: 'rgba(186, 230, 253, 0.8)',
          colorArm: 'rgba(2, 132, 199, 0.25)',
          tilt: 0.48,
          parallaxFactor: 0.1,
        },
        {
          id: 6,
          archetype: 'grand_spiral',
          x: 2350,
          y: 1350,
          radius: 210,
          angle: 3.0,
          rotationSpeed: 0.011,
          arms: 4,
          colorCore: 'rgba(250, 204, 21, 0.85)',
          colorArm: 'rgba(56, 189, 248, 0.28)',
          tilt: 0.6,
          parallaxFactor: 0.13,
        },
      ];
  }
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

  const archetype = galaxy.archetype || 'grand_spiral';
  const tilt = galaxy.tilt || 0.6;
  const dustColor = galaxy.colorDust || galaxy.colorArm;

  if (archetype === 'barred_spiral') {
    // 1. Barred Spiral Galaxy
    // Elongated central stellar bar
    const barLen = galaxy.radius * 0.6;
    const barWidth = galaxy.radius * 0.16;
    const barGrad = ctx.createLinearGradient(-barLen / 2, 0, barLen / 2, 0);
    barGrad.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
    barGrad.addColorStop(0.3, galaxy.colorCore);
    barGrad.addColorStop(0.5, '#ffffff');
    barGrad.addColorStop(0.7, galaxy.colorCore);
    barGrad.addColorStop(1, 'rgba(255, 255, 255, 0.1)');

    ctx.save();
    ctx.scale(1, tilt);
    ctx.fillStyle = barGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, barLen * 0.5, barWidth * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Central Nucleus Core
    const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, galaxy.radius * 0.28);
    coreGrad.addColorStop(0, '#ffffff');
    coreGrad.addColorStop(0.4, galaxy.colorCore);
    coreGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(0, 0, galaxy.radius * 0.28, 0, Math.PI * 2);
    ctx.fill();

    // 2 Sweeping Logarithmic Spiral Arms from the bar tips
    ctx.fillStyle = galaxy.colorArm;
    for (let arm = 0; arm < 2; arm++) {
      const tipX = arm === 0 ? barLen * 0.45 : -barLen * 0.45;
      const baseAngle = arm === 0 ? 0 : Math.PI;

      for (let i = 10; i < galaxy.radius * 0.9; i += 4) {
        const theta = baseAngle + (i / galaxy.radius) * 3.4;
        const dist = (i / galaxy.radius) * (galaxy.radius * 0.85);
        const px = tipX + Math.cos(theta) * dist;
        const py = Math.sin(theta) * (dist * 0.8);
        const dotSize = Math.max(1.2, 3.0 * (1 - i / galaxy.radius));

        ctx.beginPath();
        ctx.arc(px, py, dotSize, 0, Math.PI * 2);
        ctx.fill();

        // Secondary star dust cluster
        if (i % 8 === 0) {
          ctx.fillStyle = dustColor;
          ctx.beginPath();
          ctx.arc(px + (Math.sin(i) * 6), py + (Math.cos(i) * 5), dotSize * 0.7, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = galaxy.colorArm;
        }
      }
    }
    ctx.restore();
  } else if (archetype === 'ring') {
    // 2. Ring Galaxy with Central Nucleus & Outer Resonant Starburst Ring
    ctx.save();
    ctx.scale(1, tilt);

    // Central core
    const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, galaxy.radius * 0.25);
    coreGrad.addColorStop(0, '#ffffff');
    coreGrad.addColorStop(0.5, galaxy.colorCore);
    coreGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(0, 0, galaxy.radius * 0.25, 0, Math.PI * 2);
    ctx.fill();

    // Radial dust spokes
    ctx.strokeStyle = galaxy.colorArm;
    ctx.lineWidth = 1.2;
    for (let s = 0; s < 4; s++) {
      const spAngle = (s / 4) * Math.PI * 2 + 0.3;
      ctx.beginPath();
      ctx.moveTo(Math.cos(spAngle) * (galaxy.radius * 0.2), Math.sin(spAngle) * (galaxy.radius * 0.2));
      ctx.lineTo(Math.cos(spAngle) * (galaxy.radius * 0.75), Math.sin(spAngle) * (galaxy.radius * 0.75));
      ctx.stroke();
    }

    // Outer Starburst Ring
    ctx.strokeStyle = galaxy.colorArm;
    ctx.lineWidth = galaxy.radius * 0.14;
    ctx.beginPath();
    ctx.arc(0, 0, galaxy.radius * 0.75, 0, Math.PI * 2);
    ctx.stroke();

    // Dense star cluster dots along the ring
    ctx.fillStyle = dustColor;
    const ringSteps = 48;
    for (let r = 0; r < ringSteps; r++) {
      const rAngle = (r / ringSteps) * Math.PI * 2;
      const jitter = (Math.sin(r * 3.7) * 0.08) * galaxy.radius;
      const rx = Math.cos(rAngle) * (galaxy.radius * 0.75 + jitter);
      const ry = Math.sin(rAngle) * (galaxy.radius * 0.75 + jitter);
      const dotSize = 1.2 + (r % 3 === 0 ? 1.8 : 0.8);

      ctx.beginPath();
      ctx.arc(rx, ry, dotSize, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  } else if (archetype === 'starburst') {
    // 3. Energetic Starburst Galaxy with Diffraction Spikes & Accretion Swirl
    ctx.save();

    // Swirling turbulent accretion disc
    ctx.scale(1, tilt);
    const discGrad = ctx.createRadialGradient(0, 0, galaxy.radius * 0.1, 0, 0, galaxy.radius * 0.7);
    discGrad.addColorStop(0, galaxy.colorCore);
    discGrad.addColorStop(0.4, galaxy.colorArm);
    discGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = discGrad;
    ctx.beginPath();
    ctx.arc(0, 0, galaxy.radius * 0.7, 0, Math.PI * 2);
    ctx.fill();

    // Dense turbulent plasma swirls
    ctx.fillStyle = dustColor;
    for (let i = 10; i < galaxy.radius * 0.75; i += 6) {
      const theta = (i / galaxy.radius) * 7.5;
      const px = Math.cos(theta) * i;
      const py = Math.sin(theta) * i;
      ctx.beginPath();
      ctx.arc(px, py, Math.max(1, 2.8 * (1 - i / (galaxy.radius * 0.75))), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Core radiant glow
    const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, galaxy.radius * 0.35);
    coreGrad.addColorStop(0, '#ffffff');
    coreGrad.addColorStop(0.35, galaxy.colorCore);
    coreGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(0, 0, galaxy.radius * 0.35, 0, Math.PI * 2);
    ctx.fill();

    // 4 Brilliant Starburst Diffraction Rays
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 1.5;
    const spikeLen = galaxy.radius * 0.85;
    for (let s = 0; s < 4; s++) {
      const sa = (s / 4) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(sa) * spikeLen, Math.sin(sa) * spikeLen);
      ctx.stroke();
    }
  } else if (archetype === 'elliptical') {
    // 4. Smooth Elliptical Galaxy Halo
    ctx.save();
    ctx.scale(1, tilt);

    // Multi-gradient elliptical envelope
    const ellGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, galaxy.radius * 0.8);
    ellGrad.addColorStop(0, '#ffffff');
    ellGrad.addColorStop(0.25, galaxy.colorCore);
    ellGrad.addColorStop(0.65, galaxy.colorArm);
    ellGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = ellGrad;
    ctx.beginPath();
    ctx.arc(0, 0, galaxy.radius * 0.8, 0, Math.PI * 2);
    ctx.fill();

    // Distributed star clusters
    ctx.fillStyle = dustColor;
    for (let c = 0; c < 36; c++) {
      const ca = c * 1.618 * Math.PI * 2;
      const cr = Math.sqrt(c / 36) * (galaxy.radius * 0.65);
      const cx = Math.cos(ca) * cr;
      const cy = Math.sin(ca) * cr;
      ctx.beginPath();
      ctx.arc(cx, cy, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  } else {
    // 5. Grand Design Multi-Arm Spiral Galaxy (default)
    ctx.save();
    ctx.scale(1, tilt);

    // Core Radiant Glow
    const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, galaxy.radius * 0.45);
    coreGrad.addColorStop(0, '#ffffff');
    coreGrad.addColorStop(0.3, galaxy.colorCore);
    coreGrad.addColorStop(0.7, galaxy.colorArm);
    coreGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(0, 0, galaxy.radius * 0.45, 0, Math.PI * 2);
    ctx.fill();

    // Spiral Arms with Logarithmic Curvature and Nebula Dust Trails
    const arms = galaxy.arms || 3;
    for (let arm = 0; arm < arms; arm++) {
      const armBaseAngle = (arm / arms) * Math.PI * 2;

      for (let i = 8; i < galaxy.radius; i += 4) {
        const theta = armBaseAngle + (i / galaxy.radius) * 4.2;
        const px = Math.cos(theta) * i;
        const py = Math.sin(theta) * i;
        const dotSize = Math.max(1.2, 3.2 * (1 - i / galaxy.radius));

        ctx.fillStyle = galaxy.colorArm;
        ctx.beginPath();
        ctx.arc(px, py, dotSize, 0, Math.PI * 2);
        ctx.fill();

        // Outer sparkling stellar dust
        if (i % 6 === 0) {
          ctx.fillStyle = dustColor;
          ctx.beginPath();
          ctx.arc(px + (Math.sin(i * 2.1) * 7), py + (Math.cos(i * 2.1) * 6), dotSize * 0.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    ctx.restore();
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
