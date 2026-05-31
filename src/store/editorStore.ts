import { create } from 'zustand';
import type { LvglWidgetNode, LvglWidgetType, LvglStyle, LvglEventHandler } from '../types/lvgl';
import { WIDGET_DEFINITIONS } from '../types/widgetDefinitions';

let nextId = 1;
function generateId(): string {
  return `widget_${nextId++}_${Date.now()}`;
}

function createDefaultWidget(type: LvglWidgetType, x: number, y: number): LvglWidgetNode {
  const def = WIDGET_DEFINITIONS[type];
  const props: Record<string, unknown> = {};
  for (const p of def.properties) {
    props[p.key] = p.default;
  }
  return {
    id: generateId(),
    type,
    label: def.label,
    area: { x, y, w: def.defaultSize.w, h: def.defaultSize.h },
    style: {},
    properties: props,
    events: [],
    children: [],
    parentId: null,
  };
}

interface ClipboardData {
  widgets: LvglWidgetNode[];
}

interface EditorState {
  widgets: LvglWidgetNode[];
  selectedIds: string[];
  clipboard: ClipboardData | null;
  canvasScale: number;
  canvasOffsetX: number;
  canvasOffsetY: number;
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;
  screenWidth: number;
  screenHeight: number;
  previewMode: boolean;

  addWidget: (type: LvglWidgetType, x: number, y: number, parentId?: string) => void;
  removeWidget: (id: string) => void;
  updateWidgetPosition: (id: string, x: number, y: number) => void;
  updateWidgetSize: (id: string, w: number, h: number) => void;
  updateWidgetProperty: (id: string, key: string, value: unknown) => void;
  updateWidgetStyle: (id: string, style: Partial<LvglStyle>) => void;
  addWidgetEvent: (id: string, event: LvglEventHandler) => void;
  removeWidgetEvent: (id: string, eventName: string) => void;
  selectWidget: (id: string | null) => void;
  toggleWidgetSelection: (id: string) => void;
  setParentChild: (childId: string, parentId: string | null) => void;
  moveWidget: (id: string, parentId: string | null, index?: number) => void;
  duplicateWidget: (id: string) => void;
  copyWidget: (id: string) => void;
  pasteWidget: () => void;
  getWidgetById: (id: string) => LvglWidgetNode | undefined;
  getRootWidgets: () => LvglWidgetNode[];
  getAllWidgetsFlat: () => LvglWidgetNode[];
  setScreenSize: (w: number, h: number) => void;
  setCanvasScale: (scale: number) => void;
  setPreviewMode: (mode: boolean) => void;
  loadProject: (widgets: LvglWidgetNode[]) => void;
  clearProject: () => void;
  exportProject: () => string;
  importProject: (json: string) => boolean;
}

function findAndRemoveWidget(widgets: LvglWidgetNode[], id: string): LvglWidgetNode | null {
  for (let i = 0; i < widgets.length; i++) {
    if (widgets[i].id === id) {
      const removed = widgets.splice(i, 1)[0];
      return removed;
    }
    const found = findAndRemoveWidget(widgets[i].children, id);
    if (found) return found;
  }
  return null;
}

function findWidgetById(widgets: LvglWidgetNode[], id: string): LvglWidgetNode | undefined {
  for (const w of widgets) {
    if (w.id === id) return w;
    const found = findWidgetById(w.children, id);
    if (found) return found;
  }
  return undefined;
}

function addWidgetToTarget(
  widgets: LvglWidgetNode[],
  parentId: string | null,
  widget: LvglWidgetNode
): boolean {
  if (parentId === null) {
    widgets.push(widget);
    return true;
  }
  for (const w of widgets) {
    if (w.id === parentId) {
      w.children.push(widget);
      widget.parentId = parentId;
      return true;
    }
    if (addWidgetToTarget(w.children, parentId, widget)) return true;
  }
  return false;
}

function flattenWidgets(widgets: LvglWidgetNode[]): LvglWidgetNode[] {
  const result: LvglWidgetNode[] = [];
  for (const w of widgets) {
    result.push(w);
    result.push(...flattenWidgets(w.children));
  }
  return result;
}

function cloneWidgetTree(node: LvglWidgetNode, newId?: string): LvglWidgetNode {
  const id = newId || generateId();
  return {
    ...node,
    id,
    parentId: null,
    children: node.children.map(c => cloneWidgetTree(c, generateId())),
  };
}

export const useEditorStore = create<EditorState>((set, get) => ({
  widgets: [],
  selectedIds: [],
  clipboard: null,
  canvasScale: 1,
  canvasOffsetX: 0,
  canvasOffsetY: 0,
  showGrid: true,
  snapToGrid: true,
  gridSize: 10,
  screenWidth: 320,
  screenHeight: 240,
  previewMode: false,

  addWidget: (type, x, y, parentId) => {
    const widget = createDefaultWidget(type, x, y);
    set(state => {
      const newWidgets = JSON.parse(JSON.stringify(state.widgets)) as LvglWidgetNode[];
      if (parentId) {
        addWidgetToTarget(newWidgets, parentId, widget);
      } else {
        newWidgets.push(widget);
      }
      return { widgets: newWidgets, selectedIds: [widget.id] };
    });
  },

  removeWidget: (id) => {
    set(state => {
      const newWidgets = JSON.parse(JSON.stringify(state.widgets)) as LvglWidgetNode[];
      findAndRemoveWidget(newWidgets, id);
      return {
        widgets: newWidgets,
        selectedIds: state.selectedIds.filter(sid => sid !== id),
      };
    });
  },

  updateWidgetPosition: (id, x, y) => {
    set(state => {
      const newWidgets = JSON.parse(JSON.stringify(state.widgets)) as LvglWidgetNode[];
      const widget = findWidgetById(newWidgets, id);
      if (widget) {
        widget.area.x = x;
        widget.area.y = y;
      }
      return { widgets: newWidgets };
    });
  },

  updateWidgetSize: (id, w, h) => {
    set(state => {
      const newWidgets = JSON.parse(JSON.stringify(state.widgets)) as LvglWidgetNode[];
      const widget = findWidgetById(newWidgets, id);
      if (widget) {
        widget.area.w = Math.max(10, w);
        widget.area.h = Math.max(10, h);
      }
      return { widgets: newWidgets };
    });
  },

  updateWidgetProperty: (id, key, value) => {
    set(state => {
      const newWidgets = JSON.parse(JSON.stringify(state.widgets)) as LvglWidgetNode[];
      const widget = findWidgetById(newWidgets, id);
      if (widget) {
        widget.properties[key] = value;
      }
      return { widgets: newWidgets };
    });
  },

  updateWidgetStyle: (id, style) => {
    set(state => {
      const newWidgets = JSON.parse(JSON.stringify(state.widgets)) as LvglWidgetNode[];
      const widget = findWidgetById(newWidgets, id);
      if (widget) {
        Object.assign(widget.style, style);
      }
      return { widgets: newWidgets };
    });
  },

  addWidgetEvent: (id, event) => {
    set(state => {
      const newWidgets = JSON.parse(JSON.stringify(state.widgets)) as LvglWidgetNode[];
      const widget = findWidgetById(newWidgets, id);
      if (widget) {
        widget.events = [...widget.events, event];
      }
      return { widgets: newWidgets };
    });
  },

  removeWidgetEvent: (id, eventName) => {
    set(state => {
      const newWidgets = JSON.parse(JSON.stringify(state.widgets)) as LvglWidgetNode[];
      const widget = findWidgetById(newWidgets, id);
      if (widget) {
        widget.events = widget.events.filter(e => e.event !== eventName);
      }
      return { widgets: newWidgets };
    });
  },

  selectWidget: (id) => {
    set({ selectedIds: id ? [id] : [] });
  },

  toggleWidgetSelection: (id) => {
    set(state => ({
      selectedIds: state.selectedIds.includes(id)
        ? state.selectedIds.filter(sid => sid !== id)
        : [...state.selectedIds, id],
    }));
  },

  setParentChild: (childId, parentId) => {
    set(state => {
      const newWidgets = JSON.parse(JSON.stringify(state.widgets)) as LvglWidgetNode[];
      const widget = findWidgetById(newWidgets, childId);
      if (!widget) return state;
      findAndRemoveWidget(newWidgets, childId);
      widget.parentId = parentId;
      if (parentId) {
        addWidgetToTarget(newWidgets, parentId, widget);
      } else {
        newWidgets.push(widget);
      }
      return { widgets: newWidgets };
    });
  },

  moveWidget: (id, parentId, index) => {
    set(state => {
      const newWidgets = JSON.parse(JSON.stringify(state.widgets)) as LvglWidgetNode[];
      const widget = findWidgetById(newWidgets, id);
      if (!widget) return state;
      findAndRemoveWidget(newWidgets, id);
      widget.parentId = parentId;
      if (parentId) {
        const parent = findWidgetById(newWidgets, parentId);
        if (parent) {
          if (index !== undefined) {
            parent.children.splice(index, 0, widget);
          } else {
            parent.children.push(widget);
          }
        }
      } else {
        if (index !== undefined) {
          newWidgets.splice(index, 0, widget);
        } else {
          newWidgets.push(widget);
        }
      }
      return { widgets: newWidgets };
    });
  },

  duplicateWidget: (id) => {
    set(state => {
      const newWidgets = JSON.parse(JSON.stringify(state.widgets)) as LvglWidgetNode[];
      const original = findWidgetById(newWidgets, id);
      if (!original) return state;
      const clone = cloneWidgetTree(original);
      clone.area = { ...clone.area, x: clone.area.x + 20, y: clone.area.y + 20 };
      clone.parentId = original.parentId;
      if (clone.parentId) {
        const parent = findWidgetById(newWidgets, clone.parentId);
        if (parent) parent.children.push(clone);
      } else {
        newWidgets.push(clone);
      }
      return { widgets: newWidgets, selectedIds: [clone.id] };
    });
  },

  copyWidget: (id) => {
    const state = get();
    const widget = findWidgetById(state.widgets, id);
    if (widget) {
      set({ clipboard: { widgets: [cloneWidgetTree(widget)] } });
    }
  },

  pasteWidget: () => {
    const state = get();
    if (!state.clipboard) return;
    const pasted = state.clipboard.widgets.map(w => cloneWidgetTree(w));
    const offset = 20;
    for (const p of pasted) {
      p.area.x += offset;
      p.area.y += offset;
    }
    set(s => ({
      widgets: [...s.widgets, ...pasted],
      selectedIds: pasted.map(p => p.id),
    }));
  },

  getWidgetById: (id) => {
    return findWidgetById(get().widgets, id);
  },

  getRootWidgets: () => {
    return get().widgets;
  },

  getAllWidgetsFlat: () => {
    return flattenWidgets(get().widgets);
  },

  setScreenSize: (w, h) => {
    set({ screenWidth: w, screenHeight: h });
  },

  setCanvasScale: (scale) => {
    set({ canvasScale: scale });
  },

  setPreviewMode: (mode) => {
    set({ previewMode: mode });
  },

  loadProject: (widgets) => {
    set({ widgets, selectedIds: [] });
  },

  clearProject: () => {
    set({ widgets: [], selectedIds: [] });
  },

  exportProject: () => {
    const state = get();
    return JSON.stringify({
      version: 1,
      screenWidth: state.screenWidth,
      screenHeight: state.screenHeight,
      widgets: state.widgets,
    }, null, 2);
  },

  importProject: (json) => {
    try {
      const data = JSON.parse(json);
      if (!data.widgets || !Array.isArray(data.widgets)) return false;
      set({
        widgets: data.widgets as LvglWidgetNode[],
        screenWidth: data.screenWidth ?? 320,
        screenHeight: data.screenHeight ?? 240,
        selectedIds: [],
      });
      return true;
    } catch {
      return false;
    }
  },
}));
