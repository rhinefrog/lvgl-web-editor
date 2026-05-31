# Benutzerhandbuch

## Oberflächenübersicht

```
┌──────────────────────────────────────────────────────────────┐
│  Symbolleiste                                                  │
├────────┬──────────────────────────────────┬───────────────────┤
│Toolbox │      Leinwand                    │ Eigenschaften     │
│        │                                  │                   │
│  Widgets│    Drag & Drop Bereich          │  Eigenschaften    │
│  Palette │    Rasterhintergrund           │  Stile            │
│         │    Einrasten-Hilfslinien       │  Ereignisse       │
│         │    Größenänderungsgriffe       │  C-Code-Vorschau  │
└────────┴──────────────────────────────────┴───────────────────┘
```

### Symbolleiste

Die Symbolleiste oben bietet schnellen Zugriff auf alle Funktionen:

- **Editor / Screenshot** – zwischen visuellem Editor und Screenshot-Konverter umschalten
- **Toolbox ein/aus** (📦) – linke Widget-Palette ein-/ausblenden
- **Panel ein/aus** (⚙) – rechtes Eigenschaften-Panel ein-/ausblenden
- **Bildschirmgröße** (📐) – Leinwandmaße einstellen (mit Voreinstellungen für gängige Display-Größen)
- **Eigenschaften / Code / Ereignisse** – zwischen Eigenschaftseditor, C-Code-Ansicht und Ereignisliste wechseln
- **Öffnen** (📂) – ein gespeichertes `.json`-Projekt importieren
- **Speichern** (💾) – aktuelles Projekt als `.json`-Datei exportieren
- **C-Code** (📥) – reinen LVGL C-Code herunterladen
- **Pico SDK** (🎯) – komplettes Pico-SDK-ZIP-Projekt exportieren; öffnet einen Dialog zur Board-Auswahl mit optionalem FreeRTOS
- **Papierkorb** (🗑) – gesamte Leinwand leeren

### Toolbox (Links)

Ziehen Sie Widgets per Drag & Drop auf die Leinwand oder klicken Sie, um sie in der Mitte hinzuzufügen. Widgets sind in fünf Kategorien gruppiert:

| Kategorie     | Widgets |
|--------------|---------|
| **Basic**    | obj, button, label, image, image button |
| **Input**    | slider, bar, arc, switch, checkbox, dropdown, textarea, spinbox, roller |
| **Display**  | chart, table, linemeter, gauge, scale, canvas, led, colorwheel, animimg |
| **Navigation** | tabview, tileview, list, menu, window, message box, keyboard |
| **Container**  | button matrix, line, span, msg, spinner |

### Leinwand (Mitte)

- **Ziehen** Sie Widgets, um sie frei zu positionieren
- **Größe ändern** durch Ziehen der Eck-/Kantengriffe
- **Einrasten** – Widgets rasten an Rasterlinien und anderen Widgets ein (innerhalb von 10px)
- **Raster** – konfigurierbarer Hintergrund zur Ausrichtung
- **Vorschaumodus** – die Leinwand zeigt eine Live-Darstellung der finalen UI
- **Rechtsklick** (oder langes Drücken) auf ein Widget öffnet ein Kontextmenü mit Kopieren, Löschen und In-den-Vordergrund

### Eigenschaften-Panel (Rechts)

Drei Reiter steuern das ausgewählte Widget:

1. **Eigenschaften** – widgetspezifische Eigenschaften (Position, Größe, Text, Bereich, Farbe, Deckkraft usw.)
2. **Ereignisse** – LVGL-Ereignis-Callbacks hinzufügen/entfernen (Klick, Drücken, Loslassen, Wert geändert usw.)
3. **Code** – Live-C-Code-Vorschau, die sich beim Bearbeiten aktualisiert; direkt von hier kopieren

### Auswahl

- Klicken Sie ein Widget an (blauer Rahmen)
- Klicken Sie auf den Leinwand-Hintergrund, um die Auswahl aufzuheben
- Eigenschaften des ausgewählten Widgets erscheinen im Panel
- Tastatur: **Entf/Rücktaste** zum Löschen, **Strg+C / Strg+V** zum Kopieren/Einfügen, **Strg+A** zur Auswahl aller

---

## Screenshot-Konverter

Wechseln Sie über die Symbolleiste in den Screenshot-Modus. Damit können Sie ein Screenshot-Bild in LVGL-Widgets konvertieren.

### Arbeitsablauf

1. **Bild laden** – ein Bild per Drag & Drop auf die Ablage ziehen oder klicken, um eine Datei auszuwählen
2. **Bereiche automatisch erkennen** – auf einen Pixel im Bild klicken; der Flood-Fill-Algorithmus findet zusammenhängende Farbbereiche. Einstellungen:
   - **Schwellwert** – Farbtoleranz (0-255)
   - **Mindestgröße** – Bereiche unter dieser Größe (in Pixeln) ignorieren
3. **Klassifizieren** – jeder erkannte Bereich wird automatisch als btn, label, slider, bar oder led klassifiziert. Sie können den Typ manuell überschreiben.
4. **Manuelles Zeichnen** – Rechtecke, Labels oder Buttons durch Klicken und Ziehen auf dem Bild zeichnen
5. **Alle zur Leinwand hinzufügen** – alle erkannten und gezeichneten Bereiche als LVGL-Widgets zur Leinwand hinzufügen
6. **Löschen** – alle Bereiche entfernen und neu beginnen

---

## Projektexport

### C-Code

Erzeugt eine einzelne `lvgl_ui.c`-Datei mit allen Widgets, Stilen und Ereignissen als LVGL-8.4-API-Aufrufe. In jedes C-Projekt mit LVGL einbindbar.

### Pico-SDK-Projekt

Erzeugt eine ZIP-Datei mit folgender Struktur:

```
lvgl_rp2350_project.zip
├── CMakeLists.txt          # Build-Konfiguration
├── main.c                  # Einstiegspunkt mit Init + UI-Code
├── lv_conf.h               # LVGL-Konfiguration
├── pico_sdk_import.cmake   # Pico-SDK-Import
├── boards/                 # Board-Header-Definitionen
│   └── waveshare_rp2350_touch_lcd_7.h
├── port/
│   ├── lv_port_disp.c      # Display-Treiber (boardspezifisch)
│   ├── lv_port_disp.h
│   ├── lv_port_indev.c     # Touch-Treiber (boardspezifisch)
│   └── lv_port_indev.h
├── FreeRTOSConfig.h        (nur wenn FreeRTOS aktiviert)
└── .vscode/
    ├── launch.json         # Debug-Konfigurationen
    └── settings.json       # C/C++ Intellisense-Einstellungen
```

Zum Bauen des exportierten Projekts siehe [Installationsanleitung](INSTALL.de.md#pico-sdk-projektexport).

### Boards

Vier Boards sind integriert. Der Export erzeugt boardspezifischen Display- und Touch-Initialisierungscode:

| Board | Chip | Auflösung | Display | Touch |
|-------|------|-----------|---------|-------|
| Waveshare RP2350 Touch LCD 7" | RP2350 | 800×480 | ST7262 RGB + PSRAM | GT911 I2C |
| Waveshare RP2350 Touch LCD 2.8C | RP2350 | 480×480 | ST7701S RGB | GT911 I2C |
| Waveshare RP2350 Touch LCD 4" | RP2350 | 480×480 | ST7701 RGB | GT911 I2C |
| Generisch RP2350 (SPI) | RP2350 | 480×320 | ST7789/ILI9341 SPI | CST816/FT6236 |

---

## WASM-Vorschau

Wenn der WASM-Build erzeugt wurde (siehe [Installationsanleitung](INSTALL.de.md#wasm-vorschau-optional)), klicken Sie auf den Vorschau-Button in der Symbolleiste, um eine Live-LVGL-Vorschau in einem neuen Tab zu öffnen. Diese führt den generierten C-Code über Emscripten im Browser aus.

---

## Tastaturkürzel

| Kürzel | Aktion |
|--------|--------|
| Entf / Rücktaste | Ausgewähltes Widget löschen |
| Strg+C | Widget kopieren |
| Strg+V | Widget einfügen |
| Strg+A | Alle Widgets auswählen |
| Escape | Auswahl aufheben / Dialoge schließen |
| Pfeiltasten | Widget um 1px verschieben |
| Umschalt + Pfeil | Widget um 10px verschieben |

---

## Fehlerbehebung

**Leinwand leer / Widgets werden nicht angezeigt** – stellen Sie sicher, dass die Bildschirmgröße zum Zieldisplay passt. Sehr kleine Bildschirme können Widgets abschneiden.

**Export schlägt fehl** – überprüfen Sie die Browser-Konsole auf Fehler. Der Export großer Projekte kann einen Moment dauern.

**Screenshot-Konvertierung erkennt keine Bereiche** – verringern Sie den Schwellwert und stellen Sie sicher, dass das Bild Bereiche mit einheitlicher Farbe enthält. Komplexe Verläufe und Fotos funktionieren mit Flood-Fill schlecht.

**Pico-SDK-Projekt kompiliert nicht** – überprüfen Sie, ob `PICO_SDK_PATH` gesetzt, LVGL v8.4 geklont und die boardspezifische BSP-Bibliothek vorhanden ist. Für RGB-Display-Boards wird das Waveshare-BSP benötigt.
