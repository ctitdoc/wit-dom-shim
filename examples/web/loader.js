/**
 * examples/web/loader.js
 * Loads the WASM module compiled by Rust and runs run_demo
 */

import { instantiateWasm } from '../../src/shim/wit-adapter.js';

(async () => {
  const wasmUrl = '/wit-dom-shim/examples/rust/target/wasm32-unknown-unknown/release/wit_dom_example.wasm';

  try {
    const instance = await instantiateWasm(wasmUrl);
    if (instance && instance.exports && instance.exports.run_demo) {

      // patch de node_add_event_listener pour passer l'instance WASM
      const original_add_event_listener = window.node_add_event_listener;
      window.node_add_event_listener = function (nodeHandle, eventNamePtr, eventNameLen, callbackPtr) {
        // on redirige vers la fonction originale du shim en injectant l'instance WASM
        original_add_event_listener(nodeHandle, eventNamePtr, eventNameLen, callbackPtr, instance);
      };

      instance.exports.run_demo();
      console.log('run_demo invoked');
    } else {
      console.error('run_demo not found in WASM exports');
    }
  } catch (e) {
    console.error('failed to load wasm:', e.message);
  }
})();
