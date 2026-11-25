// Dapur Kilat controls: everything works by mouse (click a ticket, an
// ingredient, Serve) and by keyboard (1–8 ingredients, Q/W/E tickets,
// Tab cycles, Space serves, X clears, P pauses, R restarts, M mutes).
// The handlers only translate a press into a state call; the rules live
// in state.js, so a key and a click can never disagree about the outcome.

import { INGREDIENTS } from './config.js';
import {
  addIngredient,
  clearPlate,
  selectOrder,
  servePlate,
} from './state.js';
import { playSound } from './sound.js';

const TICKET_KEYS = { q: 0, w: 1, e: 2 };
const INGREDIENT_KEYS = Object.fromEntries(
  INGREDIENTS.map((item) => [item.key, item.id]),
);

function afterAction(game, result, render) {
  if (!result) return;
  if (result.ok && result.why === 'served') playSound(game, 'serve');
  else if (result.ok && result.ready) playSound(game, 'ready');
  else if (result.ok) playSound(game, 'add');
  else if (result.why === 'wrong') playSound(game, 'wrong');
  render(game);
}

export function bindInput(game, render, hooks) {
  // Clicking a ticket selects it (and clears the plate, so a half-built
  // dish never gets served to the wrong ticket by accident).
  document.getElementById('order-list').addEventListener('click', (event) => {
    const ticket = event.target.closest('.ticket');
    if (!ticket) return;
    const index = Number(ticket.dataset.index);
    if (selectOrder(game, index)) render(game);
  });

  document.getElementById('btn-serve').addEventListener('click', () => {
    afterAction(game, servePlate(game), render);
  });
  document.getElementById('btn-clear').addEventListener('click', () => {
    if (clearPlate(game)) render(game);
  });
  document.getElementById('btn-restart').addEventListener('click', () => hooks.restart());
  document.getElementById('btn-pause').addEventListener('click', () => hooks.pause());
  document.getElementById('btn-mute').addEventListener('click', () => {
    game.muted = !game.muted;
    render(game);
  });
  document.getElementById('btn-play').addEventListener('click', () => hooks.start());
  document.getElementById('btn-again').addEventListener('click', () => hooks.restart());

  document.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    const key = event.key.toLowerCase();
    if (key === ' ' || key === 'enter') {
      event.preventDefault();
      if (game.phase === 'title') { hooks.start(); return; }
      if (game.phase === 'over') { hooks.restart(); return; }
      afterAction(game, servePlate(game), render);
      return;
    }
    if (game.phase !== 'play') {
      if (key === 'r') hooks.restart();
      return;
    }
    if (key === 'tab') {
      event.preventDefault();
      const next = (game.selected + 1) % game.orders.length;
      if (selectOrder(game, next)) render(game);
      return;
    }
    if (key in TICKET_KEYS) {
      if (selectOrder(game, TICKET_KEYS[key])) render(game);
      return;
    }
    if (key === 'x') {
      if (clearPlate(game)) render(game);
      return;
    }
    if (key === 'p') { hooks.pause(); return; }
    if (key === 'm') {
      game.muted = !game.muted;
      render(game);
      return;
    }
    if (key === 'r') { hooks.restart(); return; }
    if (key in INGREDIENT_KEYS) {
      afterAction(game, addIngredient(game, INGREDIENT_KEYS[key]), render);
    }
  });
}
