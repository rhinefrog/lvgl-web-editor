# Installationsanleitung

## Voraussetzungen

- **Node.js** 18+ (mit npm)
- Moderner Browser (Chrome, Firefox, Edge, Safari)

## Editor einrichten

```bash
# Projekt klonen oder herunterladen
cd lvgl-web-editor

# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten
npm run dev
```

Öffnen Sie http://localhost:5173 im Browser.

### Produktions-Build

```bash
npm run build
# Ausgabe in dist/ — mit einem beliebigen Static-File-Server ausliefern
```

## WASM-Vorschau (Optional)

Die WASM-Vorschau führt LVGL live im Browser über Emscripten aus.

### Voraussetzungen

- [Emscripten SDK](https://emscripten.org/docs/getting_started/downloads.html) (`emsdk` installiert und aktiviert)

### Build

```bash
cd lvgl-wasm
./build.sh
```

Dies klont LVGL v8.4, kompiliert es mit Emscripten und kopiert `lvgl_preview.{html,js,wasm}` nach `public/`. Der Vorschau-Button im Editor lädt dann das kompilierte Wasm.

## Pico-SDK-Projektexport

Das exportierte ZIP des Editors ist ein eigenständiges Pico-SDK-Projekt. Es erfordert:

### Voraussetzungen zum Bauen des exportierten Projekts

1. **Pico SDK** – klonen von [github.com/raspberrypi/pico-sdk](https://github.com/raspberrypi/pico-sdk) und `PICO_SDK_PATH` setzen
2. **LVGL** – `lvgl/` (v8.4) als Submodul im Projektverzeichnis hinzufügen:
   ```bash
   git submodule add https://github.com/lvgl/lvgl.git lvgl
   cd lvgl && git checkout v8.4
   ```
3. **ARM GCC Toolchain** – `gcc-arm-none-eabi` (im Raspberry-Pi-Pico-SDK-Setup enthalten)
4. **Für RGB-Displays** – Boardspezifische BSP-Bibliothek vom Board-Hersteller (z. B. Waveshares BSP für RP2350-Boards)
5. **CMake** 3.20+
6. **Für FreeRTOS-Projekte** – FreeRTOS Kernel klonen:
   ```bash
   git submodule add https://github.com/FreeRTOS/FreeRTOS-Kernel.git FreeRTOS_Kernel
   ```

### Exportiertes Projekt bauen

```bash
# Im entpackten Export-Verzeichnis
mkdir build && cd build
cmake ..
make
```

## Board-Notizen

| Board | Display | Touch | BSP erforderlich |
|-------|---------|-------|-----------------|
| Waveshare RP2350 Touch LCD 7" | ST7262 RGB 800×480 | GT911 I2C | waveshare-bsp |
| Waveshare RP2350 Touch LCD 2.8C | ST7701S RGB 480×480 | GT911 I2C | waveshare-bsp |
| Waveshare RP2350 Touch LCD 4" | ST7701 RGB 480×480 | GT911 I2C | waveshare-bsp |
| Generisch RP2350 (SPI) | ST7789/ILI9341 SPI | CST816/FT6236 | manuelle Verdrahtung |

Für generische SPI-Boards aktualisieren Sie `port/lv_port_disp.c` und `port/lv_port_indev.c` mit Ihren Pin-Zuweisungen und der Controller-Initialisierung.
