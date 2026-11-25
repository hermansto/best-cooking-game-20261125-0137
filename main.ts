// Dapur Kilat hand-in (Node 22, standard library only).
//
// The entry is the static game in game/ plus the screenshots in
// screenshots/. This program copies both into the output directory the
// grader provides — /output there, or MAKEFUN_OUTPUT_DIR when run by hand
// — and writes dossier.json there with the kit's buildDossier helper, so
// the judge reads exactly the files that were handed in.
//
// Run it locally like this:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const root = fileURLToPath(new URL('.', import.meta.url));
const output = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(output, { recursive: true });
cpSync(join(root, 'game'), join(output, 'game'), { recursive: true });

const shotsOut = join(output, 'screenshots');
mkdirSync(shotsOut, { recursive: true });
if (existsSync(join(root, 'screenshots'))) {
  cpSync(join(root, 'screenshots'), shotsOut, { recursive: true });
}

// Caps from the competition bundle: 4 screenshots at most, 256 KiB each;
// game/ at most 993 files and 48 MiB, paths at most 1000 bytes; the
// dossier text at most 160 KiB, the file itself at most 1.5 MiB.
writeFileSync(
  join(output, 'dossier.json'),
  buildDossier(output, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
