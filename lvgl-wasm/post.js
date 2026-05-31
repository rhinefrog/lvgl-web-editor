/**
 * post.js - Runs after the WASM module is loaded
 * Sets up the rendering loop and touch event handling.
 */

(function() {
    var canvas = document.getElementById('lvgl-canvas');
    if (!canvas) {
        console.warn('LVGL canvas element not found');
        return;
    }

    var ctx = canvas.getContext('2d');
    var imageData = ctx.createImageData(320, 240);

    function renderLoop() {
        if (Module._lv_refresh) {
            Module._lv_refresh();
        }

        if (Module._get_framebuffer) {
            var fbPtr = Module._get_framebuffer();
            if (fbPtr) {
                var fb = new Uint32Array(
                    Module.HEAPU8.buffer,
                    fbPtr,
                    320 * 240
                );

                for (var i = 0; i < 320 * 240; i++) {
                    var pixel = fb[i];
                    var r = (pixel >> 16) & 0xFF;
                    var g = (pixel >> 8) & 0xFF;
                    var b = pixel & 0xFF;
                    var idx = i * 4;
                    imageData.data[idx] = r;
                    imageData.data[idx + 1] = g;
                    imageData.data[idx + 2] = b;
                    imageData.data[idx + 3] = 255;
                }

                ctx.putImageData(imageData, 0, 0);
            }
        }

        requestAnimationFrame(renderLoop);
    }

    /* Touch handling */
    canvas.addEventListener('mousedown', function(e) {
        var rect = canvas.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        if (Module._set_touch) {
            Module._set_touch(x, y, 1);
        }
    });

    canvas.addEventListener('mousemove', function(e) {
        if (e.buttons > 0) {
            var rect = canvas.getBoundingClientRect();
            var x = e.clientX - rect.left;
            var y = e.clientY - rect.top;
            if (Module._set_touch) {
                Module._set_touch(x, y, 1);
            }
        }
    });

    canvas.addEventListener('mouseup', function(e) {
        if (Module._set_touch) {
            Module._set_touch(0, 0, 0);
        }
    });

    /* Touch events for mobile */
    canvas.addEventListener('touchstart', function(e) {
        e.preventDefault();
        var touch = e.touches[0];
        var rect = canvas.getBoundingClientRect();
        var x = touch.clientX - rect.left;
        var y = touch.clientY - rect.top;
        if (Module._set_touch) {
            Module._set_touch(x, y, 1);
        }
    });

    canvas.addEventListener('touchmove', function(e) {
        e.preventDefault();
        var touch = e.touches[0];
        var rect = canvas.getBoundingClientRect();
        var x = touch.clientX - rect.left;
        var y = touch.clientY - rect.top;
        if (Module._set_touch) {
            Module._set_touch(x, y, 1);
        }
    });

    canvas.addEventListener('touchend', function(e) {
        e.preventDefault();
        if (Module._set_touch) {
            Module._set_touch(0, 0, 0);
        }
    });

    renderLoop();
})();
