# LVGL Web Editor

Ein browserbasierter Drag-and-Drop-Editor für [LVGL v8.4](https://lvgl.io) Benutzeroberflächen. Erstellen Sie UIs visuell, exportieren Sie C-Code und generieren Sie komplette Pico-SDK-Projekte für RP2040/RP2350-Boards mit Waveshare-Display-Unterstützung.

## Funktionen

- **Visueller Editor** – 34 LVGL-Widgets per Drag-and-Drop auf einer frei skalierbaren Leinwand mit Rasterfang und Ausrichtung
- **Eigenschaften-Panel** – Widget-Eigenschaften, Stile und Ereignisse bearbeiten mit Live-C-Code-Vorschau
- **C-Code-Export** – Erzeugt reinen LVGL 8.4 C-Code, bereit für jedes Projekt
- **Pico-SDK-Export** – Erzeugt ein komplettes ZIP-Projekt mit CMakeLists.txt, Port-Dateien (Display + Touch), Board-Headern, VS-Debug-Konfiguration und optionalem FreeRTOS-Support
- **Board-Auswahl** – Integrierte Definitionen für Waveshare RP2350 Touch LCD 7" (800×480 ST7262), 2.8C (480×480 ST7701S), 4" (480×480 ST7701) und eine generische SPI-Vorlage
- **Screenshot-Konverter** – Screenshot importieren, UI-Bereiche per Flood-Fill automatisch erkennen oder manuell zeichnen und als LVGL-Widgets zur Leinwand hinzufügen
- **Projekt speichern/laden** – Projekt als einzelne JSON-Datei exportieren und importieren
- **WASM-Vorschau** *(optional)* – Live-LVGL-Vorschau, kompiliert mit Emscripten

## Schnellstart

```bash
npm install
npm run dev
```

Öffnen Sie http://localhost:5173 im Browser.

## Dokumentation

- [Installationsanleitung](INSTALL.de.md)
- [Benutzerhandbuch](MANUAL.de.md)
- [English README](README.md)
