import { test } from 'node:test';
import assert from 'node:assert';
import {
  soundEngine,
  MUSIC_FREQUENCIES,
  MUSIC_TRACKS,
  calculateDynamicBpm,
  MusicMood,
} from './audio';

test('MUSIC_FREQUENCIES contains standard tuned notes', () => {
  assert.ok(MUSIC_FREQUENCIES.D2 > 0);
  assert.strictEqual(MUSIC_FREQUENCIES.D2, 73.42);
  assert.strictEqual(MUSIC_FREQUENCIES.A2, 110.0);
  assert.strictEqual(MUSIC_FREQUENCIES.D4, 293.66);
  assert.strictEqual(MUSIC_FREQUENCIES.A4, 440.0);
  assert.ok(MUSIC_FREQUENCIES.D4 > MUSIC_FREQUENCIES.D2);
});

test('MUSIC_TRACKS contains 5 distinct music styles', () => {
  assert.strictEqual(MUSIC_TRACKS.length, 5, 'Should have exactly 5 distinct tracks');

  const names = new Set<string>();
  const bpms = new Set<number>();
  for (let i = 0; i < MUSIC_TRACKS.length; i++) {
    const track = MUSIC_TRACKS[i];
    assert.strictEqual(track.id, i);
    assert.ok(track.nameTr.length > 0);
    assert.ok(track.genreTr.length > 0);
    assert.ok(track.baseBpm >= 90 && track.baseBpm <= 160);
    assert.ok(!names.has(track.nameTr));
    names.add(track.nameTr);
    bpms.add(track.baseBpm);
  }
  // Verify varied tempos across tracks
  assert.ok(bpms.size >= 4, 'Tracks must have distinct base tempos');
});

test('calculateDynamicBpm accelerates tempo proportionally to combat intensity', () => {
  const baseBpm = 120;
  // Intensity 0 => base BPM
  assert.strictEqual(calculateDynamicBpm(baseBpm, 0), 120);

  // Intensity 0.5 => base + 18
  assert.strictEqual(calculateDynamicBpm(baseBpm, 0.5), 138);

  // Intensity 1.0 (max combat chaos) => base + 36
  assert.strictEqual(calculateDynamicBpm(baseBpm, 1.0), 156);

  // Negative and oversized intensity clamped cleanly
  assert.strictEqual(calculateDynamicBpm(baseBpm, -0.4), 120);
  assert.strictEqual(calculateDynamicBpm(baseBpm, 1.8), 156);
});

test('SoundEngine track selection and cycling', () => {
  // Start at track 0
  const t0 = soundEngine.selectTrack(0);
  assert.strictEqual(t0.id, 0);
  assert.strictEqual(soundEngine.getCurrentTrackId(), 0);

  // Cycle next
  const t1 = soundEngine.nextTrack();
  assert.strictEqual(t1.id, 1);
  assert.strictEqual(soundEngine.getCurrentTrackId(), 1);

  // Cycle through all to loop around
  soundEngine.nextTrack(); // 2
  soundEngine.nextTrack(); // 3
  soundEngine.nextTrack(); // 4
  const wrapped = soundEngine.nextTrack(); // back to 0
  assert.strictEqual(wrapped.id, 0);
  assert.strictEqual(soundEngine.getCurrentTrackId(), 0);
});

test('SoundEngine combat intensity updates effective BPM', () => {
  soundEngine.selectTrack(1); // Cyberpunk (base 124 BPM)
  soundEngine.setMusicMood('combat');

  soundEngine.setCombatIntensity(0.0);
  assert.strictEqual(soundEngine.getCombatIntensity(), 0.0);
  assert.strictEqual(soundEngine.getCurrentBpm(), 124);

  soundEngine.setCombatIntensity(0.5);
  assert.strictEqual(soundEngine.getCombatIntensity(), 0.5);
  assert.strictEqual(soundEngine.getCurrentBpm(), 124 + 18);

  soundEngine.setCombatIntensity(1.0);
  assert.strictEqual(soundEngine.getCombatIntensity(), 1.0);
  assert.strictEqual(soundEngine.getCurrentBpm(), 124 + 36);

  // Reset
  soundEngine.setCombatIntensity(0.0);
});

test('SoundEngine settings and mute toggling', () => {
  const initialSfxMuted = soundEngine.isMuted();
  const toggledSfx = soundEngine.toggleSfxMute();
  assert.strictEqual(toggledSfx, !initialSfxMuted);
  assert.strictEqual(soundEngine.isMuted(), !initialSfxMuted);

  // Restore
  soundEngine.setSfxMuted(initialSfxMuted);
  assert.strictEqual(soundEngine.isMuted(), initialSfxMuted);

  const initialMusicMuted = soundEngine.isMusicMuted();
  const toggledMusic = soundEngine.toggleMusicMute();
  assert.strictEqual(toggledMusic, !initialMusicMuted);
  assert.strictEqual(soundEngine.isMusicMuted(), !initialMusicMuted);

  // Restore
  soundEngine.setMusicMuted(initialMusicMuted);
  assert.strictEqual(soundEngine.isMusicMuted(), initialMusicMuted);
});

test('SoundEngine music mood switching', () => {
  const moods: MusicMood[] = ['title', 'combat', 'boss', 'paused', 'victory', 'gameover'];
  for (const m of moods) {
    soundEngine.setMusicMood(m);
    assert.strictEqual(soundEngine.getMusicMood(), m);
  }
});
