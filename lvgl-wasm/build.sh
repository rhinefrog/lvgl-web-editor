#!/bin/bash
# Build LVGL WASM preview module
# Prerequisites: Emscripten SDK (emcc), git

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "=== LVGL WASM Preview Build ==="

# Clone LVGL if not present
if [ ! -d "lvgl" ]; then
    echo "Cloning LVGL 8.4..."
    git clone --branch v8.4 --depth 1 https://github.com/lvgl/lvgl.git
fi

# Create build directory
mkdir -p build
cd build

# Configure with Emscripten
echo "Configuring with Emscripten..."
emcmake cmake .. \
    -DCMAKE_BUILD_TYPE=Release \
    -DLVGL_HOR_RES=320 \
    -DLVGL_VER_RES=240

# Build
echo "Building..."
emmake make -j$(nproc)

# Copy output to public directory
echo "Copying to public directory..."
cp lvgl_preview.{html,js,wasm} ../../public/

echo ""
echo "=== Build complete! ==="
echo "Files copied to public/:"
echo "  - lvgl_preview.html"
echo "  - lvgl_preview.js"
echo "  - lvgl_preview.wasm"
echo ""
echo "The preview will be available in the editor when these files are served."
