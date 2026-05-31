import { useCallback, useRef, useState, useEffect } from 'react';
import type { DragEvent, MouseEvent } from 'react';
import { useEditorStore } from '../store/editorStore';
import type { LvglWidgetNode, LvglWidgetType } from '../types/lvgl';
import { WIDGET_DEFINITIONS } from '../types/widgetDefinitions';

interface DragState {
  type: 'move' | 'resize' | 'new';
  widgetId?: string;
  startX: number;
  startY: number;
  widgetStartX: number;
  widgetStartY: number;
  widgetStartW: number;
  widgetStartH: number;
  resizeDir?: string;
}

export default function Canvas() {
  const {
    widgets, selectedIds, selectWidget, addWidget,
    updateWidgetPosition, updateWidgetSize,
    screenWidth, screenHeight, canvasScale, previewMode, showGrid, gridSize, snapToGrid,
    duplicateWidget, removeWidget, copyWidget, pasteWidget, clipboard,
  } = useEditorStore();

  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('text/plain') as LvglWidgetType;
    if (type && WIDGET_DEFINITIONS[type]) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const x = (e.clientX - rect.left - (WIDGET_DEFINITIONS[type].defaultSize.w / 2)) / canvasScale;
        const y = (e.clientY - rect.top - (WIDGET_DEFINITIONS[type].defaultSize.h / 2)) / canvasScale;
        addWidget(type, Math.max(0, x), Math.max(0, y));
      }
    }
  }, [addWidget, canvasScale]);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleCanvasMouseDown = useCallback((e: MouseEvent) => {
    if (e.target === canvasRef.current || (e.target as HTMLElement).classList.contains('canvas-area')) {
      selectWidget(null);
    }
  }, [selectWidget]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (selectedIds.length > 0 && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        selectedIds.forEach(id => removeWidget(id));
      }
    }
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'c' && selectedIds.length === 1) {
        copyWidget(selectedIds[0]);
        e.preventDefault();
      }
      if (e.key === 'v' && clipboard) {
        pasteWidget();
        e.preventDefault();
      }
      if (e.key === 'd' && selectedIds.length > 0) {
        selectedIds.forEach(id => duplicateWidget(id));
        e.preventDefault();
      }
    }
  }, [selectedIds, removeWidget, copyWidget, pasteWidget, clipboard, duplicateWidget]);

  const widgetClickHandler = useCallback((id: string, e: MouseEvent) => {
    e.stopPropagation();
    selectWidget(id);
  }, [selectWidget]);

  const widgetMouseDown = useCallback((id: string, e: MouseEvent) => {
    e.stopPropagation();
    selectWidget(id);
    const widget = findWidget(widgets, id);
    if (!widget || previewMode) return;

    const target = e.target as HTMLElement;
    const isResizeHandle = target.classList.contains('resize-handle');

    if (isResizeHandle) {
      const dir = target.dataset.dir || '';
      setDragState({
        type: 'resize',
        widgetId: id,
        startX: e.clientX,
        startY: e.clientY,
        widgetStartX: widget.area.x,
        widgetStartY: widget.area.y,
        widgetStartW: widget.area.w,
        widgetStartH: widget.area.h,
        resizeDir: dir,
      });
    } else {
      setDragState({
        type: 'move',
        widgetId: id,
        startX: e.clientX,
        startY: e.clientY,
        widgetStartX: widget.area.x,
        widgetStartY: widget.area.y,
        widgetStartW: widget.area.w,
        widgetStartH: widget.area.h,
      });
    }
  }, [selectWidget, widgets, previewMode]);

  useEffect(() => {
    if (!dragState) return;

    const handleMouseMove = (e: globalThis.MouseEvent) => {
      const dx = (e.clientX - dragState.startX) / canvasScale;
      const dy = (e.clientY - dragState.startY) / canvasScale;

      if (dragState.type === 'move' && dragState.widgetId) {
        let nx = dragState.widgetStartX + dx;
        let ny = dragState.widgetStartY + dy;
        if (snapToGrid) {
          nx = Math.round(nx / gridSize) * gridSize;
          ny = Math.round(ny / gridSize) * gridSize;
        }
        updateWidgetPosition(dragState.widgetId, Math.max(0, nx), Math.max(0, ny));
      } else if (dragState.type === 'resize' && dragState.widgetId && dragState.resizeDir) {
        const dir = dragState.resizeDir;
        let nx = dragState.widgetStartX;
        let ny = dragState.widgetStartY;
        let nw = dragState.widgetStartW;
        let nh = dragState.widgetStartH;

        if (dir.includes('e')) nw = Math.max(10, dragState.widgetStartW + dx);
        if (dir.includes('w')) { nw = Math.max(10, dragState.widgetStartW - dx); nx = dragState.widgetStartX + dx; }
        if (dir.includes('s')) nh = Math.max(10, dragState.widgetStartH + dy);
        if (dir.includes('n')) { nh = Math.max(10, dragState.widgetStartH - dy); ny = dragState.widgetStartY + dy; }

        if (snapToGrid) {
          nw = Math.round(nw / gridSize) * gridSize;
          nh = Math.round(nh / gridSize) * gridSize;
          nx = Math.round(nx / gridSize) * gridSize;
          ny = Math.round(ny / gridSize) * gridSize;
        }

        updateWidgetPosition(dragState.widgetId, nx, ny);
        updateWidgetSize(dragState.widgetId, nw, nh);
      }
    };

    const handleMouseUp = () => setDragState(null);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, canvasScale, updateWidgetPosition, updateWidgetSize, snapToGrid, gridSize]);

  return (
    <div
      className="canvas-container"
      ref={canvasRef}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onMouseDown={handleCanvasMouseDown}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div
        className="canvas-area"
        style={{
          width: screenWidth,
          height: screenHeight,
          transform: `scale(${canvasScale})`,
          transformOrigin: 'top center',
          backgroundSize: showGrid ? `${gridSize}px ${gridSize}px` : undefined,
        }}
      >
        {widgets.map(widget => (
          <WidgetRenderer
            key={widget.id}
            widget={widget}
            isSelected={selectedIds.includes(widget.id)}
            isPreview={previewMode}
            onMouseDown={widgetMouseDown}
            onClick={widgetClickHandler}
            depth={0}
          />
        ))}
        {widgets.length === 0 && !previewMode && (
          <div className="canvas-empty">
            Drag widgets from the toolbox or click to add
          </div>
        )}
      </div>
      <div className="canvas-status">
        {screenWidth}x{screenHeight} | Scale: {Math.round(canvasScale * 100)}%
      </div>
    </div>
  );
}

interface WidgetRendererProps {
  widget: LvglWidgetNode;
  isSelected: boolean;
  isPreview: boolean;
  onMouseDown: (id: string, e: MouseEvent) => void;
  onClick: (id: string, e: MouseEvent) => void;
  depth: number;
}

function WidgetRenderer({ widget, isSelected, isPreview, onMouseDown, onClick, depth }: WidgetRendererProps) {
  const def = WIDGET_DEFINITIONS[widget.type];

  return (
    <div
      className={`canvas-widget ${isSelected ? 'selected' : ''} ${isPreview ? 'preview' : ''}`}
      style={{
        left: widget.area.x,
        top: widget.area.y,
        width: widget.area.w,
        height: widget.area.h,
        zIndex: depth + 1,
      }}
      onMouseDown={e => onMouseDown(widget.id, e)}
      onClick={e => onClick(widget.id, e)}
    >
      <div className="canvas-widget-content" style={{
        ...getWidgetPreviewStyle(widget),
      }}>
        {renderWidgetPreview(widget)}
      </div>
      {isSelected && !isPreview && (
        <>
          <div className="widget-label">{def?.label || widget.type}</div>
          {['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'].map(dir => (
            <div key={dir} className={`resize-handle handle-${dir}`} data-dir={dir} />
          ))}
        </>
      )}
      {widget.children.length > 0 && (
        <div className="canvas-widget-children">
          {widget.children.map(child => (
            <WidgetRenderer
              key={child.id}
              widget={child}
              isSelected={isSelected}
              isPreview={isPreview}
              onMouseDown={onMouseDown}
              onClick={onClick}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function findWidget(widgets: LvglWidgetNode[], id: string): LvglWidgetNode | undefined {
  for (const w of widgets) {
    if (w.id === id) return w;
    const found = findWidget(w.children, id);
    if (found) return found;
  }
  return undefined;
}

function renderWidgetPreview(widget: LvglWidgetNode): React.ReactNode {
  const props = widget.properties;
  switch (widget.type) {
    case 'lv_btn':
      return <span style={{ color: 'white', fontWeight: 600 }}>{String(props.text || 'Button')}</span>;
    case 'lv_label':
      return <span style={{ color: 'white' }}>{String(props.text || 'Label')}</span>;
    case 'lv_slider':
      return (
        <div className="widget-preview-slider">
          <div className="widget-preview-slider-fill" style={{ width: `${(Number(props.value) || 0) / (Number(props.max) || 100) * 100}%` }} />
          <div className="widget-preview-slider-knob" style={{ left: `${(Number(props.value) || 0) / (Number(props.max) || 100) * 100}%` }} />
        </div>
      );
    case 'lv_bar':
      return (
        <div className="widget-preview-bar">
          <div className="widget-preview-bar-fill" style={{ width: `${(Number(props.value) || 0) / (Number(props.max) || 100) * 100}%` }} />
        </div>
      );
    case 'lv_switch':
      return (
        <div className={`widget-preview-switch ${props.checked ? 'on' : ''}`}>
          <div className="widget-preview-switch-knob" />
        </div>
      );
    case 'lv_checkbox':
      return (
        <div className="widget-preview-checkbox">
          <span className={`checkbox-box ${props.checked ? 'checked' : ''}`}>
            {props.checked ? '✓' : ''}
          </span>
          <span>{String(props.text || 'Checkbox')}</span>
        </div>
      );
    case 'lv_dropdown':
      return (
        <div className="widget-preview-dropdown">
          <span>Option {Number(props.selected) + 1}</span>
          <span className="dropdown-arrow">▾</span>
        </div>
      );
    case 'lv_textarea':
      return (
        <div className="widget-preview-textarea">
          {String(props.text || props.placeholder || '')}
        </div>
      );
    case 'lv_led':
      return <div className="widget-preview-led" style={{ backgroundColor: String(props.onColor || '#ff0000'), opacity: (Number(props.brightness) || 255) / 255 }} />;
    case 'lv_arc':
      return <div className="widget-preview-arc" />;
    case 'lv_spinner':
      return <div className="widget-preview-spinner" />;
    case 'lv_chart':
      return <div className="widget-preview-chart">📊 Chart</div>;
    case 'lv_table':
      return <div className="widget-preview-table">⊟ Table</div>;
    case 'lv_img':
      return <div className="widget-preview-img">🖼</div>;
    case 'lv_scale':
      return <div className="widget-preview-scale">📏</div>;
    case 'lv_gauge':
      return <div className="widget-preview-gauge">🔄</div>;
    default:
      return <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>{widget.type}</span>;
  }
}

function getWidgetPreviewStyle(widget: LvglWidgetNode): React.CSSProperties {
  const s = widget.style;
  const base: React.CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: s.radius ?? 4,
  };

  if (widget.type === 'lv_btn') {
    Object.assign(base, {
      background: s.bgColor || '#89b4fa',
      cursor: 'pointer',
      borderRadius: s.radius ?? 6,
    });
  } else if (widget.type === 'lv_label') {
    Object.assign(base, {
      color: s.textColor || '#cdd6f4',
      textAlign: s.textAlign || 'left',
      justifyContent: s.textAlign === 'center' ? 'center' : s.textAlign === 'right' ? 'flex-end' : 'flex-start',
      padding: '2px 4px',
    });
  } else if (widget.type === 'lv_slider' || widget.type === 'lv_bar') {
    Object.assign(base, {
      background: s.bgColor || 'rgba(255,255,255,0.2)',
      borderRadius: s.radius ?? 10,
      padding: '0 4px',
    });
  } else if (widget.type === 'lv_switch') {
    Object.assign(base, {
      background: s.bgColor || 'rgba(255,255,255,0.3)',
      borderRadius: s.radius ?? 15,
      padding: '2px',
    });
  } else if (widget.type === 'lv_checkbox') {
    Object.assign(base, {
      color: s.textColor || '#cdd6f4',
      justifyContent: 'flex-start',
      gap: 6,
      paddingLeft: 4,
    });
  } else if (widget.type === 'lv_textarea') {
    Object.assign(base, {
      background: s.bgColor || 'rgba(0,0,0,0.3)',
      border: `1px solid ${s.borderColor || 'rgba(255,255,255,0.3)'}`,
      borderRadius: s.radius ?? 4,
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      padding: 6,
      color: s.textColor || '#cdd6f4',
    });
  } else if (widget.type === 'lv_dropdown') {
    Object.assign(base, {
      background: s.bgColor || 'rgba(255,255,255,0.15)',
      borderRadius: s.radius ?? 4,
      justifyContent: 'space-between',
      padding: '0 8px',
      color: s.textColor || '#cdd6f4',
      cursor: 'pointer',
    });
  } else if (widget.type === 'lv_led') {
    Object.assign(base, {
      background: 'transparent',
    });
  } else if (widget.type === 'lv_spinner') {
    Object.assign(base, {
      background: 'transparent',
    });
  } else {
    Object.assign(base, {
      background: s.bgColor || 'rgba(137,180,250,0.15)',
      border: s.borderWidth ? `${s.borderWidth}px solid ${s.borderColor || 'rgba(255,255,255,0.3)'}` : '1px solid rgba(255,255,255,0.1)',
    });
  }

  if (s.bgGradColor) {
    Object.assign(base, {
      background: `linear-gradient(${s.bgGradDir === 'hor' ? 'to right' : 'to bottom'}, ${s.bgColor || '#89b4fa'}, ${s.bgGradColor})`,
    });
  }

  if (s.opacity !== undefined) base.opacity = s.opacity / 255;
  return base;
}
