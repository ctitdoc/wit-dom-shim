/**
 * src/shim/wit-adapter.js
 * Utilities to instantiate a wasm module and wire the shim imports.
 */

const fs = require('fs');
const path = require('path');
const { createShimImports } = require('./index');

async function instantiateWasm(wasmPath) {
  const bytes = fs.readFileSync(wasmPath);
  const mod = await WebAssembly.compile(bytes);
  // create an initial memory; if the module exports memory, we'll use that one after instantiate
  const memory = new WebAssembly.Memory({ initial: 20 });
  const imports = createShimImports(memory);
  const instance = await WebAssembly.instantiate(mod, imports);
  // if module provides memory, replace references
  if (instance.exports && instance.exports.memory) {
    const wasmMem = instance.exports.memory;
    // rebuild imports with wasm memory view
    const newImports = createShimImports(wasmMem);
    const instance2 = await WebAssembly.instantiate(mod, newImports);
    return instance2;
  }
  return instance;
}

module.exports = { instantiateWasm };