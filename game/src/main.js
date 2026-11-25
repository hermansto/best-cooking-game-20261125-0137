// Dapur Kilat boot: build the kitchen, wire the controls, and run the
// clocks. Two clocks drive the game — a 100 ms tick for the order and
// shift timers, and the render that follows it — so the timers you see are
// the timers the rules use. A ?shot= URL stages a screenshot scene
// instead of starting a fresh shift, and freezes its clocks.

import {
  addIngredient,
  createGame,
  startShift,
  restartShift,
  tick,
} from './state.js';
import { buildCounter, renderAll } from './render.js';
import { bindInput } from './input.js';
import { playSound } from './sound.js';
import { shotFromUrl } from './shots.js';

let game = createGame(20261125);
let paused = false;
let lastTick = Date.now();

const staged = shotFromUrl();
if (staged) {
  game = staged;
  paused = true;
}

function render() {
  renderAll(game);
}

const hooks = {
  start() {
    if (game.phase === 'title') {
      startShift(game);
      playSound(game, 'ready');
    }
    paused = false;
    lastTick = Date.now();
    render();
  },
  restart() {
    // Copy the fresh shift onto the same object, so the input handlers
    // bound earlier keep pointing at the live game instead of a stale one.
    Object.assign(game, restartShift(game));
    paused = false;
    lastTick = Date.now();
    render();
  },
  pause() {
    if (game.phase !== 'play') return;
    paused = !paused;
    game.message = paused
      ? 'Paused — press P or the button to keep cooking.'
      : 'Back to the rush!';
    game.messageKind = 'info';
    render();
  },
};

// The counter buttons call the real rule directly. The handler reads the
// current `game` binding, so it keeps working after a restart swaps the
// whole game object for a fresh one.
buildCounter((ingredientId) => {
  if (game.phase !== 'play' || paused) return;
  const result = addIngredient(game, ingredientId);
  if (result.ok && result.ready) playSound(game, 'ready');
  else if (result.ok) playSound(game, 'add');
  else if (result.why === 'wrong') playSound(game, 'wrong');
  render();
});

bindInput(game, render, hooks);

// The clock: every 100 ms, move the shift and the tickets forward by the
// real time that passed, refill the board, and redraw. A staged shot is
// paused on purpose, so its screenshot never catches a timer mid-blink.
setInterval(() => {
  if (game.phase !== 'play' || paused) return;
  const now = Date.now();
  const elapsed = (now - lastTick) / 1000;
  lastTick = now;
  const events = tick(game, elapsed);
  if (events.includes('expired')) playSound(game, 'expired');
  if (events.includes('over')) playSound(game, 'over');
  render();
}, 100);

// Expose the live state for play-testing and for the screenshot scenes:
// window.__dapur is how an automated check serves a plate and reads back
// the score without pretending to be a player.
window.__dapur = {
  get game() { return game; },
  load(next) { Object.assign(game, next); lastTick = Date.now(); render(); },
  pause(value) { paused = value; },
  render,
};

render();
