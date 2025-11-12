/**
 * src/shim/wit-adapter.js
 * Full WIT DOM shim for browser with handle mapping and string decoding
 */

let wasmInstance = null;
let wasmMemory = null;
const eventRegistry = new WeakMap(); // 🔹 stocke les callbacks déjà associés

export function setWasmInstance(instance) {
    wasmInstance = instance;
}

export function setWasmMemory(memory) {
    wasmMemory = memory;
}

export async function instantiateWasm(bytesOrUrl) {
    let wasmBytes;

    if (typeof bytesOrUrl === "string") {
        const resp = await fetch(bytesOrUrl);
        wasmBytes = await resp.arrayBuffer();
    } else if (bytesOrUrl instanceof ArrayBuffer) {
        wasmBytes = bytesOrUrl;
    } else {
        throw new Error("Invalid argument, expected URL string or ArrayBuffer");
    }

    // Map handles (numbers) → DOM nodes
    const nodes = new Map();
    let nextHandle = 1;

    function storeNode(node) {
        const handle = nextHandle++;
        nodes.set(handle, node);
        return handle;
    }

    function getNode(handle) {
        return nodes.get(handle);
    }

    const imports = {
        env: {
            document_create_element: (ptr, len) => {
                const tag = readString(ptr, len);
                const el = document.createElement(tag);
                return storeNode(el);
            },

            document_get_element_by_id: (ptr, len) => {
                const id = readString(ptr, len);
                const el = document.getElementById(id) || document.createElement("div");
                return storeNode(el);
            },

            document_body: () => storeNode(document.body),

            node_append_child: (parentHandle, childHandle) => {
                const parent = getNode(parentHandle);
                const child = getNode(childHandle);
                if (parent && child) parent.appendChild(child);
                else console.warn("node_append_child failed: invalid handle");
            },

            node_set_text: (nodeHandle, ptr, len) => {
                const node = getNode(nodeHandle);
                if (node) {
                    const text = readString(ptr, len);
                    node.textContent = text;
                }
            },

            node_set_attribute: (nodeHandle, namePtr, nameLen, valuePtr, valueLen) => {
                const node = getNode(nodeHandle);
                if (node) {
                    const name = readString(namePtr, nameLen);
                    const value = readString(valuePtr, valueLen);
                    node.setAttribute(name, value);
                }
            },

            /**
             * Ajoute un event listener sur un node.
             * nodeHandle: handle de l'élément
             * eventNamePtr/eventNameLen: nom de l'événement (ex: "click")
             * callbackPtr: index ou placeholder du callback Rust
             * instance: l'instance WASM contenant le callback Rust (ex: on_click)
             */
            node_add_event_listener: (nodeHandle, eventNamePtr, eventNameLen, callbackPtr) => {
                const node = getNode(nodeHandle);
                if (!node) {
                    console.warn("Invalid node handle in node_add_event_listener");
                    return;
                }

                const eventName = readString(eventNamePtr, eventNameLen);

                // ✅ éviter les doublons
                if (eventRegistry.has(node) && eventRegistry.get(node).includes(eventName)) {
                    console.log(`Event '${eventName}' already bound for this node`);
                    return;
                }

                // ✅ créer ou récupérer la liste des events déjà associés
                const events = eventRegistry.get(node) || [];
                events.push(eventName);
                eventRegistry.set(node, events);

                // ✅ un seul listener propre
                node.addEventListener(eventName, () => {
                    if (wasmInstance && wasmInstance.exports && wasmInstance.exports.on_click) {
                        try {
                            wasmInstance.exports.on_click();
                            console.log(`✅ WASM callback on_click executed for event '${eventName}'`);
                        } catch (err) {
                            console.error(`❌ Error executing WASM callback for '${eventName}':`, err);
                        }
                    } else {
                        console.warn(`⚠️ No WASM callback found for event '${eventName}'`);
                    }
                });

                console.log(`✅ Bound '${eventName}' listener to node`, node);
            },

            console_log: (ptr, len) => {
                const msg = readString(ptr, len);
                console.log("WASM log:", msg);
            },

            drop_resource_node: (handle) => nodes.delete(handle),
            drop_resource_element: (handle) => nodes.delete(handle),
            drop_resource_document: (handle) => nodes.delete(handle),
        }
    };

    const {instance} = await WebAssembly.instantiate(wasmBytes, imports);

    // Sauvegarde globale
    setWasmInstance(instance);
    setWasmMemory(instance.exports.memory);

    function readString(ptr, len) {
        if (!wasmMemory) {
            console.error("WASM memory not set!");
            return "";
        }
        const bytes = new Uint8Array(wasmMemory.buffer, ptr, len);
        return new TextDecoder('utf-8').decode(bytes);
    }

    return instance;
}
