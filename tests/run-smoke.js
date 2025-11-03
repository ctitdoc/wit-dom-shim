/**
 * tests/run-smoke.js
 * Minimal smoke test to instantiate wasm built by CI and call run_demo.
 * Uses jsdom to create a DOM environment.
 */
const path = require('path');
const { JSDOM } = require('jsdom');
const { instantiateWasm } = require('../src/shim/wit-adapter');
const fs = require('fs');

(async () => {
  const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: "outside-only" });
  global.window = dom.window;
  global.document = dom.window.document;
  const wasmPath = path.join(__dirname, '..', 'examples', 'rust', 'target', 'wasm32-unknown-unknown', 'release', 'wit_dom_example.wasm');
  if (!fs.existsSync(wasmPath)) {
    console.error('wasm not found at', wasmPath);
    process.exit(1);
  }
  try {
    const instance = await instantiateWasm(wasmPath);
    if (instance.exports.run_demo) {
      instance.exports.run_demo();
      console.log('smoke test: run_demo invoked');
      process.exit(0);
    }
    console.error('run_demo not found');
    process.exit(2);
  } catch (e) {
    console.error('instantiation failed', e);
    process.exit(3);
  }
})();