// Builds the games that open in a frame inside the library, from games/ (for now, Quake in Order).
//
//   node scripts/build-games.mjs [--standalone]
//
// Each game in games/<id>/ has a template.html with five slots (fonts, styles, three.js, the game's code and
// Bayani), its style.css and its app.js. Bayani comes from src/assets/mascot.svg.
//
// Writes:
//   public/games/<id>.html          the copy the library opens in a frame. It runs offline: three.js comes from
//                                   ../engine/, and the fonts sit beside it in public/games/fonts/.
//   games/standalone/<name>.html    with --standalone: one file with everything inside, to share or review on its
//                                   own with no internet
//
// The generated files are not committed; npm run dev and npm run build make the library's copy.

import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'public', 'games');
const standaloneOut = join(root, 'games', 'standalone');
const standalone = process.argv.includes('--standalone');

const GAMES = [{ id: 'quake-in-order', name: 'Quake-in-Order.html' }];

const FONTS = [
  ['Baloo 2', 'baloo-2', 700], ['Baloo 2', 'baloo-2', 800],
  ['Nunito', 'nunito', 700], ['Nunito', 'nunito', 800], ['Nunito', 'nunito', 900],
];
const fontFile = (pkg, w) => pkg + '-latin-' + w + '-normal.woff2';
const fontPath = (pkg, w) => join(root, 'node_modules', '@fontsource', pkg, 'files', fontFile(pkg, w));
const face = (fam, w, url) => "@font-face{font-family:'" + fam + "';font-style:normal;font-weight:" + w + ';font-display:swap;src:url(' + url + ") format('woff2')}";
const fonts = (url) => '<style>\n/* Baloo 2 and Nunito, SIL Open Font License 1.1 */\n' + FONTS.map(([fam, pkg, w]) => face(fam, w, url(pkg, w))).join('\n') + '\n</style>';
const b64 = (p) => readFileSync(p).toString('base64');
// keeps code that is put inside <script> from closing the tag early
const inScript = (js) => js.replace(/<\/script/gi, '<\\/script');

const SLOTS = ['<!--@FONTS-->', '/*@CSS*/', '<!--@THREE-->', '/*@APP*/', '<!--@MASCOT-->'];
function fill(template, parts, where) {
  let html = template;
  for (const slot of SLOTS) {
    if (html.split(slot).length !== 2) throw new Error(where + ' needs exactly one ' + slot);
    html = html.replace(slot, () => parts[slot]);
  }
  return html;
}

const mascot = readFileSync(join(root, 'src', 'assets', 'mascot.svg'), 'utf8').trim();
mkdirSync(join(out, 'fonts'), { recursive: true });
for (const [, pkg, w] of FONTS) copyFileSync(fontPath(pkg, w), join(out, 'fonts', fontFile(pkg, w)));
if (standalone) mkdirSync(standaloneOut, { recursive: true });

const built = [];
for (const g of GAMES) {
  const dir = join(root, 'games', g.id);
  const template = readFileSync(join(dir, 'template.html'), 'utf8');
  const common = {
    '/*@CSS*/': readFileSync(join(dir, 'style.css'), 'utf8'),
    '/*@APP*/': inScript(readFileSync(join(dir, 'app.js'), 'utf8')),
    '<!--@MASCOT-->': mascot,
  };
  // 1. the library's copy
  writeFileSync(join(out, g.id + '.html'), fill(template, {
    ...common,
    '<!--@FONTS-->': fonts((pkg, w) => 'fonts/' + fontFile(pkg, w)),
    '<!--@THREE-->': '<script src="../engine/three.min.js"></script>',
  }, 'games/' + g.id + '/template.html'));
  built.push('public/games/' + g.id + '.html');
  // 2. one file with everything inside
  if (standalone) {
    const three = readFileSync(join(root, 'public', 'engine', 'three.min.js'), 'utf8'); // three.js r128 (MIT License)
    writeFileSync(join(standaloneOut, g.name), fill(template, {
      ...common,
      '<!--@FONTS-->': fonts((pkg, w) => 'data:font/woff2;base64,' + b64(fontPath(pkg, w))),
      '<!--@THREE-->': '<script>\n' + inScript(three) + '\n</script>',
    }, 'games/' + g.id + '/template.html'));
    built.push('games/standalone/' + g.name);
  }
}
console.log('Games built: ' + built.join(', '));
