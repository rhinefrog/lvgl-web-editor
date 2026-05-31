cmake_minimum_required(VERSION 3.20)
project(lvgl_wasm)

set(CMAKE_EXECUTABLE_SUFFIX ".html")
set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -s USE_SDL=2 -s WASM=1 -s ALLOW_MEMORY_GROWTH=1 -s SINGLE_FILE=0")
set(CMAKE_EXECUTABLE_LINKER_FLAGS "${CMAKE_EXECUTABLE_LINKER_FLAGS} --pre-js ${CMAKE_SOURCE_DIR}/pre.js --post-js ${CMAKE_SOURCE_DIR}/post.js -s EXPORTED_RUNTIME_METHODS='[\"ccall\",\"cwrap\",\"getValue\",\"setValue\",\"UTF8ToString\"]' -s EXPORTED_FUNCTIONS='[\"_main\",\"_malloc\",\"_free\"]'")

# LVGL library
add_subdirectory(lvgl)

# Main executable
add_executable(lvgl_preview
    main.c
)

target_link_libraries(lvgl_preview PRIVATE lvgl)
target_include_directories(lvgl_preview PRIVATE
    ${CMAKE_SOURCE_DIR}/lvgl
)

# Copy output to dist folder
set_target_properties(lvgl_preview PROPERTIES
    OUTPUT_NAME "lvgl_preview"
)
