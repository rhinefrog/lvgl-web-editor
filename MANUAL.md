# User Manual

## Interface Overview

```
┌──────────────────────────────────────────────────────────────┐
│  Toolbar                                                      │
├────────┬──────────────────────────────────┬───────────────────┤
│Toolbox │      Canvas                      │ Properties Panel  │
│        │                                  │                   │
│  Widgets│    Drag & drop area              │  Properties       │
│  palette │    Grid background              │  Styles           │
│         │    Snapping guides              │  Events           │
│         │    Resize handles               │  C Code Preview   │
└────────┴──────────────────────────────────┴───────────────────┘
```

### Toolbar

The toolbar at the top provides quick access to all functions:

- **Editor / Screenshot** – toggle between the visual editor and screenshot converter mode
- **Toolbox toggle** (📦) – show/hide the left widget palette
- **Panel toggle** (⚙) – show/hide the right properties panel
- **Screen size** (📐) – set canvas dimensions (with presets for common display sizes)
- **Properties / Code / Events** – switch between property editor, raw C code view, and event list
- **Open** (📂) – import a saved `.json` project file
- **Save** (💾) – export the current project as a `.json` file
- **C Code** (📥) – download pure LVGL C code
- **Pico SDK** (🎯) – export a complete Pico SDK ZIP project; opens a dialog to select the target board and optionally enable FreeRTOS
- **Trash** (🗑) – clear the entire canvas

### Toolbox (Left)

Drag widgets from the toolbox onto the canvas, or click to add at the center. Widgets are grouped into five categories:

| Category    | Widgets |
|-------------|---------|
| **Basic**   | obj, button, label, image, image button |
| **Input**   | slider, bar, arc, switch, checkbox, dropdown, textarea, spinbox, roller |
| **Display** | chart, table, linemeter, gauge, scale, canvas, led, colorwheel, animimg |
| **Navigation** | tabview, tileview, list, menu, window, message box, keyboard |
| **Container** | button matrix, line, span, msg, spinner |

### Canvas (Center)

- **Drag** widgets to move them freely
- **Resize** by dragging the corner/edge handles
- **Snap** – widgets snap to grid lines and other widgets when within 10px
- **Grid** – configurable background grid for alignment
- **Preview mode** – the canvas shows a live-rendered approximation of the final UI
- **Right-click** (or long-press) a widget to see a context menu with copy, delete, and bring-to-front options

### Properties Panel (Right)

Three tabs control the selected widget:

1. **Properties** – widget-specific properties (position, size, text, range, color, opacity, etc.)
2. **Events** – add/remove LVGL event callbacks (click, press, release, value changed, etc.)
3. **Code** – live C code preview that updates as you edit; copy directly from here

### Selection

- Click a widget to select it (blue border)
- Click the canvas background to deselect
- Selected widget properties appear in the panel
- Use keyboard: **Delete/Backspace** to remove, **Ctrl+C / Ctrl+V** to copy/paste, **Ctrl+A** to select all

---

## Screenshot Converter

Switch to Screenshot mode via the toolbar toggle. This lets you convert a screenshot image into LVGL widgets.

### Workflow

1. **Load an image** – drag an image onto the drop zone or click to select a file
2. **Auto-detect regions** – click a pixel in the image; the flood-fill algorithm finds contiguous color regions. Adjust:
   - **Threshold** – color tolerance (0-255)
   - **Min size** – ignore regions smaller than this (in pixels)
3. **Classify** – each detected region is auto-classified as btn, label, slider, bar, or led based on shape/size heuristics. You can override the type manually.
4. **Manual drawing** – use the tools to draw rectangles, labels, or buttons by clicking and dragging on the image
5. **Add All to Canvas** – adds all detected and drawn regions to the editor canvas as LVGL widgets
6. **Clear** – remove all regions and start over

---

## Project Export

### C Code

Generates a single `lvgl_ui.c` file containing all widgets, styles, and events as LVGL 8.4 API calls. Include it in any C project with LVGL.

### Pico SDK Project

Generates a ZIP file with:

```
lvgl_rp2350_project.zip
├── CMakeLists.txt          # Build configuration
├── main.c                  # Entry point with init + UI code
├── lv_conf.h               # LVGL configuration
├── pico_sdk_import.cmake   # Pico SDK import
├── boards/                 # Board header definitions
│   └── waveshare_rp2350_touch_lcd_7.h
├── port/
│   ├── lv_port_disp.c      # Display driver (board-specific)
│   ├── lv_port_disp.h
│   ├── lv_port_indev.c     # Touch driver (board-specific)
│   └── lv_port_indev.h
├── FreeRTOSConfig.h        # (only when FreeRTOS is enabled)
└── .vscode/
    ├── launch.json         # Debug configurations
    └── settings.json       # C/C++ intellisense settings
```

To build the exported project, see the [Installation Guide](INSTALL.md#pico-sdk-project-export).

### Boards

Four boards are built-in. The export generates board-specific display and touch initialization code:

| Board | Chip | Resolution | Display | Touch |
|-------|------|-----------|---------|-------|
| Waveshare RP2350 Touch LCD 7" | RP2350 | 800×480 | ST7262 RGB + PSRAM | GT911 I2C |
| Waveshare RP2350 Touch LCD 2.8C | RP2350 | 480×480 | ST7701S RGB | GT911 I2C |
| Waveshare RP2350 Touch LCD 4" | RP2350 | 480×480 | ST7701 RGB | GT911 I2C |
| Generic RP2350 (SPI) | RP2350 | 480×320 | ST7789/ILI9341 SPI | CST816/FT6236 |

---

## WASM Preview

If the WASM build has been generated (see [Installation Guide](INSTALL.md#wasm-preview-optional)), click the preview button in the toolbar to open a live LVGL preview in a new tab. This runs the generated C code in the browser through Emscripten.

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Delete / Backspace | Remove selected widget |
| Ctrl+C | Copy selected widget |
| Ctrl+V | Paste widget |
| Ctrl+A | Select all widgets |
| Escape | Deselect / close dialogs |
| Arrow keys | Nudge selected widget 1px |
| Shift + Arrow | Nudge 10px |

---

## Troubleshooting

**Canvas is empty / widgets not showing** – make sure the screen size is set to match your target display. Very small screens may clip widgets.

**Export fails** – check the browser console for errors. Exporting large projects may take a moment.

**Screenshot conversion doesn't detect regions** – lower the threshold value and ensure the image has solid-color regions. Complex gradients and photographs work poorly with flood-fill.

**Pico SDK project doesn't compile** – verify `PICO_SDK_PATH` is set, LVGL v8.4 is cloned, and the board-specific BSP library is available. For RGB display boards, the Waveshare BSP is required.
