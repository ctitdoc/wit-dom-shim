/**
 * examples/web/loader.js
 * Loads the wasm module (compiled by CI) and runs run_demo.
 * Uses shim imports from package.
 */
const path = require('path');
const { instantiateWasm } = require('../../src/shim/wit-adapter');

(async () => {
  const wasmPath = path.join(__dirname, '..', 'rust', 'target', 'wasm32-unknown-unknown', 'release', 'wit_dom_example.wasm');
  try {
    const instance = await instantiateWasm(wasmPath);
    if (instance && instance.exports && instance.exports.run_demo) {
      instance.exports.run_demo();
      console.log('run_demo invoked');
    } else {
      console.error('run_demo not found');
    }
  } catch (e) {
    console.error('failed to load wasm:', e.message);
  }
})();