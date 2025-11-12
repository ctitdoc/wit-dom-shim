/**
 * examples/web/loader.js
 * Loads the WASM module compiled by Rust and runs run_demo
 */
import { instantiateWasm } from '../../src/shim/wit-adapter.js';

(async () => {
  const wasmUrl = '/wit-dom-shim/examples/rust/target/wasm32-unknown-unknown/release/wit_dom_example.wasm';

  try {
    const instance = await instantiateWasm(wasmUrl);

    // rendre accessible globalement pour le shim
    window.wasmInstance = instance;

    if (instance?.exports?.run_demo) {
      instance.exports.run_demo();
      console.log('✅ run_demo invoked');
    } else {
      console.error('❌ run_demo not found in WASM exports');
    }
  } catch (e) {
    console.error('❌ failed to load wasm:', e.message);
  }
})();
