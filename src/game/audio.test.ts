import { test } from 'node:test';
import assert from 'node:assert';
import { soundEngine, MUSIC_FREQUENCIES, MusicMood } from './audio';

test('MUSIC_FREQUENCIES contains standard tuned notes', () => {
  assert.ok(MUSIC_FREQUENCIES.D2 > 0);
  assert.strictEqual(MUSIC_FREQUENCIES.D2, 73.42);
  assert.strictEqual(MUSIC_FREQUENCIES.A2, 110.0);
  assert.strictEqual(MUSIC_FREQUENCIES.D4, 293.66);
  assert.strictEqual(MUSIC_FREQUENCIES.A4, 440.0);
  assert.ok(MUSIC_FREQUENCIES.D4 > MUSIC_FREQUENCIES.D2);
});

test('SoundEngine settings and mute toggling', () => {
  // Test SFX mute toggle
  const initialSfxMuted = soundEngine.isMuted();
  const toggledSfx = soundEngine.toggleSfxMute();
  assert.strictEqual(toggledSfx, !initialSfxMuted);
  assert.strictEqual(soundEngine.isMuted(), !initialSfxMuted);

  // Restore
  soundEngine.setSfxMuted(initialSfxMuted);
  assert.strictEqual(soundEngine.isMuted(), initialSfxMuted);

  // Test Music mute toggle
  const initialMusicMuted = soundEngine.isMusicMuted();
  const toggledMusic = soundEngine.toggleMusicMute();
  assert.strictEqual(toggledMusic, !initialMusicMuted);
  assert.strictEqual(soundEngine.isMusicMuted(), !initialMusicMuted);

  // Restore
  soundEngine.setMusicMuted(initialMusicMuted);
  assert.strictEqual(soundEngine.isMusicMuted(), initialMusicMuted);
});

test('SoundEngine volume clamping', () => {
  soundEngine.setSfxVolume(0.8);
  assert.strictEqual(soundEngine.getSettings().sfxVolume, 0.8);

  soundEngine.setSfxVolume(-0.5);
  assert.strictEqual(soundEngine.getSettings().sfxVolume, 0.0);

  soundEngine.setSfxVolume(1.5);
  assert.strictEqual(soundEngine.getSettings().sfxVolume, 1.0);

  soundEngine.setMusicVolume(0.5);
  assert.strictEqual(soundEngine.getSettings().musicVolume, 0.5);

  soundEngine.setMusicVolume(-1);
  assert.strictEqual(soundEngine.getSettings().musicVolume, 0.0);

  soundEngine.setMusicVolume(2);
  assert.strictEqual(soundEngine.getSettings().musicVolume, 1.0);

  // Reset to default
  soundEngine.setSfxVolume(0.35);
  soundEngine.setMusicVolume(0.28);
});

test('SoundEngine music mood switching', () => {
  const moods: MusicMood[] = ['title', 'combat', 'boss', 'paused', 'victory', 'gameover'];
  for (const m of moods) {
    soundEngine.setMusicMood(m);
    assert.strictEqual(soundEngine.getMusicMood(), m);
  }
});
