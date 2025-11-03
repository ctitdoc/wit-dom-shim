/**
 * src/shim/index.js
 * Minimal WIT DOM shim: resource table + basic document/node operations.
 */

const TextDecoder = require('util').TextDecoder || global.TextDecoder;
const textDecoder = new TextDecoder('utf-8');

let _nextHandle = 1;
const resources = {
  node: new Map()
};

function allocResource(kind, value) {
  const id = _nextHandle++;
  resources[kind].set(id, value);
  return id;
}
function getResource(kind, id) {
  return resources[kind].get(id);
}
function dropResource(kind, id) {
  resources[kind].delete(id);
}

function readStringFromMemory(memory, ptr, len) {
  const mem = new Uint8Array(memory.buffer, ptr, len);
  return textDecoder.decode(mem);
}

function createShimImports(memory) {
  return {
    browser_dom: {
      // document.create_element(tag_ptr, tag_len) -> handle (u32)
      document_create_element(ptr, len) {
        const tag = readStringFromMemory(memory, ptr, len);
        const el = global.document ? global.document.createElement(tag) : { tag, _poly: true, children: [], textContent: "" };
        if (global.document) {
          el.textContent = "created-by-wasm-shim";
          global.document.body.appendChild(el);
        }
        return allocResource('node', el);
      },
      document_body() {
        if (global.document) {
          const el = global.document.body;
          return allocResource('node', el);
        }
        const body = { tag: 'body', children: [], textContent: '' };
        return allocResource('node', body);
      },
      node_set_text(handle, ptr, len) {
        const el = getResource('node', handle);
        const s = readStringFromMemory(memory, ptr, len);
        if (!el) return;
        el.textContent = s;
      },
      node_get_text(handle, ret_ptr) {
        // Not implemented: would write string into wasm memory and return ptr/len
        return 0;
      },
      node_append_child(parent_handle, child_handle) {
        const p = getResource('node', parent_handle);
        const c = getResource('node', child_handle);
        if (!p || !c) return;
        if (global.document) p.appendChild(c);
        else p.children.push(c);
      },
      node_remove(handle) {
        const el = getResource('node', handle);
        if (!el) return;
        if (global.document && el.parentNode) el.parentNode.removeChild(el);
        dropResource('node', handle);
      },
      // simple drop hook
      drop_resource_node(handle) {
        dropResource('node', handle);
      }
    },
    env: {
      memory
    }
  };
}

module.exports = {
  createShimImports,
  _internal: { resources }
};