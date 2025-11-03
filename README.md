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
npm ci
# build rust example locally (requires rust toolchain)
cd examples/rust
rustup target add wasm32-unknown-unknown
cargo build --release --target wasm32-unknown-unknown
# run the loader
node examples/web/loader.js
```