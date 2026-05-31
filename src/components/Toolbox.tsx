import { useCallback, useState } from 'react';
import { WIDGET_LIST } from '../types/widgetDefinitions';
import type { LvglWidgetType } from '../types/lvgl';
import { useEditorStore } from '../store/editorStore';

const CATEGORIES: { label: string; types: LvglWidgetType[] }[] = [
  { label: 'Basic', types: ['lv_obj', 'lv_btn', 'lv_label', 'lv_img', 'lv_imgbtn'] },
  { label: 'Input', types: ['lv_slider', 'lv_bar', 'lv_arc', 'lv_switch', 'lv_checkbox', 'lv_dropdown', 'lv_textarea', 'lv_spinbox', 'lv_roller', 'lv_span'] },
  { label: 'Display', types: ['lv_chart', 'lv_table', 'lv_linemeter', 'lv_gauge', 'lv_scale', 'lv_canvas', 'lv_led', 'lv_colorwheel', 'lv_animimg'] },
  { label: 'Navigation', types: ['lv_tabview', 'lv_tileview', 'lv_list', 'lv_menu', 'lv_win', 'lv_msgbox', 'lv_keyboard'] },
  { label: 'Container', types: ['lv_btnmatrix', 'lv_line', 'lv_msg', 'lv_spinner'] },
];

export default function Toolbox() {
  const addWidget = useEditorStore(s => s.addWidget);
  const screenWidth = useEditorStore(s => s.screenWidth);
  const screenHeight = useEditorStore(s => s.screenHeight);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    Object.fromEntries(CATEGORIES.map(c => [c.label, true]))
  );

  const handleDragStart = useCallback((e: React.DragEvent, type: LvglWidgetType) => {
    e.dataTransfer.setData('text/plain', type);
    e.dataTransfer.effectAllowed = 'copy';
  }, []);

  const filteredCategories = CATEGORIES.map(cat => ({
    ...cat,
    types: cat.types.filter(t => {
      const def = WIDGET_LIST.find(w => w.type === t);
      return def?.label.toLowerCase().includes(search.toLowerCase()) || t.includes(search.toLowerCase());
    }),
  })).filter(cat => cat.types.length > 0);

  return (
    <div className="toolbox">
      <div className="toolbox-header">Widgets</div>
      <input
        className="toolbox-search"
        type="text"
        placeholder="Search widgets..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <div className="toolbox-list">
        {filteredCategories.map(cat => (
          <div key={cat.label} className="toolbox-category">
            <div
              className="toolbox-category-header"
              onClick={() => setExpanded(s => ({ ...s, [cat.label]: !s[cat.label] }))}
            >
              <span className="toolbox-category-arrow">{expanded[cat.label] ? '▼' : '▶'}</span>
              {cat.label}
            </div>
            {expanded[cat.label] && cat.types.map(type => {
              const def = WIDGET_LIST.find(w => w.type === type);
              if (!def) return null;
              return (
                <div
                  key={type}
                  className="toolbox-item"
                  draggable
                  onDragStart={e => handleDragStart(e, type)}
                  onClick={() => {
                    const x = Math.max(0, (screenWidth - def.defaultSize.w) / 2);
                    const y = Math.max(0, (screenHeight - def.defaultSize.h) / 2);
                    addWidget(type, x, y);
                  }}
                  title={`Click to add, or drag to canvas`}
                >
                  <span className="toolbox-item-icon">{def.icon}</span>
                  <span className="toolbox-item-label">{def.label}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
