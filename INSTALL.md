# Installation Guide

## Requirements

- **Node.js** 18+ (with npm)
- Modern browser (Chrome, Firefox, Edge, Safari)

## Editor Setup

```bash
# Clone or download the project
cd lvgl-web-editor

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open http://localhost:5173 in your browser.

### Production Build

```bash
npm run build
# Output is in dist/ — serve with any static file server
```

## WASM Preview (Optional)

The WASM preview lets you run LVGL live in the browser via Emscripten.

### Prerequisites

- [Emscripten SDK](https://emscripten.org/docs/getting_started/downloads.html) (`emsdk` installed and activated)

### Build

```bash
cd lvgl-wasm
./build.sh
```

This clones LVGL v8.4, compiles it with Emscripten, and copies `lvgl_preview.{html,js,wasm}` to `public/`. The preview button in the editor will then load the compiled wasm.

## Pico SDK Project Export

The exported ZIP from the editor is a standalone Pico SDK project. It requires:

### Prerequisites for Building the Exported Project

1. **Pico SDK** – clone from [github.com/raspberrypi/pico-sdk](https://github.com/raspberrypi/pico-sdk) and set `PICO_SDK_PATH`
2. **LVGL** – add `lvgl/` (v8.4) as a submodule in the project root:
   ```bash
   git submodule add https://github.com/lvgl/lvgl.git lvgl
   cd lvgl && git checkout v8.4
   ```
3. **ARM GCC Toolchain** – `gcc-arm-none-eabi` (included with Raspberry Pi Pico SDK setup)
4. **For RGB displays** – board-specific BSP library from the board vendor (e.g., Waveshare's BSP for RP2350 boards)
5. **CMake** 3.20+
6. **For FreeRTOS projects** – clone FreeRTOS Kernel:
   ```bash
   git submodule add https://github.com/FreeRTOS/FreeRTOS-Kernel.git FreeRTOS_Kernel
   ```

### Build the Exported Project

```bash
# In the extracted export directory
mkdir build && cd build
cmake ..
make
```

## Board Notes

| Board | Display | Touch | BSP Required |
|-------|---------|-------|-------------|
| Waveshare RP2350 Touch LCD 7" | ST7262 RGB 800×480 | GT911 I2C | waveshare-bsp |
| Waveshare RP2350 Touch LCD 2.8C | ST7701S RGB 480×480 | GT911 I2C | waveshare-bsp |
| Waveshare RP2350 Touch LCD 4" | ST7701 RGB 480×480 | GT911 I2C | waveshare-bsp |
| Generic RP2350 (SPI) | ST7789/ILI9341 SPI | CST816/FT6236 | manual wiring |

For generic SPI boards, update `port/lv_port_disp.c` and `port/lv_port_indev.c` with your pin assignments and controller initialization.
