import { test } from 'node:test';
import assert from 'node:assert';
import { createDefaultGalaxies, createSectorGalaxies } from './celestial';

test('createSectorGalaxies returns enhanced galaxy sets with diverse archetypes', () => {
  for (let sectorId = 1; sectorId <= 10; sectorId++) {
    const galaxies = createSectorGalaxies(sectorId);
    assert.ok(galaxies.length >= 6, `Sector ${sectorId} should have at least 6 distant galaxies`);

    // Verify all have valid positions, radiuses and colors
    for (const g of galaxies) {
      assert.ok(g.radius >= 140, 'Galaxy radius should be substantial');
      assert.ok(g.colorCore.length > 0);
      assert.ok(g.colorArm.length > 0);
      assert.ok(g.archetype, 'Galaxy must have a defined archetype');
    }

    // Verify presence of different archetypes across galaxies
    const archetypes = new Set(galaxies.map((g) => g.archetype));
    assert.ok(archetypes.size >= 3, `Sector ${sectorId} galaxies should have at least 3 distinct archetypes`);
  }

  // createDefaultGalaxies fallback
  const defaults = createDefaultGalaxies();
  assert.ok(defaults.length >= 6);
});
