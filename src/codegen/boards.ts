export interface BoardDefinition {
  id: string;
  name: string;
  chip: 'rp2040' | 'rp2350';
  resolution: { w: number; h: number };
  display: {
    controller: string;
    type: 'rgb' | 'spi' | 'parallel';
    pclkFreq?: number;
    doubleBuffer?: boolean;
    psram?: boolean;
    transferSize?: string;
  };
  touch: {
    controller: string;
    i2c?: string;
  };
  bspHeaders: string[];
  bspLibs: string[];
  boardHeaderFile: string;
  boardHeaderContent: string;
  cpuClock: number;
  notes: string;
}

const waveshareRp2350TouchLcd7Header = [
  '#ifndef _BOARDS_WAVESHARE_RP2350_TOUCH_LCD_7_H',
  '#define _BOARDS_WAVESHARE_RP2350_TOUCH_LCD_7_H',
  '',
  '#include "boards/pico2.h"',
  '',
  '#ifndef PICO_DEFAULT_UART',
  '#define PICO_DEFAULT_UART 0',
  '#endif',
  '',
  '#ifndef PICO_DEFAULT_UART_TX_PIN',
  '#define PICO_DEFAULT_UART_TX_PIN 16',
  '#endif',
  '',
  '#ifndef PICO_DEFAULT_UART_RX_PIN',
  '#define PICO_DEFAULT_UART_RX_PIN 17',
  '#endif',
  '',
  '#ifndef PICO_DEFAULT_I2C',
  '#define PICO_DEFAULT_I2C 1',
  '#endif',
  '',
  '#ifndef PICO_DEFAULT_I2C_SDA_PIN',
  '#define PICO_DEFAULT_I2C_SDA_PIN 6',
  '#endif',
  '',
  '#ifndef PICO_DEFAULT_I2C_SCL_PIN',
  '#define PICO_DEFAULT_I2C_SCL_PIN 7',
  '#endif',
  '',
  '#ifndef PICO_FLASH_SIZE_BYTES',
  '#define PICO_FLASH_SIZE_BYTES (16 * 1024 * 1024)',
  '#endif',
  '',
  '#ifndef PICO_XOSC_STARTUP_DELAY_MULTIPLIER',
  '#define PICO_XOSC_STARTUP_DELAY_MULTIPLIER 64',
  '#endif',
  '',
  '#endif',
  '',
].join('\n');

const waveshareRp2350TouchLcd28cHeader = [
  '#ifndef _BOARDS_WAVESHARE_RP2350_TOUCH_LCD_2_8C_H',
  '#define _BOARDS_WAVESHARE_RP2350_TOUCH_LCD_2_8C_H',
  '',
  '#include "boards/pico2.h"',
  '',
  '#ifndef PICO_DEFAULT_UART',
  '#define PICO_DEFAULT_UART 0',
  '#endif',
  '#ifndef PICO_DEFAULT_UART_TX_PIN',
  '#define PICO_DEFAULT_UART_TX_PIN 0',
  '#endif',
  '#ifndef PICO_DEFAULT_UART_RX_PIN',
  '#define PICO_DEFAULT_UART_RX_PIN 1',
  '#endif',
  '',
  '#ifndef PICO_DEFAULT_I2C',
  '#define PICO_DEFAULT_I2C 0',
  '#endif',
  '#ifndef PICO_DEFAULT_I2C_SDA_PIN',
  '#define PICO_DEFAULT_I2C_SDA_PIN 4',
  '#endif',
  '#ifndef PICO_DEFAULT_I2C_SCL_PIN',
  '#define PICO_DEFAULT_I2C_SCL_PIN 5',
  '#endif',
  '',
  '#ifndef PICO_FLASH_SIZE_BYTES',
  '#define PICO_FLASH_SIZE_BYTES (4 * 1024 * 1024)',
  '#endif',
  '',
  '#endif',
  '',
].join('\n');

const waveshareRp2350TouchLcd4Header = [
  '#ifndef _BOARDS_WAVESHARE_RP2350_TOUCH_LCD_4_H',
  '#define _BOARDS_WAVESHARE_RP2350_TOUCH_LCD_4_H',
  '',
  '#include "boards/pico2.h"',
  '',
  '#ifndef PICO_DEFAULT_UART',
  '#define PICO_DEFAULT_UART 0',
  '#endif',
  '#ifndef PICO_DEFAULT_UART_TX_PIN',
  '#define PICO_DEFAULT_UART_TX_PIN 46',
  '#endif',
  '#ifndef PICO_DEFAULT_UART_RX_PIN',
  '#define PICO_DEFAULT_UART_RX_PIN 45',
  '#endif',
  '',
  '#ifndef PICO_DEFAULT_I2C',
  '#define PICO_DEFAULT_I2C 1',
  '#endif',
  '#ifndef PICO_DEFAULT_I2C_SDA_PIN',
  '#define PICO_DEFAULT_I2C_SDA_PIN 6',
  '#endif',
  '#ifndef PICO_DEFAULT_I2C_SCL_PIN',
  '#define PICO_DEFAULT_I2C_SCL_PIN 7',
  '#endif',
  '',
  '#ifndef PICO_FLASH_SIZE_BYTES',
  '#define PICO_FLASH_SIZE_BYTES (16 * 1024 * 1024)',
  '#endif',
  '',
  '#endif',
  '',
].join('\n');

const waveshareGenericRp2350Header = [
  '#ifndef _BOARDS_WAVESHARE_RP2350_TOUCH_LCD_GENERIC_H',
  '#define _BOARDS_WAVESHARE_RP2350_TOUCH_LCD_GENERIC_H',
  '',
  '#include "boards/pico2.h"',
  '',
  '#ifndef PICO_DEFAULT_UART',
  '#define PICO_DEFAULT_UART 0',
  '#endif',
  '#ifndef PICO_DEFAULT_UART_TX_PIN',
  '#define PICO_DEFAULT_UART_TX_PIN 0',
  '#endif',
  '#ifndef PICO_DEFAULT_UART_RX_PIN',
  '#define PICO_DEFAULT_UART_RX_PIN 1',
  '#endif',
  '',
  '#ifndef PICO_DEFAULT_I2C',
  '#define PICO_DEFAULT_I2C 1',
  '#endif',
  '#ifndef PICO_DEFAULT_I2C_SDA_PIN',
  '#define PICO_DEFAULT_I2C_SDA_PIN 6',
  '#endif',
  '#ifndef PICO_DEFAULT_I2C_SCL_PIN',
  '#define PICO_DEFAULT_I2C_SCL_PIN 7',
  '#endif',
  '',
  '#ifndef PICO_FLASH_SIZE_BYTES',
  '#define PICO_FLASH_SIZE_BYTES (16 * 1024 * 1024)',
  '#endif',
  '',
  '#endif',
  '',
].join('\n');

export const BOARDS: BoardDefinition[] = [
  {
    id: 'waveshare_rp2350_touch_lcd_7',
    name: 'Waveshare RP2350 Touch LCD 7"',
    chip: 'rp2350',
    resolution: { w: 800, h: 480 },
    display: {
      controller: 'ST7262',
      type: 'rgb',
      pclkFreq: 32000000,
      doubleBuffer: true,
      psram: true,
      transferSize: 'MY_DISP_HOR_RES * 80',
    },
    touch: { controller: 'GT911', i2c: 'i2c1' },
    bspHeaders: ['bsp_st7262.h', 'pio_rgb.h', 'bsp_gt911.h', 'bsp_i2c.h'],
    bspLibs: ['bsp', 'psramlib', 'pio_usb'],
    boardHeaderFile: 'waveshare_rp2350_touch_lcd_7.h',
    boardHeaderContent: waveshareRp2350TouchLcd7Header,
    cpuClock: 240,
    notes: 'Official Waveshare demo board. PIO RGB + PSRAM double buffering.',
  },
  {
    id: 'waveshare_rp2350_touch_lcd_2_8c',
    name: 'Waveshare RP2350 Touch LCD 2.8"',
    chip: 'rp2350',
    resolution: { w: 480, h: 480 },
    display: {
      controller: 'ST7701S',
      type: 'rgb',
      pclkFreq: 20000000,
      doubleBuffer: false,
      psram: false,
      transferSize: 'MY_DISP_HOR_RES * 40',
    },
    touch: { controller: 'GT911', i2c: 'i2c0' },
    bspHeaders: ['bsp_st7701s.h', 'pio_rgb.h', 'bsp_gt911.h'],
    bspLibs: ['bsp'],
    boardHeaderFile: 'waveshare_rp2350_touch_lcd_2_8c.h',
    boardHeaderContent: waveshareRp2350TouchLcd28cHeader,
    cpuClock: 240,
    notes: 'Small round display. Single buffer, no PSRAM.',
  },
  {
    id: 'waveshare_rp2350_touch_lcd_4',
    name: 'Waveshare RP2350 Touch LCD 4"',
    chip: 'rp2350',
    resolution: { w: 480, h: 480 },
    display: {
      controller: 'ST7701',
      type: 'rgb',
      pclkFreq: 20000000,
      doubleBuffer: false,
      psram: false,
      transferSize: 'MY_DISP_HOR_RES * 240',
    },
    touch: { controller: 'GT911', i2c: 'i2c1' },
    bspHeaders: ['bsp_st7701.h', 'pio_rgb.h', 'bsp_gt911.h'],
    bspLibs: ['bsp'],
    boardHeaderFile: 'waveshare_rp2350_touch_lcd_4.h',
    boardHeaderContent: waveshareRp2350TouchLcd4Header,
    cpuClock: 260,
    notes: '4" display. Single buffer, higher CPU clock.',
  },
  {
    id: 'waveshare_rp2350_touch_lcd_generic',
    name: 'Waveshare RP2350 Touch LCD (Generic)',
    chip: 'rp2350',
    resolution: { w: 480, h: 320 },
    display: {
      controller: 'ST7789/ILI9341',
      type: 'spi',
      doubleBuffer: false,
      psram: false,
    },
    touch: { controller: 'CST816/FT6236' },
    bspHeaders: [],
    bspLibs: [],
    boardHeaderFile: 'waveshare_rp2350_touch_lcd_generic.h',
    boardHeaderContent: waveshareGenericRp2350Header,
    cpuClock: 200,
    notes: 'Template for custom boards with SPI display.',
  },
];

export function findBoard(id: string): BoardDefinition | undefined {
  return BOARDS.find(b => b.id === id);
}
