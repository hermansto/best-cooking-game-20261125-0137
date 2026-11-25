// Kitchen sounds without a single audio file: short oscillator blips
// through WebAudio, created lazily on the first user gesture so the
// browser's autoplay rules never block the game. Mute silences them all.

let audio = null;

function context() {
  if (audio) return audio;
  const Factory = window.AudioContext || window.webkitAudioContext;
  if (!Factory) return null;
  audio = new Factory();
  return audio;
}

function blip(freq, length, kind, loud) {
  const ctx = context();
  if (!ctx || ctx.state === 'suspended') {
    if (ctx) ctx.resume().catch(() => {});
    return;
  }
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = kind;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(loud, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + length);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + length);
}

export const SOUNDS = {
  add: () => blip(520, 0.09, 'sine', 0.12),
  ready: () => { blip(660, 0.1, 'sine', 0.12); setTimeout(() => blip(880, 0.14, 'sine', 0.12), 90); },
  serve: () => { blip(523, 0.1, 'triangle', 0.14); setTimeout(() => blip(784, 0.18, 'triangle', 0.14), 100); },
  wrong: () => blip(160, 0.22, 'sawtooth', 0.08),
  expired: () => { blip(220, 0.18, 'square', 0.06); setTimeout(() => blip(165, 0.25, 'square', 0.06), 140); },
  over: () => { [523, 659, 784].forEach((f, i) => setTimeout(() => blip(f, 0.2, 'triangle', 0.12), i * 130)); },
};

export function playSound(game, name) {
  if (game.muted) return;
  const fn = SOUNDS[name];
  if (fn) fn();
}
