#![no_std]
#![no_main]

use core::panic::PanicInfo;

extern "C" {
    fn document_create_element(ptr: u32, len: u32) -> u32;
    fn document_body() -> u32;
    fn node_set_text(handle: u32, ptr: u32, len: u32);
    fn node_set_attribute(handle: u32, name_ptr: u32, name_len: u32, value_ptr: u32, value_len: u32);
    fn node_append_child(parent: u32, child: u32);
    fn node_add_event_listener(node: u32, event_ptr: u32, event_len: u32, callback_ptr: u32);
}

// helper pour obtenir ptr/len
fn as_ptr_len(s: &'static str) -> (u32, u32) {
    (s.as_ptr() as u32, s.len() as u32)
}

// callback WASM déclenché au clic sur le bouton
#[no_mangle]
pub extern "C" fn on_click() {
    let (msg_ptr, msg_len) = as_ptr_len("Button clicked! Hello from Rust WIT shim!");
    let div = unsafe { document_create_element(as_ptr_len("div").0, as_ptr_len("div").1) };
    unsafe {
        node_set_text(div, msg_ptr, msg_len);
        let body = document_body();
        node_append_child(body, div);
    }
}

#[no_mangle]
pub extern "C" fn run_demo() {
    // --- main container ---
    let container = unsafe { document_create_element(as_ptr_len("div").0, as_ptr_len("div").1) };
    unsafe {
        node_set_attribute(container, as_ptr_len("id").0, as_ptr_len("id").1, as_ptr_len("demo-container").0, as_ptr_len("demo-container").1);
        node_set_attribute(container, as_ptr_len("class").0, as_ptr_len("class").1, as_ptr_len("container").0, as_ptr_len("container").1);
        node_set_attribute(container, as_ptr_len("style").0, as_ptr_len("style").1, as_ptr_len("padding: 16px; background-color: #f9f9f9; border: 1px solid #ccc;").0, as_ptr_len("padding: 16px; background-color: #f9f9f9; border: 1px solid #ccc;").1);
    }

    // --- header ---
    let header = unsafe { document_create_element(as_ptr_len("h2").0, as_ptr_len("h2").1) };
    unsafe {
        node_set_text(header, as_ptr_len("Ultimate WIT DOM Shim Demo").0, as_ptr_len("Ultimate WIT DOM Shim Demo").1);
        node_set_attribute(header, as_ptr_len("style").0, as_ptr_len("style").1, as_ptr_len("color: #2a2a2a; margin-bottom: 12px;").0, as_ptr_len("color: #2a2a2a; margin-bottom: 12px;").1);
        node_append_child(container, header);
    }

    // --- section avec paragraphes ---
    let section = unsafe { document_create_element(as_ptr_len("section").0, as_ptr_len("section").1) };
    unsafe {
        node_set_attribute(section, as_ptr_len("class").0, as_ptr_len("class").1, as_ptr_len("demo-section").0, as_ptr_len("demo-section").1);
        node_set_attribute(section, as_ptr_len("style").0, as_ptr_len("style").1, as_ptr_len("padding: 8px; background-color: #fff; border: 1px solid #ddd; margin-bottom: 12px;").0, as_ptr_len("padding: 8px; background-color: #fff; border: 1px solid #ddd; margin-bottom: 12px;").1);
    }

    let paragraphs = [
        "Paragraph 1: demonstrates text setting and attributes.",
        "Paragraph 2: multiple paragraphs supported.",
        "Paragraph 3: final paragraph in section."
    ];

    for text in paragraphs.iter() {
        let p = unsafe { document_create_element(as_ptr_len("p").0, as_ptr_len("p").1) };
        unsafe {
            node_set_text(p, as_ptr_len(text).0, as_ptr_len(text).1);
            node_set_attribute(p, as_ptr_len("style").0, as_ptr_len("style").1, as_ptr_len("margin-bottom: 6px;").0, as_ptr_len("margin-bottom: 6px;").1);
            node_append_child(section, p);
        }
    }

    // --- span imbriqué ---
    let span = unsafe { document_create_element(as_ptr_len("span").0, as_ptr_len("span").1) };
    unsafe {
        node_set_text(span, as_ptr_len(" - span text inside paragraph").0, as_ptr_len(" - span text inside paragraph").1);
        node_set_attribute(span, as_ptr_len("style").0, as_ptr_len("style").1, as_ptr_len("color: #d14; font-weight: bold;").0, as_ptr_len("color: #d14; font-weight: bold;").1);
        let last_p =  document_create_element(as_ptr_len("p").0, as_ptr_len("p").1) ;
        node_append_child(last_p, span);
        node_append_child(section, last_p);
    }

    unsafe { node_append_child(container, section); }

    // --- liste stylée ---
    let ul = unsafe { document_create_element(as_ptr_len("ul").0, as_ptr_len("ul").1) };
    unsafe {
        node_set_attribute(ul, as_ptr_len("class").0, as_ptr_len("class").1, as_ptr_len("demo-list").0, as_ptr_len("demo-list").1);
        node_set_attribute(ul, as_ptr_len("style").0, as_ptr_len("style").1, as_ptr_len("padding-left: 20px; margin-top: 12px;").0, as_ptr_len("padding-left: 20px; margin-top: 12px;").1);
    }

    let items = ["Item 1", "Item 2", "Item 3"];
    for item_text in items.iter() {
        let li = unsafe { document_create_element(as_ptr_len("li").0, as_ptr_len("li").1) };
        unsafe {
            node_set_text(li, as_ptr_len(item_text).0, as_ptr_len(item_text).1);
            node_set_attribute(li, as_ptr_len("style").0, as_ptr_len("style").1, as_ptr_len("margin-bottom: 4px;").0, as_ptr_len("margin-bottom: 4px;").1);
            node_append_child(ul, li);
        }
    }

    unsafe { node_append_child(container, ul); }

    // --- bouton interactif ---
    let button = unsafe { document_create_element(as_ptr_len("button").0, as_ptr_len("button").1) };
    unsafe {
        node_set_text(button, as_ptr_len("Click me!").0, as_ptr_len("Click me!").1);
        // callbackPtr = 0 placeholder, sera lié via loader JS à on_click
        node_add_event_listener(button, as_ptr_len("click").0, as_ptr_len("click").1, 0);
        node_append_child(container, button);
    }

    // --- append container to body ---
    let body = unsafe { document_body() };
    unsafe { node_append_child(body, container); }
}

#[panic_handler]
fn panic(_info: &PanicInfo) -> ! {
    loop {}
}
