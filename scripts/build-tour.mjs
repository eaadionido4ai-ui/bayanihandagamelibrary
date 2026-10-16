// Builds BAYANIHanda Island, the 3D tour, from tour/tour.html (one file, two modes).
//
//   node scripts/build-tour.mjs [--pitch]
//
// Writes:
//   public/tour/index.html   Bayani's tour for kids, which the library opens in a frame. It runs offline:
//                            the 3D engine comes from ../engine/, the fonts and pictures sit beside it.
//   public/tour/fonts/, art/, screens/tab-home.webp, island.webp
//
// With --pitch, also the presenter's tour (pitch mode, with the one-minute guided tour and the script):
//   tour/standalone/BAYANIHanda-3D-Tour.html   one file with everything inside, for a laptop with no internet
//   tour/standalone/web/                       index.html plus its pictures, for a web host (three.js from
//                                              cdnjs, fonts from Google Fonts)
//
// The generated files are not committed; npm run dev and npm run build make the library's copy.

import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'tour');
const out = join(root, 'public', 'tour');
const pitch = process.argv.includes('--pitch');

const FONTS = [
  ['Baloo 2', 'baloo-2', 700], ['Baloo 2', 'baloo-2', 800],
  ['Nunito', 'nunito', 700], ['Nunito', 'nunito', 800], ['Nunito', 'nunito', 900],
];
const fontFile = (pkg, w) => pkg + '-latin-' + w + '-normal.woff2';
const fontPath = (pkg, w) => join(root, 'node_modules', '@fontsource', pkg, 'files', fontFile(pkg, w));
const ART = ['bayanihan', 'bahaghari', 'tanim', 'kulog', 'agos'].map((n) => 'art/' + n + '.webp');
const SCREENS = ['phone-home-top', 'phone-home-pillars', 'phone-hv-story', 'phone-gobag-intro', 'phone-champion-id',
  'tab-home', 'tab-stream-intro', 'tab-museum'].map((n) => 'screens/' + n + '.webp');
const KIDS_SCREENS = ['screens/tab-home.webp']; // Bayani's tour only shows the tablet on the stand

const template = readFileSync(join(src, 'tour.html'), 'utf8');
for (const tag of ['<!--@FONTS-->', '<!--@THREE-->', '<div id="stage"']) {
  if (template.split(tag).length !== 2) throw new Error('tour/tour.html needs exactly one ' + tag);
}
// every screen the page names must be in the list, or the page would look for a file that is not there
const named = new Set([...template.matchAll(/'((?:phone|tab)-[a-z-]+)'/g)].map((m) => 'screens/' + m[1] + '.webp'));
const missing = [...named].filter((n) => !SCREENS.includes(n));
if (missing.length) throw new Error('screens not in the list: ' + missing.join(', '));
for (const f of [...ART, ...SCREENS, 'island.webp']) if (!existsSync(join(src, f))) throw new Error('missing tour/' + f);

// A complete page: what comes before the stage goes in <head>.
function page(html, title, note) {
  if (title) html = html.replace(/<title>[^<]*<\/title>/, '<title>' + title + '</title>');
  const cut = html.indexOf('<div id="stage"');
  return '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
    + '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
    + (note ? '<!-- ' + note + ' -->\n' : '')
    + html.slice(0, cut) + '</head>\n<body>\n' + html.slice(cut) + '</body>\n</html>\n';
}
const fill = (html, fonts, three) => html.replace('<!--@FONTS-->', () => fonts).replace('<!--@THREE-->', () => three);
const face = (fam, w, url) => "@font-face{font-family:'" + fam + "';font-style:normal;font-weight:" + w + ';font-display:block;src:url(' + url + ") format('woff2')}";
const copy = (from, to) => { mkdirSync(dirname(to), { recursive: true }); copyFileSync(from, to); };

// 1. Bayani's tour for the library
for (const [, pkg, w] of FONTS) copy(fontPath(pkg, w), join(out, 'fonts', fontFile(pkg, w)));
for (const f of [...ART, ...KIDS_SCREENS, 'island.webp']) copy(join(src, f), join(out, f));
writeFileSync(join(out, 'index.html'), page(fill(template,
  '<style>\n/* Baloo 2 and Nunito, SIL Open Font License 1.1 */\n' + FONTS.map(([fam, pkg, w]) => face(fam, w, 'fonts/' + fontFile(pkg, w))).join('\n') + '\n</style>',
  '<script>window.TOUR_MODE = \'kids\';</script>\n<script src="../engine/three.min.js"></script>'), 'Bayani’s island tour'));
console.log('Tour built: public/tour/index.html');

// 2. The presenter's tour, offline and for the web
if (pitch) {
  const standalone = join(src, 'standalone');
  const b64 = (p) => readFileSync(p).toString('base64');
  const three = readFileSync(join(root, 'public', 'engine', 'three.min.js'), 'utf8'); // three.js r128 (MIT License)
  if (three.toLowerCase().includes('</script')) throw new Error('three.js cannot be inlined as is');
  const pics = [...SCREENS, ...ART].map((p) => '  "' + p + '": "data:image/webp;base64,' + b64(join(src, p)) + '"').join(',\n');
  const offline = page(fill(template,
    '<style>\n/* Baloo 2 and Nunito, SIL Open Font License 1.1 */\n' + FONTS.map(([fam, pkg, w]) => face(fam, w, 'data:font/woff2;base64,' + b64(fontPath(pkg, w)))).join('\n') + '\n</style>',
    '<script>\nwindow.TOUR_ASSETS = {\n' + pics + '\n};\n</script>\n<script>\n' + three + '\n</script>'), null,
  'BAYANIHanda 3D Tour, offline edition. Open this file in Chrome or Edge; it needs no internet.\n'
    + '     Subject for code and content validation. Conceptualized and developed with AI assistance by\n'
    + '     Edward Andrew A. Dionido, Science Research Specialist II, UPRI. Handaventures concept by Celine Tatco,\n'
    + '     Senior Project Associate, UPRI. 3D engine: three.js r128 (MIT License).');
  const left = offline.replace(three, '').replace(/https:\/\/(?:github\.com|threejs\.org|fonts\.google\.com)[^\s"')]*/g, '');
  if (/https?:\/\//.test(left.replace(/http:\/\/www\.w3\.org\/2000\/svg/g, ''))) throw new Error('the offline tour still names a web address');
  mkdirSync(standalone, { recursive: true });
  writeFileSync(join(standalone, 'BAYANIHanda-3D-Tour.html'), offline);

  const web = join(standalone, 'web');
  for (const f of [...SCREENS, ...ART, 'island.webp']) copy(join(src, f), join(web, f));
  writeFileSync(join(web, 'index.html'), page(fill(template,
    '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@700;800&family=Nunito:wght@700;800;900&display=swap">',
    '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>')));
  console.log('Presenter tour built: tour/standalone/BAYANIHanda-3D-Tour.html (' + (offline.length / 1e6).toFixed(2) + ' MB) and tour/standalone/web/');
}
