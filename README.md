# LVGL Web Editor

A browser-based drag-and-drop editor for creating [LVGL v8.4](https://lvgl.io) user interfaces. Build UIs visually, export C code, and generate complete Pico SDK projects for RP2040/RP2350 boards with Waveshare display support.

## Features

- **Visual Editor** – 34 LVGL widgets drag-and-drop on a resizable canvas with grid snap and alignment
- **Properties Panel** – edit widget properties, styles, and events with instant C code preview
- **C Code Export** – generates pure LVGL 8.4 C code ready for any project
- **Pico SDK Export** – produces a complete ZIP project with CMakeLists.txt, port files (display + touch), board headers, VS Code debug configs, and optional FreeRTOS support
- **Board Selection** – built-in definitions for Waveshare RP2350 Touch LCD 7" (800×480 ST7262), 2.8C (480×480 ST7701S), 4" (480×480 ST7701), and a generic SPI template
- **Screenshot Converter** – import a screenshot, auto-detect UI regions via flood-fill, or draw regions manually, then add them to the canvas as LVGL widgets
- **Project Save/Load** – export and import the full project as a single JSON file
- **WASM Preview** *(optional)* – live LVGL preview compiled with Emscripten

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Documentation

- [Installation Guide](INSTALL.md)
- [User Manual](MANUAL.md)
- [Deutsches README](README.de.md)

## Related

- [LVGL](https://lvgl.io) – Embedded GUI library
- [Waveshare RP2350 Touch LCD](https://www.waveshare.com) – Supported hardware
- [Pico SDK](https://github.com/raspberrypi/pico-sdk) – Raspberry Pi microcontroller SDK
# lvgl-web-editor
