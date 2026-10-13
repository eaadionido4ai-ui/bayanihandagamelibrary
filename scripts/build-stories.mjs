// Builds the Handaventures story games from the shared story engine.
//
//   node scripts/build-stories.mjs [--standalone]
//
// Reads stories/engine.html plus one stories/story-*.js file per story. Each story
// file starts with header comments:
//   // @title  page title
//   // @brand  name shown in the story's top bar
//   // @sets   comma-separated scene sets the story uses (home, school, room)
//   // @out    output file name
//
// Writes:
//   public/stories/<out>          the copy the library opens in a frame (embedded mode, no web fonts)
//   public/stories/fonts/*.woff2  the library's Baloo 2 and Nunito, so the stories work offline
//   stories/standalone/<out>      with --standalone: complete pages that run on their own
//
// The generated files are not committed; npm run dev and npm run build make them.

import { copyFileSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'stories');
const out = join(root, 'public', 'stories');
const standaloneOut = join(src, 'standalone');
const standalone = process.argv.includes('--standalone');

const FONTS = [
  ['baloo-2', 'baloo-2-latin-700-normal.woff2'],
  ['baloo-2', 'baloo-2-latin-800-normal.woff2'],
  ['nunito', 'nunito-latin-700-normal.woff2'],
  ['nunito', 'nunito-latin-800-normal.woff2'],
  ['nunito', 'nunito-latin-900-normal.woff2'],
  ['nunito', 'nunito-latin-800-italic.woff2'],
];

const template = readFileSync(join(src, 'engine.html'), 'utf8');
const WEB_FONTS = /<link rel="preconnect" href="https:\/\/fonts\.g[^>]*>\n|<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com[^>]*>\n/g;

// A complete page around the engine output (the engine itself starts at <title>).
function page(html, { webFonts }) {
  const at = html.indexOf('</style>');
  let head = html.slice(0, at), body = html.slice(at + '</style>'.length);
  if (!webFonts) head = head.replace(WEB_FONTS, '');
  return '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
    + '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
    + '<style>body{margin:0}:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}img{max-width:100%}</style>\n'
    + head + '</style>\n</head>\n<body>\n' + body.replace(/^\n+/, '') + '\n</body>\n</html>\n';
}

mkdirSync(join(out, 'fonts'), { recursive: true });
if (standalone) mkdirSync(standaloneOut, { recursive: true });
for (const [pkg, file] of FONTS) copyFileSync(join(root, 'node_modules', '@fontsource', pkg, 'files', file), join(out, 'fonts', file));

const built = [];
for (const f of readdirSync(src).filter((n) => /^story-.+\.js$/.test(n)).sort()) {
  const js = readFileSync(join(src, f), 'utf8');
  const meta = Object.fromEntries([...js.matchAll(/^\/\/ @(\w+) (.+)$/gm)].map((m) => [m[1], m[2].trim()]));
  for (const k of ['title', 'brand', 'sets', 'out']) if (!meta[k]) throw new Error(f + ' is missing its // @' + k + ' line');
  const sets = new Set(meta.sets.split(',').map((x) => x.trim()));
  let html = template.split('{{TITLE}}').join(meta.title).split('{{BRAND}}').join(meta.brand);
  html = html.replace(/<!--SET (\w+)-->([\s\S]*?)<!--\/SET \1-->\n?/g, (m, name, inner) => (sets.has(name) ? inner : ''));
  html = html.replace('/*@STORY@*/', () => js);
  writeFileSync(join(out, meta.out), page(html, { webFonts: false }));
  if (standalone) writeFileSync(join(standaloneOut, meta.out), page(html, { webFonts: true }));
  built.push(meta.out);
}
console.log('Stories built: ' + built.join(', ') + (standalone ? ' (with standalone copies)' : ''));
