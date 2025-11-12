# WIT DOM Shim

Proof-of-concept WIT DOM shim (JS) + js-wit-bindgen minimal POC.

This repository contains:
- a minimal WIT spec for `browser.dom`
- a JS runtime shim that exposes resource handles and basic DOM like APIs
- an example Rust module that calls the shimbed APIs
- CI that builds the Rust wasm and runs a JS smoke test

## Quick start

```bash
# install deps
npm install
# build rust example wasm library locally (requires rust toolchain)
cd examples/rust
rustup target add wasm32-unknown-unknown
cargo build --release --target wasm32-unknown-unknown
# publish the demo
pushd  ~/dev; rm -rf /home/itdoc/sites/sitems/wit-dom-shim; cp -r ./wit-dom-shim /home/itdoc/sites/sitems/.; popd
```
## run the demo:
Go to [the demo page](http://www.sitems.org:16386/wit-dom-shim/).

All the elements of this page are created by Rust code via the shim.

No glue between JS and Rust/Wasm (more info about [the glue issue](https://hacks.mozilla.org/2019/08/webassembly-interface-types/?utm_source=chatgpt.com)): no marshalling/unmarshaling of the DOM elements between both languages : the shim manages the delegation of the DOM manipulations from the Rust code to the browser via a JS implementation of the [WIT](https://component-model.bytecodealliance.org/design/wit.html?utm_source=chatgpt.com) handle/resource concept (the shim).

Click the "Click me!" button => it calls Rust code that creates the "Button clicked! Hello from Rust WIT shim!", that appears below the button.

With such a shim approach, Rust/Wasm frontend frameworks can test/start their support of the WIT standard wihtout having to wait for the browsers to support it: think of it as a WIT polyfill enabling WIT based front end application to run in browsers not supporting WIT yet.