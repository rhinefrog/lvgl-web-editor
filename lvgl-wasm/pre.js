/**
 * pre.js - Runs before the WASM module is loaded
 * Sets up the Module object and canvas.
 */

var Module = Module || {};

Module.canvas = document.getElementById('lvgl-canvas') || null;

Module.onRuntimeInitialized = function() {
    console.log('LVGL WASM runtime initialized');
    if (typeof Module._lv_init_preview === 'function') {
        Module._lv_init_preview(320, 240);
    }
};
