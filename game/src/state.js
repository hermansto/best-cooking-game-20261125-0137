// Dapur Kilat state: one plain object holds the whole shift, and every
// rule below is a small function that takes that object and returns what
// happened. Nothing here touches the page; render.js does all the drawing.

import {
  DISHES,
  DISH_BY_ID,
  INGREDIENT_BY_ID,
  SHIFT_SECONDS,
  TARGET_SCORE,
  POINTS_SERVE,
  POINTS_TIME_BONUS,
  POINTS_COMBO,
  POINTS_MISTAKE,
  POINTS_EXPIRED,
  POINTS_DUPLICATE,
  TIP_SECONDS,
  TIP_POINTS,
  levelFor,
  maxOrdersFor,
  orderSecondsFor,
} from './config.js';
import { makeRandom, pickDishId } from './random.js';

export const PHASE_TITLE = 'title';
export const PHASE_PLAY = 'play';
export const PHASE_OVER = 'over';

let ticketCounter = 0;

export function createGame(seed) {
  ticketCounter = 0;
  const random = makeRandom(seed ?? Math.floor(Math.random() * 100000));
  const game = {
    seed,
    random,
    phase: PHASE_TITLE,
    shiftLeft: SHIFT_SECONDS,
    score: 0,
    served: 0,
    failed: 0,
    mistakes: 0,
    combo: 0,
    bestCombo: 0,
    level: 1,
    orders: [],
    selected: 0,
    plate: [],
    message: '',
    messageKind: '',
    lastGain: 0,
    startedAt: null,
    muted: false,
  };
  fillBoard(game);
  return game;
}

// A ticket on the order board: which dish, how long it has left, and a
// number so the player can say "ticket 2" without ambiguity.
export function makeOrder(game, avoidId) {
  ticketCounter += 1;
  return {
    ticket: ticketCounter,
    dishId: pickDishId(game.random, DISHES, avoidId),
    left: orderSecondsFor(game.level),
    total: orderSecondsFor(game.level),
  };
}

export function fillBoard(game) {
  while (game.orders.length < maxOrdersFor(game.level)) {
    const last = game.orders.length > 0
      ? game.orders[game.orders.length - 1].dishId
      : null;
    game.orders.push(makeOrder(game, last));
  }
  if (game.selected >= game.orders.length) game.selected = 0;
}

export function selectedOrder(game) {
  return game.orders[game.selected] ?? null;
}

export function selectedDish(game) {
  const order = selectedOrder(game);
  return order ? DISH_BY_ID[order.dishId] : null;
}

// How many of the selected dish's ingredients are already on the plate.
export function plateProgress(game) {
  const dish = selectedDish(game);
  if (!dish) return { done: 0, total: 0 };
  const done = dish.needs.filter((id) => game.plate.includes(id)).length;
  return { done, total: dish.needs.length };
}

export function plateReady(game) {
  const dish = selectedDish(game);
  if (!dish) return false;
  if (game.plate.length !== dish.needs.length) return false;
  return dish.needs.every((id) => game.plate.includes(id));
}

export function startShift(game) {
  game.phase = PHASE_PLAY;
  game.startedAt = Date.now();
  game.message = 'Shift started! Cook the tickets before their timers run out.';
  game.messageKind = 'good';
}

// One ingredient from the counter onto the plate. A repeat, or something
// the selected dish never needs, is a mistake: it costs points and the
// combo, but the plate stays so the player can clear it and recover.
export function addIngredient(game, ingredientId) {
  if (game.phase !== PHASE_PLAY) return { ok: false, why: 'not-playing' };
  const dish = selectedDish(game);
  const item = INGREDIENT_BY_ID[ingredientId];
  if (!dish || !item) return { ok: false, why: 'no-dish' };
  if (game.plate.includes(ingredientId)) {
    return spoil(game, `Already on the plate: ${item.name}.`, POINTS_DUPLICATE);
  }
  if (!dish.needs.includes(ingredientId)) {
    return spoil(game, `${item.name} is not in ${dish.name}.`, POINTS_MISTAKE);
  }
  game.plate.push(ingredientId);
  game.message = `${item.name} on the plate.`;
  game.messageKind = 'info';
  if (plateReady(game)) {
    game.message = `${dish.name} is ready — serve it!`;
    game.messageKind = 'good';
  }
  return { ok: true, why: 'added', ready: plateReady(game) };
}

function spoil(game, text, cost) {
  game.score = Math.max(0, game.score - cost);
  game.mistakes += 1;
  game.combo = 0;
  game.lastGain = -cost;
  game.message = `${text} −${cost} pts.`;
  game.messageKind = 'bad';
  return { ok: false, why: 'wrong', cost };
}

export function clearPlate(game) {
  if (game.plate.length === 0) return false;
  game.plate = [];
  game.message = 'Plate cleared.';
  game.messageKind = 'info';
  return true;
}

// Serve the plate to the selected ticket. A full match pays the dish, a
// time bonus and the combo; anything else is a mistake and the plate stays
// for the player to fix.
export function servePlate(game) {
  if (game.phase !== PHASE_PLAY) return { ok: false, why: 'not-playing' };
  const order = selectedOrder(game);
  if (!order) return { ok: false, why: 'no-order' };
  const dish = DISH_BY_ID[order.dishId];
  if (!plateReady(game)) {
    const progress = plateProgress(game);
    return spoil(
      game,
      `Not ready: ${progress.done} of ${progress.total} for ${dish.name}.`,
      POINTS_MISTAKE,
    );
  }
  const timeBonus = Math.round(order.left * POINTS_TIME_BONUS);
  const comboBonus = game.combo * POINTS_COMBO;
  const tip = order.left >= TIP_SECONDS ? TIP_POINTS : 0;
  const gain = POINTS_SERVE + timeBonus + comboBonus + tip;
  game.score += gain;
  game.lastGain = gain;
  game.served += 1;
  game.combo += 1;
  game.bestCombo = Math.max(game.bestCombo, game.combo);
  game.level = levelFor(game.served);
  game.plate = [];
  game.orders.splice(game.selected, 1);
  if (game.selected >= game.orders.length) game.selected = 0;
  fillBoard(game);
  game.message = `Served ${dish.name}! +${gain} pts`
    + (tip > 0 ? ` (quick tip +${tip})` : '')
    + (game.combo > 1 ? ` — combo ×${game.combo}` : '');
  game.messageKind = 'good';
  return { ok: true, why: 'served', gain, dish: dish.name };
}

export function selectOrder(game, index) {
  if (index < 0 || index >= game.orders.length) return false;
  game.selected = index;
  game.plate = [];
  const dish = DISH_BY_ID[game.orders[index].dishId];
  game.message = `Cooking ${dish.name} — ${dish.blurb}`;
  game.messageKind = 'info';
  return true;
}

// Advance every clock by `seconds`. Expired tickets fail, the shift clock
// runs out, and the board refills. Returns the events, so the caller can
// play the right sound for each one.
export function tick(game, seconds) {
  if (game.phase !== PHASE_PLAY) return [];
  const events = [];
  game.shiftLeft = Math.max(0, game.shiftLeft - seconds);
  for (let index = game.orders.length - 1; index >= 0; index -= 1) {
    const order = game.orders[index];
    order.left -= seconds;
    if (order.left <= 0) {
      const dish = DISH_BY_ID[order.dishId];
      game.orders.splice(index, 1);
      game.failed += 1;
      game.combo = 0;
      game.score = Math.max(0, game.score - POINTS_EXPIRED);
      game.lastGain = -POINTS_EXPIRED;
      game.message = `Too slow — ${dish.name} walked out. −${POINTS_EXPIRED} pts.`;
      game.messageKind = 'bad';
      events.push('expired');
    }
  }
  if (game.selected >= game.orders.length) game.selected = 0;
  fillBoard(game);
  if (game.shiftLeft <= 0) {
    game.phase = PHASE_OVER;
    game.message = game.score >= TARGET_SCORE
      ? 'Shift complete — target smashed!'
      : 'Shift over — so close, cook again!';
    game.messageKind = game.score >= TARGET_SCORE ? 'good' : 'info';
    events.push('over');
  }
  return events;
}

export function restartShift(game) {
  const fresh = createGame(game.seed);
  fresh.phase = PHASE_PLAY;
  fresh.startedAt = Date.now();
  fresh.message = 'Fresh shift — same kitchen, new tickets.';
  fresh.messageKind = 'good';
  return fresh;
}
