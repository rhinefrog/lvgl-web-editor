export type LvglUnit = 'px' | '%' | 'auto' | 'content' | 'none';

export interface LvglPoint {
  x: number;
  y: number;
}

export interface LvglArea {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface LvglStyle {
  width?: number | string;
  height?: number | string;
  x?: number | string;
  y?: number | string;
  padTop?: number;
  padBottom?: number;
  padLeft?: number;
  padRight?: number;
  padRow?: number;
  padColumn?: number;
  radius?: number;
  borderWidth?: number;
  borderColor?: string;
  borderSide?: 'full' | 'top' | 'bottom' | 'left' | 'right' | 'none';
  bgColor?: string;
  bgGradColor?: string;
  bgGradDir?: 'none' | 'ver' | 'hor';
  bgOpacity?: number;
  textColor?: string;
  textFont?: string;
  textAlign?: 'left' | 'center' | 'right' | 'auto';
  textOpacity?: number;
  shadowWidth?: number;
  shadowColor?: string;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  outlineWidth?: number;
  outlineColor?: string;
  outlinePad?: number;
  lineColor?: string;
  lineWidth?: number;
  lineDashWidth?: number;
  lineDashGap?: number;
  lineRounded?: boolean;
  opacity?: number;
  transformAngle?: number;
  transformZoom?: number;
  transformPivotX?: number;
  transformPivotY?: number;
  translateX?: number;
  translateY?: number;
  animDuration?: number;
  animDelay?: number;
  flexFlow?: string;
  flexMainPlace?: string;
  flexCrossPlace?: string;
  flexTrackPlace?: string;
  flexGrow?: number;
  flexShrink?: number;
  flexBasis?: number;
  layout?: number;
}

export type LvglEvent = 
  | 'clicked' | 'pressed' | 'released' | 'short_clicked' | 'long_pressed'
  | 'long_pressed_repeat' | 'double_clicked'
  | 'value_changed' | 'ready'
  | 'focused' | 'defocused'
  | 'scroll_begin' | 'scroll_end' | 'scroll'
  | 'size_changed' | 'style_changed'
  | 'draw_main_begin' | 'draw_main_end'
  | 'delete';

export interface LvglEventHandler {
  event: LvglEvent;
  code: string;
  name?: string;
}

export type LvglWidgetType =
  | 'lv_obj'
  | 'lv_btn'
  | 'lv_label'
  | 'lv_slider'
  | 'lv_bar'
  | 'lv_arc'
  | 'lv_led'
  | 'lv_switch'
  | 'lv_checkbox'
  | 'lv_roller'
  | 'lv_dropdown'
  | 'lv_textarea'
  | 'lv_textarea'
  | 'lv_img'
  | 'lv_imgbtn'
  | 'lv_btnmatrix'
  | 'lv_chart'
  | 'lv_table'
  | 'lv_tabview'
  | 'lv_win'
  | 'lv_msgbox'
  | 'lv_spinbox'
  | 'lv_spinner'
  | 'lv_gauge'
  | 'lv_scale'
  | 'lv_keyboard'
  | 'lv_list'
  | 'lv_linemeter'
  | 'lv_canvas'
  | 'lv_line'
  | 'lv_span'
  | 'lv_tileview'
  | 'lv_animimg'
  | 'lv_calendar'
  | 'lv_colorwheel'
  | 'lv_menu'
  | 'lv_msg'
  | 'lv_roller'
  | 'lv_span'
  | 'lv_tabview'
  | 'lv_tileview';

export const LVGL_WIDGET_NAMES: Record<LvglWidgetType, string> = {
  lv_obj: 'Base Object',
  lv_btn: 'Button',
  lv_label: 'Label',
  lv_slider: 'Slider',
  lv_bar: 'Bar',
  lv_arc: 'Arc',
  lv_led: 'LED',
  lv_switch: 'Switch',
  lv_checkbox: 'Checkbox',
  lv_roller: 'Roller',
  lv_dropdown: 'Dropdown',
  lv_textarea: 'Text Area',
  lv_img: 'Image',
  lv_imgbtn: 'Image Button',
  lv_btnmatrix: 'Button Matrix',
  lv_chart: 'Chart',
  lv_table: 'Table',
  lv_tabview: 'Tab View',
  lv_win: 'Window',
  lv_msgbox: 'Message Box',
  lv_spinbox: 'Spinbox',
  lv_spinner: 'Spinner',
  lv_gauge: 'Gauge',
  lv_scale: 'Scale',
  lv_keyboard: 'Keyboard',
  lv_list: 'List',
  lv_linemeter: 'Line Meter',
  lv_canvas: 'Canvas',
  lv_line: 'Line',
  lv_span: 'Span',
  lv_tileview: 'Tile View',
  lv_animimg: 'Animated Image',
  lv_calendar: 'Calendar',
  lv_colorwheel: 'Color Wheel',
  lv_menu: 'Menu',
  lv_msg: 'Message',
};

export interface LvglWidgetProperty {
  key: string;
  label: string;
  type: 'number' | 'text' | 'color' | 'select' | 'boolean' | 'textarea';
  default: unknown;
  options?: { label: string; value: string }[];
  min?: number;
  max?: number;
  step?: number;
  category: 'basic' | 'style' | 'specific' | 'event' | 'layout';
}

export interface LvglWidgetDefinition {
  type: LvglWidgetType;
  label: string;
  icon: string;
  defaultSize: { w: number; h: number };
  canHaveChildren: boolean;
  properties: LvglWidgetProperty[];
}

export interface LvglWidgetNode {
  id: string;
  type: LvglWidgetType;
  label: string;
  area: LvglArea;
  style: LvglStyle;
  properties: Record<string, unknown>;
  events: LvglEventHandler[];
  children: LvglWidgetNode[];
  parentId: string | null;
}
