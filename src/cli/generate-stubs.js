/**
 * src/cli/generate-stubs.js
 * Very small PoC: reads simple WIT file and prints stubbed JS imports for the shim.
 * Not a full parser — for demo only.
 */
const fs = require('fs');
const path = require('path');

function generate(jsOutPath, witPath) {
  const wit = fs.readFileSync(witPath, 'utf8');
  const lines = wit.split(/\n/).map(l=>l.trim());
  const funcs = [];
  for (const l of lines) {
    if (l.startsWith('resource')) continue;
    if (l.includes('->') || l.includes('(')) {
      funcs.push(l);
    }
  }
  const out = ['// Auto-generated simple stubs (POC)'];
  out.push('module.exports = { browser_dom: {');
  out.push('  // add function bodies manually or use the shim runtime');
  out.push('}};');
  fs.writeFileSync(jsOutPath, out.join('\n'));
  console.log('wrote', jsOutPath);
}

if (require.main === module) {
  const witPath = process.argv[2] || path.join(__dirname, '..', '..', 'wit', 'browser-dom.wit');
  const out = process.argv[3] || path.join(__dirname, '..', '..', 'src', 'shim', 'stubs.js');
  generate(out, witPath);
}