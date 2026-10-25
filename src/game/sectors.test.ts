import { test } from 'node:test';
import assert from 'node:assert';
import {
  CAMPAIGN_SECTORS,
  calculateSectorStars,
  getDefaultSectorProgress,
  recordSectorVictory,
  getSectorById,
} from './sectors';

test('CAMPAIGN_SECTORS contains at least 10 unique progressive sectors', () => {
  assert.ok(CAMPAIGN_SECTORS.length >= 10, 'Must have at least 10 sectors');
  assert.strictEqual(CAMPAIGN_SECTORS.length, 10);

  const ids = new Set<number>();
  for (let i = 0; i < CAMPAIGN_SECTORS.length; i++) {
    const s = CAMPAIGN_SECTORS[i];
    assert.strictEqual(s.id, i + 1, `Sector at index ${i} should have id ${i + 1}`);
    assert.ok(!ids.has(s.id), `Duplicate sector id: ${s.id}`);
    ids.add(s.id);

    // Verify metadata presence
    assert.ok(s.nameTr.length > 0);
    assert.ok(s.code.startsWith('SEKTÖR-'));
    assert.ok(s.targetWaves >= 3);
    assert.ok(s.recommendedTrackId >= 0 && s.recommendedTrackId <= 4);
    assert.ok(s.enemyHpMultiplier > 0);
    assert.ok(s.enemySpeedMultiplier > 0);
  }
});

test('calculateSectorStars assigns 1, 2, or 3 stars accurately', () => {
  const thresholds: [number, number, number] = [1500, 3500, 6000];

  // Base clear with low score and low HP => 1 star
  assert.strictEqual(calculateSectorStars(1000, 0.2, thresholds), 1);

  // Moderate score or 50% HP => 2 stars
  assert.strictEqual(calculateSectorStars(4000, 0.3, thresholds), 2);
  assert.strictEqual(calculateSectorStars(1200, 0.6, thresholds), 2);

  // High score AND > 70% HP => 3 stars
  assert.strictEqual(calculateSectorStars(7000, 0.85, thresholds), 3);

  // High score but low HP (<70%) => max 2 stars
  assert.strictEqual(calculateSectorStars(7000, 0.4, thresholds), 2);
});

test('Sector progression unlocks the next sector upon victory', () => {
  const defaultList = getDefaultSectorProgress();
  assert.strictEqual(defaultList[0].unlocked, true);
  assert.strictEqual(defaultList[1].unlocked, false);

  const { updatedList, starsEarned, nextSectorUnlocked } = recordSectorVictory(
    1,
    5000,
    75,
    0.6,
    defaultList
  );

  assert.strictEqual(starsEarned, 2);
  assert.strictEqual(nextSectorUnlocked, 2);
  assert.strictEqual(updatedList[0].completed, true);
  assert.strictEqual(updatedList[0].stars, 2);
  assert.strictEqual(updatedList[1].unlocked, true);
});

test('getSectorById returns expected sector or fallback', () => {
  const s3 = getSectorById(3);
  assert.strictEqual(s3.id, 3);
  assert.strictEqual(s3.nameTr, 'Mor İyon Yarığı');

  const fallback = getSectorById(999);
  assert.strictEqual(fallback.id, 1);
});

test('All sectors have distinct deep space backgrounds, nebulae, and end-of-sector golden bosses', () => {
  const gradients = new Set<string>();

  for (const s of CAMPAIGN_SECTORS) {
    // 1. Distinct deep space background gradient
    assert.ok(Array.isArray(s.bgGradient) && s.bgGradient.length === 2, `Sector ${s.id} must have 2-color bgGradient`);
    const gradKey = `${s.bgGradient[0]}_${s.bgGradient[1]}`;
    assert.ok(!gradients.has(gradKey), `Sector ${s.id} should have a unique deep space gradient`);
    gradients.add(gradKey);

    // 2. Cosmic nebulae clouds defined
    assert.ok(Array.isArray(s.nebulae) && s.nebulae.length >= 3, `Sector ${s.id} must have at least 3 nebulae`);
    for (const n of s.nebulae) {
      assert.ok(n.r >= 200, `Nebula radius must be substantial: ${n.r}`);
      assert.ok(n.color.startsWith('rgba('));
    }

    // 3. Starlight tint
    assert.ok(s.starTint && s.starTint.startsWith('#'));

    // 4. End-of-sector Boss definition
    assert.ok(s.bossArchetype, `Sector ${s.id} must culminate in a boss fight`);
    assert.ok(s.bossNameTr && s.bossNameTr.length > 0, `Sector ${s.id} must have a Turkish boss name`);
  }
});

