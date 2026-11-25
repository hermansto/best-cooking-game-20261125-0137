// A tiny seeded random source, so a screenshot URL with ?seed= always
// stages the same kitchen, and a plain visit still feels different every
// time. Mulberry32 is small, fast and good enough for picking dishes.

export function makeRandom(seed) {
  let value = (seed >>> 0) || 1;
  return function next() {
    value = (value + 0x6d2b79f5) >>> 0;
    let mixed = value;
    mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

// Pick one entry from a list with the given random source.
export function pickFrom(random, list) {
  return list[Math.floor(random() * list.length)];
}

// A fresh dish id that is not the one just served, so the board keeps
// changing instead of repeating the same ticket twice in a row.
export function pickDishId(random, dishes, avoidId) {
  const pool = dishes.filter((dish) => dish.id !== avoidId);
  const list = pool.length > 0 ? pool : dishes;
  return pickFrom(random, list).id;
}
