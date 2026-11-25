// Dapur Kilat: all the numbers and menus in one place, so tuning never
// means hunting through the game logic. Times are in seconds, points are
// plain score, and every dish is a set of four ingredients from the counter.

export const SHIFT_SECONDS = 180;
export const TARGET_SCORE = 600;
export const ORDER_TIME_BASE = 50;
export const ORDER_TIME_MIN = 30;
export const ORDER_TIME_STEP = 4;
export const SERVED_PER_LEVEL = 4;
export const MAX_ORDERS_EARLY = 3;
export const MAX_ORDERS_LATE = 4;
export const LATE_LEVEL = 3;

export const POINTS_SERVE = 100;
export const POINTS_TIME_BONUS = 2;
export const POINTS_COMBO = 10;
export const POINTS_MISTAKE = 50;
export const POINTS_EXPIRED = 75;
export const POINTS_DUPLICATE = 25;
export const TIP_SECONDS = 15;
export const TIP_POINTS = 25;

// The eight things on the counter. `key` is the keyboard shortcut, `glyph`
// is the picture drawn from the system font (no image file, no network).
export const INGREDIENTS = [
  { id: 'rice', key: '1', name: 'Rice', glyph: '🍚', tint: '#fff3d6' },
  { id: 'noodle', key: '2', name: 'Noodle', glyph: '🍜', tint: '#ffe9c2' },
  { id: 'egg', key: '3', name: 'Egg', glyph: '🥚', tint: '#fff8e1' },
  { id: 'chicken', key: '4', name: 'Chicken', glyph: '🍗', tint: '#ffe0b8' },
  { id: 'greens', key: '5', name: 'Greens', glyph: '🥬', tint: '#d9f2c2' },
  { id: 'chilli', key: '6', name: 'Chilli', glyph: '🌶️', tint: '#ffd2c2' },
  { id: 'peanut', key: '7', name: 'Peanut', glyph: '🥜', tint: '#f0dcb8' },
  { id: 'skewer', key: '8', name: 'Skewer', glyph: '🍢', tint: '#ffe6c7' },
];

export const INGREDIENT_BY_ID = Object.fromEntries(
  INGREDIENTS.map((item) => [item.id, item]),
);

// Four house dishes. Each one needs exactly four ingredients; the sets
// overlap on purpose, so a busy counter forces the player to plan which
// ticket to cook first instead of tapping at random.
export const DISHES = [
  {
    id: 'nasi-goreng',
    name: 'Nasi Goreng',
    glyph: '🍛',
    tint: '#ffb347',
    needs: ['rice', 'egg', 'chilli', 'chicken'],
    blurb: 'Wok-fried rice, egg and chilli.',
  },
  {
    id: 'mie-ayam',
    name: 'Mie Ayam',
    glyph: '🍜',
    tint: '#f7c948',
    needs: ['noodle', 'chicken', 'greens', 'egg'],
    blurb: 'Chicken noodles with greens.',
  },
  {
    id: 'sate-ayam',
    name: 'Sate Ayam',
    glyph: '🍢',
    tint: '#e07840',
    needs: ['skewer', 'chicken', 'peanut', 'chilli'],
    blurb: 'Grilled skewers, peanut sauce.',
  },
  {
    id: 'gado-gado',
    name: 'Gado-Gado',
    glyph: '🥗',
    tint: '#7bc96f',
    needs: ['greens', 'egg', 'peanut', 'chilli'],
    blurb: 'Garden salad, peanut dressing.',
  },
];

export const DISH_BY_ID = Object.fromEntries(
  DISHES.map((dish) => [dish.id, dish]),
);

// How long an order lives at a given level, and how many tickets fit on
// the board. Pressure grows by shrinking the clock, never by adding chores.
export function orderSecondsFor(level) {
  return Math.max(
    ORDER_TIME_MIN,
    ORDER_TIME_BASE - ORDER_TIME_STEP * (level - 1),
  );
}

export function maxOrdersFor(level) {
  return level >= LATE_LEVEL ? MAX_ORDERS_LATE : MAX_ORDERS_EARLY;
}

export function levelFor(served) {
  return 1 + Math.floor(served / SERVED_PER_LEVEL);
}

export function starsFor(score) {
  if (score >= TARGET_SCORE) return 3;
  if (score >= Math.floor(TARGET_SCORE * 0.6)) return 2;
  if (score >= Math.floor(TARGET_SCORE * 0.3)) return 1;
  return 0;
}
