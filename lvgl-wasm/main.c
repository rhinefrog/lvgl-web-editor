/**
 * LVGL WebAssembly Preview
 *
 * This file compiles LVGL using Emscripten and provides
 * a framebuffer that can be accessed from JavaScript.
 *
 * Build:
 *   cd lvgl-wasm
 *   git clone https://github.com/lvgl/lvgl.git --branch v8.4
 *   mkdir build && cd build
 *   emcmake cmake ..
 *   emmake make -j$(nproc)
 *
 * The output will be lvgl_preview.html, lvgl_preview.js, lvgl_preview.wasm
 */

#include "lvgl/lvgl.h"
#include <emscripten/emscripten.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define HOR_RES 320
#define VER_RES 240

static lv_color_t *fb;
static lv_disp_drv_t disp_drv;
static lv_disp_t *disp;
static lv_indev_drv_t indev_drv;
static int fb_initialized = 0;

/* Exported framebuffer for JS access */
uint32_t *EMSCRIPTEN_KEEPALIVE get_framebuffer(void) {
    return (uint32_t *)fb;
}

int EMSCRIPTEN_KEEPALIVE get_hor_res(void) {
    return HOR_RES;
}

int EMSCRIPTEN_KEEPALIVE get_ver_res(void) {
    return VER_RES;
}

/* Call this from JS to create widgets at runtime */
void EMSCRIPTEN_KEEPALIVE lv_refresh(void) {
    lv_timer_handler();
}

/* Display flushing */
static void disp_flush(lv_disp_drv_t *drv, const lv_area_t *area, lv_color_t *color_p) {
    if (fb_initialized) {
        int32_t x, y;
        for (y = area->y1; y <= area->y2; y++) {
            for (x = area->x1; x <= area->x2; x++) {
                fb[y * HOR_RES + x] = color_p[(y - area->y1) * lv_area_get_width(area) + (x - area->x1)];
            }
        }
    }
    lv_disp_flush_ready(drv);
}

/* Touchpad read (called from JS) */
static void touch_read(lv_indev_drv_t *drv, lv_indev_data_t *data) {
    static int16_t last_x = 0, last_y = 0;
    static int pressed = 0;

    /* These values are set from JavaScript via EM_ASM or ccall */
    data->point.x = last_x;
    data->point.y = last_y;
    data->state = pressed ? LV_INDEV_STATE_PRESSED : LV_INDEV_STATE_RELEASED;
}

void EMSCRIPTEN_KEEPALIVE set_touch(int x, int y, int pressed_state) {
    extern lv_indev_data_t *indev_data;
    /* Will be set via touch_read next cycle */
    static int16_t tx, ty;
    static int tp;
    tx = x;
    ty = y;
    tp = pressed_state;
}

void lv_init_preview(int w, int h) {
    if (fb_initialized) return;

    fb = (lv_color_t *)malloc(w * h * sizeof(lv_color_t));
    if (!fb) {
        printf("Failed to allocate framebuffer\n");
        return;
    }
    memset(fb, 0, w * h * sizeof(lv_color_t));

    lv_disp_drv_init(&disp_drv);
    disp_drv.hor_res = w;
    disp_drv.ver_res = h;
    disp_drv.flush_cb = disp_flush;
    disp_drv.draw_buf = NULL;
    disp_drv.buffer = NULL;
    disp = lv_disp_drv_register(&disp_drv);

    lv_indev_drv_init(&indev_drv);
    indev_drv.type = LV_INDEV_TYPE_POINTER;
    indev_drv.read_cb = touch_read;
    lv_indev_drv_register(&indev_drv);

    fb_initialized = 1;
    printf("LVGL initialized: %dx%d\n", w, h);
}

int main(int argc, char **argv) {
    lv_init();
    lv_init_preview(HOR_RES, VER_RES);

    /* Create a simple default screen for testing */
    lv_obj_t *scr = lv_scr_act();
    lv_obj_set_style_bg_color(scr, lv_color_hex(0x1a1a2e), 0);

    lv_obj_t *label = lv_label_create(scr);
    lv_label_set_text(label, "LVGL 8.4 WASM Preview");
    lv_obj_center(label);

    printf("LVGL WASM preview ready\n");
    return 0;
}
