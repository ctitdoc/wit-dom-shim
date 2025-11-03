#![no_std]
#![no_main]

use core::panic::PanicInfo;

extern "C" {
    fn document_create_element(ptr: u32, len: u32) -> u32;
    fn document_body() -> u32;
    fn node_set_text(handle: u32, ptr: u32, len: u32);
    fn node_append_child(parent: u32, child: u32);
    fn drop_resource_node(handle: u32);
}

// helper to get ptr/len of a static string
fn as_ptr_len(s: &'static str) -> (u32, u32) {
    (s.as_ptr() as u32, s.len() as u32)
}

#[no_mangle]
pub extern "C" fn run_demo() {
    // create a div
    let (p, l) = as_ptr_len("div");
    let div = unsafe { document_create_element(p, l) };
    // set text
    let (tp, tl) = as_ptr_len("Hello from Rust WIT shim!");
    unsafe { node_set_text(div, tp, tl); }
    // append to body
    let body = unsafe { document_body() };
    unsafe { node_append_child(body, div); }
    // later remove
    // unsafe { drop_resource_node(div); }
}

#[panic_handler]
fn panic(_info: &PanicInfo) -> ! {
    loop {}
}