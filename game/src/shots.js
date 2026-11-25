// Screenshot scenes for ?shot=…&seed=… . Each scene drives the real game
// state — the same objects the player cooks with — into one readable
// moment, then hands back which screen to show. Nothing is drawn by hand
// for the camera: the frame is what the kitchen actually looks like there.
//
//   start  — fresh shift, full board, empty plate, 3:00 on the clock
//   play   — Nasi Goreng mid-assembly, two of four ingredients on the plate
//   serve  — a finished plate, the Serve button lit, ticket fully checked
//   end    — shift report after a strong shift (score, stars, served count)

import { DISH_BY_ID, SHIFT_SECONDS, TARGET_SCORE } from './config.js';
import { createGame, PHASE_OVER, PHASE_PLAY } from './state.js';

function setOrder(game, index, dishId, left) {
  const order = game.orders[index];
  order.dishId = dishId;
  order.left = left;
  order.total = left < 50 ? 50 : left;
}

export function stageShot(name, seed) {
  const game = createGame(seed);
  game.phase = PHASE_PLAY;
  game.startedAt = Date.now();
  game.messageKind = 'good';

  if (name === 'play') {
    game.shiftLeft = 142;
    setOrder(game, 0, 'nasi-goreng', 34);
    setOrder(game, 1, 'mie-ayam', 41);
    setOrder(game, 2, 'gado-gado', 22);
    game.selected = 0;
    game.plate = ['rice', 'egg'];
    game.score = 130;
    game.served = 1;
    game.combo = 1;
    game.message = 'Egg on the plate. 2 of 4 for Nasi Goreng.';
    game.messageKind = 'info';
    return game;
  }

  if (name === 'serve') {
    game.shiftLeft = 118;
    setOrder(game, 0, 'sate-ayam', 28);
    setOrder(game, 1, 'nasi-goreng', 39);
    setOrder(game, 2, 'mie-ayam', 18);
    game.selected = 0;
    game.plate = ['skewer', 'chicken', 'peanut', 'chilli'];
    game.score = 340;
    game.served = 3;
    game.combo = 3;
    game.level = 1;
    game.message = 'Sate Ayam is ready — serve it!';
    game.messageKind = 'good';
    return game;
  }

  if (name === 'end') {
    game.phase = PHASE_OVER;
    game.shiftLeft = 0;
    game.score = 740;
    game.served = 6;
    game.failed = 1;
    game.mistakes = 1;
    game.bestCombo = 4;
    game.combo = 0;
    game.level = 2;
    setOrder(game, 0, 'mie-ayam', 30);
    setOrder(game, 1, 'gado-gado', 25);
    setOrder(game, 2, 'nasi-goreng', 40);
    game.message = 'Shift complete — target smashed!';
    game.messageKind = 'good';
    return game;
  }

  // Default: start. A calm opening frame with the whole kitchen visible.
  game.shiftLeft = SHIFT_SECONDS;
  setOrder(game, 0, 'nasi-goreng', 46);
  setOrder(game, 1, 'mie-ayam', 38);
  setOrder(game, 2, 'sate-ayam', 44);
  game.selected = 0;
  game.plate = [];
  game.score = 0;
  game.served = 0;
  game.combo = 0;
  game.message = 'Shift started! Cook the tickets before their timers run out.';
  game.messageKind = 'good';
  return game;
}

export function shotFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  if (!shot) return null;
  const seed = Number(params.get('seed') || '1');
  return stageShot(shot, Number.isFinite(seed) ? seed : 1);
}

// Kept for the dossier outline: the scenes this file can stage.
export const SHOT_NAMES = ['start', 'play', 'serve', 'end'];
export { DISH_BY_ID, TARGET_SCORE, PHASE_OVER, PHASE_PLAY };
