// Builds the games that open in a frame inside the library, from games/: the order games (Quake in Order and the two
// first aid games), and the test games that are whole pages of their own, Weather Studio and Handa vs. Hazard
// (games/<id>/page.html, see PAGES below). The order games share one engine:
//
//   node scripts/build-games.mjs [--standalone]
//
//   games/shared/template.html   the page, with five slots (fonts, styles, three.js, the code and Bayani) and {{TITLE}}
//   games/shared/core.css        the styles (a game can add games/<id>/style.css)
//   games/shared/kit3d.js        the 3D helpers
//   games/shared/aidroom.js      the first aid classroom (for the first aid games)
//   games/shared/core.js         the screens, ordering the steps, the simulation player, the results, the library link
//   games/<id>/game.js           the game itself: its words, steps, levels, rules, scene and pictures
//
// Bayani comes from src/assets/mascot.svg.
//
// Writes:
//   public/games/<id>.html          the copy the library opens in a frame. It runs offline: three.js comes from
//                                   ../engine/, and the fonts sit beside it in public/games/fonts/.
//   games/standalone/<name>.html    with --standalone: one file with everything inside, to share or review on its
//                                   own with no internet
//
// The generated files are not committed; npm run dev and npm run build make the library's copy.

import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'public', 'games');
const standaloneOut = join(root, 'games', 'standalone');
const standalone = process.argv.includes('--standalone');
const shared = join(root, 'games', 'shared');

// Games that are whole pages of their own, not built from the order-game template: the build fills in their fonts
// (<!--@FONTS-->) and copies them. Weather Studio (a test game) is one.
const PAGES = [
  { id: 'weather-studio', src: 'page.html', name: 'Weather-Studio.html' },
  { id: 'handa-vs-hazard', src: 'page.html', name: 'Handa-vs-Hazard.html' },
];

// parts: more shared code a game needs (the first aid games share their room)
const GAMES = [
  { id: 'quake-in-order', name: 'Quake-in-Order.html', title: 'Quake in Order' },
  { id: 'heart-in-order', name: 'Heart-in-Order.html', title: 'Heart in Order', parts: ['aidroom.js'] },
  { id: 'press-on', name: 'Press-On.html', title: 'Press On', parts: ['aidroom.js'] },
];

const FONTS = [
  ['Baloo 2', 'baloo-2', 700], ['Baloo 2', 'baloo-2', 800],
  ['Nunito', 'nunito', 700], ['Nunito', 'nunito', 800], ['Nunito', 'nunito', 900],
];
const fontFile = (pkg, w) => pkg + '-latin-' + w + '-normal.woff2';
const fontPath = (pkg, w) => join(root, 'node_modules', '@fontsource', pkg, 'files', fontFile(pkg, w));
const face = (fam, w, url) => "@font-face{font-family:'" + fam + "';font-style:normal;font-weight:" + w + ';font-display:swap;src:url(' + url + ") format('woff2')}";
const fonts = (url) => '<style>\n/* Baloo 2 and Nunito, SIL Open Font License 1.1 */\n' + FONTS.map(([fam, pkg, w]) => face(fam, w, url(pkg, w))).join('\n') + '\n</style>';
const b64 = (p) => readFileSync(p).toString('base64');
const read = (p) => readFileSync(p, 'utf8');
const escHtml = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
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

const mascot = read(join(root, 'src', 'assets', 'mascot.svg')).trim();
const template = read(join(shared, 'template.html'));
const kit = read(join(shared, 'kit3d.js')), core = read(join(shared, 'core.js')), coreCss = read(join(shared, 'core.css'));
mkdirSync(join(out, 'fonts'), { recursive: true });
for (const [, pkg, w] of FONTS) copyFileSync(fontPath(pkg, w), join(out, 'fonts', fontFile(pkg, w)));
if (standalone) mkdirSync(standaloneOut, { recursive: true });
const three = standalone ? read(join(root, 'public', 'engine', 'three.min.js')) : ''; // three.js r128 (MIT License)

const built = [];
for (const g of GAMES) {
  const dir = join(root, 'games', g.id);
  const page = template.split('{{TITLE}}').join(escHtml(g.title));
  const style = join(dir, 'style.css');
  const common = {
    '/*@CSS*/': coreCss + (existsSync(style) ? '\n' + read(style) : ''),
    '/*@APP*/': inScript([kit, ...(g.parts || []).map((f) => read(join(shared, f))), core, read(join(dir, 'game.js'))].join('\n')),
    '<!--@MASCOT-->': mascot,
  };
  // 1. the library's copy
  writeFileSync(join(out, g.id + '.html'), fill(page, {
    ...common,
    '<!--@FONTS-->': fonts((pkg, w) => 'fonts/' + fontFile(pkg, w)),
    '<!--@THREE-->': '<script src="../engine/three.min.js"></script>',
  }, 'games/shared/template.html'));
  built.push('public/games/' + g.id + '.html');
  // 2. one file with everything inside
  if (standalone) {
    writeFileSync(join(standaloneOut, g.name), fill(page, {
      ...common,
      '<!--@FONTS-->': fonts((pkg, w) => 'data:font/woff2;base64,' + b64(fontPath(pkg, w))),
      '<!--@THREE-->': '<script>\n' + inScript(three) + '\n</script>',
    }, 'games/shared/template.html'));
    built.push('games/standalone/' + g.name);
  }
}
for (const g of PAGES) {
  const page = read(join(root, 'games', g.id, g.src));
  if (page.split('<!--@FONTS-->').length !== 2) throw new Error('games/' + g.id + '/' + g.src + ' needs exactly one <!--@FONTS-->');
  writeFileSync(join(out, g.id + '.html'), page.replace('<!--@FONTS-->', () => fonts((pkg, w) => 'fonts/' + fontFile(pkg, w))));
  built.push('public/games/' + g.id + '.html');
  if (standalone) {
    writeFileSync(join(standaloneOut, g.name), page.replace('<!--@FONTS-->', () => fonts((pkg, w) => 'data:font/woff2;base64,' + b64(fontPath(pkg, w)))));
    built.push('games/standalone/' + g.name);
  }
}
console.log('Games built: ' + built.join(', '));
