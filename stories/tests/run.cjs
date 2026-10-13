// Plays every Handaventures story in a simulated browser (jsdom): every ending, both story
// styles, both characters. Run with: npm run test:stories (it builds the standalone copies first).
const { execFileSync } = require('child_process');
const path = require('path');

const here = __dirname;
const page = (f) => path.join(here, '..', 'standalone', f);
const lib = (f) => path.join(here, '..', '..', 'public', 'stories', f);
const runs = [
  ['typhoon.test.cjs', page('bagyong-kulog.html')],
  ['stories.test.cjs', page('bagyong-agos.html'), path.join(here, 'specs.cjs'), 'flood'],
  ['stories.test.cjs', page('big-shake.html'), path.join(here, 'specs.cjs'), 'quake'],
  ['stories.test.cjs', page('smoke-at-night.html'), path.join(here, 'specs.cjs'), 'fire'],
  ['stories.test.cjs', page('lockdown-at-school.html'), path.join(here, 'specs.cjs'), 'lockdown'],
  // The same stories as the library shows them (embedded, library look, progress kept by the app).
  ['embed.test.cjs', lib('bagyong-kulog.html'), 'typhoon'],
  ['embed.test.cjs', lib('bagyong-agos.html'), 'flood'],
  ['embed.test.cjs', lib('big-shake.html'), 'quake'],
  ['embed.test.cjs', lib('smoke-at-night.html'), 'fire'],
  ['embed.test.cjs', lib('lockdown-at-school.html'), 'lockdown'],
];

let failed = 0;
for (const [script, ...args] of runs) {
  try {
    const out = execFileSync(process.execPath, [path.join(here, script), ...args], { encoding: 'utf8' });
    const last = out.trim().split('\n').pop();
    process.stdout.write((last.startsWith(path.basename(args[0])) ? '' : path.basename(args[0]) + ': ') + last + '\n');
  } catch (e) {
    failed++;
    process.stdout.write(path.basename(args[0]) + ': FAILED\n' + (e.stdout || '') + (e.stderr || ''));
  }
}
process.exit(failed ? 1 : 0);
