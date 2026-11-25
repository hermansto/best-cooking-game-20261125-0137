[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/hermansto/best-cooking-game-20261125-0137/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/hermansto/best-cooking-game-20261125-0137/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

# Dapur Kilat — Rush Kitchen

A complete, original cooking game for the make.fun bounty
`best-cooking-game-20261125-0137`. It runs offline in a desktop browser
from static files, with keyboard and mouse controls.

## How to play

A 3-minute lunch rush in a Jakarta street kitchen. Tickets appear on the
order board, each with its own countdown. Pick ingredients from the counter,
build the dish on your plate, and serve before the ticket's clock runs out.

- **Nasi Goreng** — Rice, Egg, Chilli, Chicken
- **Mie Ayam** — Noodle, Chicken, Greens, Egg
- **Sate Ayam** — Skewer, Chicken, Peanut, Chilli
- **Gado-Gado** — Greens, Egg, Peanut, Chilli

Wrong ingredients cost points and break the combo. Fast serves earn tips;
serving several dishes in a row grows the combo. Every 4 served dishes the
level rises and the order clocks get shorter. Reach 600 points for 3 stars.

Controls: click tickets, ingredients and Serve — or keyboard: `1–8`
ingredients, `Q/W/E` tickets, `Tab` cycle, `Space` serve, `X` clear plate,
`P` pause, `R` restart, `M` mute.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

Screenshot scenes (the game's own states, staged deterministically):

- `?shot=start&seed=1` — kitchen overview, full board, 3:00 on the clock
- `?shot=play&seed=1` — Nasi Goreng mid-assembly, 2 of 4 on the plate
- `?shot=serve&seed=1` — finished Sate Ayam, ready to serve
- `?shot=end&seed=1` — shift report after a strong shift

## Hand in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `game/` and `screenshots/` to the output directory and
writes `dossier.json` with the kit's `buildDossier` helper. No network
requests at runtime; every glyph comes from the system font, every sound
is a WebAudio blip — there are no external assets.

## Files

- `game/index.html` — page shell: HUD, order board, plate, counter
- `game/styles.css` — the kitchen look
- `game/src/config.js` — dishes, ingredients, timings, scoring
- `game/src/random.js` — seeded random for deterministic shots
- `game/src/state.js` — shift state and every rule (orders, plate, serve)
- `game/src/render.js` — DOM drawing from the state
- `game/src/input.js` — keyboard and mouse controls
- `game/src/sound.js` — WebAudio blips, no audio files
- `game/src/shots.js` — deterministic screenshot scenes
- `game/src/main.js` — boot, clocks, test hook (`window.__dapur`)
- `main.ts` — hand-in program (Node 22)
- `serve.ts` — local static server for play-testing
- `vendor/makefun-game.ts` — kit library, unchanged
