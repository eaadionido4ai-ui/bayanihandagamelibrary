// Runs the tests of every game that plays in a frame: the order games, Weather Studio, Handa vs. Hazard and Bayanihan
// Mode (after npm run test:games builds the pages).
const fs = require('fs');
const path = require('path');

(async () => {
  let pass = 0, fail = 0;
  const files = fs.readdirSync(__dirname).filter((f) => f.endsWith('.test.cjs')).sort();
  for (const f of files) {
    try {
      const t = await require(path.join(__dirname, f))();
      console.log(t.name + ': ' + t.pass + ' passed, ' + t.fail + ' failed');
      pass += t.pass; fail += t.fail;
    } catch (e) { fail++; console.log('FAIL [' + f + ']: ' + (e && e.stack || e)); }
  }
  console.log('Games in a frame: ' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
})();
