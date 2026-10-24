import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getTodayDateKey,
  getDefaultDailyMissions,
  updateMissionProgress,
  calculateActiveMissionBuffs,
  claimMissionReward,
} from './missions';

test('getTodayDateKey formats correctly', () => {
  const d = new Date(2026, 9, 23); // Oct 23 2026
  assert.equal(getTodayDateKey(d), '2026-10-23');
});

test('getDefaultDailyMissions provides required missions', () => {
  const missions = getDefaultDailyMissions('2026-10-23');
  assert.equal(missions.length, 6);

  const killMission = missions.find((m) => m.type === 'kill_count');
  assert.ok(killMission);
  assert.equal(killMission.target, 50);
  assert.equal(killMission.reward.type, 'score_multiplier');

  const surviveMission = missions.find((m) => m.type === 'survival_time');
  assert.ok(surviveMission);
  assert.equal(surviveMission.target, 300); // 5 minutes
  assert.equal(surviveMission.reward.type, 'shield_boost');

  const planetMission = missions.find((m) => m.type === 'explore_planet');
  assert.ok(planetMission);
  assert.equal(planetMission.target, 3);
});

test('updateMissionProgress updates kill count and detects completion', () => {
  let missions = getDefaultDailyMissions('2026-10-23');

  // Kill 20 enemies
  let res = updateMissionProgress(missions, { type: 'enemy_killed', count: 20 });
  missions = res.updatedMissions;
  assert.equal(res.newlyCompleted.length, 0);
  assert.equal(missions[0].current, 20);
  assert.equal(missions[0].completed, false);

  // Kill 30 more enemies (reach 50)
  res = updateMissionProgress(missions, { type: 'enemy_killed', count: 30 });
  missions = res.updatedMissions;
  assert.equal(res.newlyCompleted.length, 1);
  assert.equal(res.newlyCompleted[0].type, 'kill_count');
  assert.equal(missions[0].current, 50);
  assert.equal(missions[0].completed, true);
});

test('updateMissionProgress updates survival time', () => {
  let missions = getDefaultDailyMissions('2026-10-23');

  // Survive 150 seconds
  let res = updateMissionProgress(missions, { type: 'time_survived', seconds: 150 });
  missions = res.updatedMissions;
  assert.equal(missions[1].current, 150);
  assert.equal(missions[1].completed, false);

  // Survive 300 seconds (5 min)
  res = updateMissionProgress(missions, { type: 'time_survived', seconds: 300 });
  missions = res.updatedMissions;
  assert.equal(missions[1].current, 300);
  assert.equal(missions[1].completed, true);
  assert.equal(res.newlyCompleted.length, 1);
});

test('calculateActiveMissionBuffs calculates cumulative multipliers and bonuses', () => {
  let missions = getDefaultDailyMissions('2026-10-23');

  // Initially 0 buffs
  let buffs = calculateActiveMissionBuffs(missions);
  assert.equal(buffs.scoreMultiplier, 1.0);
  assert.equal(buffs.bonusMaxShield, 0);

  // Complete kill mission (+35% score multiplier)
  missions[0].completed = true;
  buffs = calculateActiveMissionBuffs(missions);
  assert.ok(Math.abs(buffs.scoreMultiplier - 1.35) < 0.001);

  // Complete survive mission (+35 shield)
  missions[1].completed = true;
  buffs = calculateActiveMissionBuffs(missions);
  assert.equal(buffs.bonusMaxShield, 35);
});

test('claimMissionReward flags mission as claimed', () => {
  let missions = getDefaultDailyMissions('2026-10-23');
  missions[0].completed = true;
  missions = claimMissionReward(missions, missions[0].id);
  assert.equal(missions[0].claimed, true);
});

test('updateMissionProgress handles planet_scanned events and completes exploration', () => {
  let missions = getDefaultDailyMissions('2026-10-23');
  const planetMissionIdx = missions.findIndex((m) => m.type === 'explore_planet');
  assert.ok(planetMissionIdx !== -1);

  // Scan 3 planets
  let res = updateMissionProgress(missions, { type: 'planet_scanned', planetId: 'p1' });
  res = updateMissionProgress(res.updatedMissions, { type: 'planet_scanned', planetId: 'p2' });
  res = updateMissionProgress(res.updatedMissions, { type: 'planet_scanned', planetId: 'p3' });

  assert.equal(res.updatedMissions[planetMissionIdx].current, 3);
  assert.equal(res.updatedMissions[planetMissionIdx].completed, true);
  assert.equal(res.newlyCompleted.length, 1);
});
