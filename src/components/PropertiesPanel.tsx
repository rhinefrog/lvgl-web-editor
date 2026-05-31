import { useEditorStore } from '../store/editorStore';
import type { LvglWidgetNode, LvglWidgetProperty, LvglEventHandler } from '../types/lvgl';
import { WIDGET_DEFINITIONS } from '../types/widgetDefinitions';
import { generateCode } from '../codegen';
import { useEffect, useMemo, useState } from 'react';

interface PropertiesPanelProps {
  activeTab: 'properties' | 'code' | 'events';
  onTabChange: (tab: 'properties' | 'code' | 'events') => void;
}

export default function PropertiesPanel({ activeTab, onTabChange }: PropertiesPanelProps) {
  const { widgets, selectedIds, updateWidgetProperty, addWidgetEvent, removeWidgetEvent, screenWidth, screenHeight } = useEditorStore();

  const selectedWidget = useMemo(() => {
    if (selectedIds.length !== 1) return null;
    return findWidgetById(widgets, selectedIds[0]);
  }, [widgets, selectedIds]);

  const code = useMemo(() => {
    return generateCode(widgets, screenWidth, screenHeight);
  }, [widgets, screenWidth, screenHeight]);

  const copyCode = () => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div className="properties-panel">
      <div className="panel-tabs">
        <button className={`panel-tab ${activeTab === 'properties' ? 'active' : ''}`} onClick={() => onTabChange('properties')}>
          Properties
        </button>
        <button className={`panel-tab ${activeTab === 'events' ? 'active' : ''}`} onClick={() => onTabChange('events')}>
          Events
        </button>
        <button className={`panel-tab ${activeTab === 'code' ? 'active' : ''}`} onClick={() => onTabChange('code')}>
          Code
        </button>
      </div>

      <div className="panel-content">
        {activeTab === 'properties' && (
          selectedWidget ? (
            <PropertiesForm widget={selectedWidget} onUpdateProperty={updateWidgetProperty} />
          ) : (
            <div className="panel-empty">Select a widget to edit properties</div>
          )
        )}

        {activeTab === 'events' && (
          selectedWidget ? (
            <EventsForm widget={selectedWidget} onAddEvent={addWidgetEvent} onRemoveEvent={removeWidgetEvent} />
          ) : (
            <div className="panel-empty">Select a widget to manage events</div>
          )
        )}

        {activeTab === 'code' && (
          <div className="code-preview">
            <div className="code-toolbar">
              <button className="code-btn" onClick={copyCode}>📋 Copy</button>
            </div>
            <pre className="code-preview-content">{code}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

function PropertiesForm({ widget, onUpdateProperty }: {
  widget: LvglWidgetNode;
  onUpdateProperty: (id: string, key: string, value: unknown) => void;
}) {
  const def = WIDGET_DEFINITIONS[widget.type];
  if (!def) return <div className="panel-empty">Unknown widget type</div>;

  const categories = [
    { label: 'Basic', props: def.properties.filter(p => p.category === 'basic') },
    { label: 'Widget Specific', props: def.properties.filter(p => p.category === 'specific') },
    { label: 'Style', props: def.properties.filter(p => p.category === 'style') },
  ];

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'Basic': true,
    'Widget Specific': true,
    'Style': false,
  });

  const [widgetId, setWidgetId] = useState(widget.id);

  if (widget.id !== widgetId) {
    setWidgetId(widget.id);
  }

  return (
    <div className="properties-form">
      <div className="properties-header">
        <span className="properties-widget-type">{def.icon} {def.label}</span>
        <span className="properties-widget-id">{widget.id}</span>
      </div>

      {categories.map(cat => cat.props.length > 0 && (
        <div key={cat.label} className="properties-section">
          <div
            className="properties-section-header"
            onClick={() => setExpandedSections(s => ({ ...s, [cat.label]: !s[cat.label] }))}
          >
            {expandedSections[cat.label] ? '▼' : '▶'} {cat.label}
          </div>
          {expandedSections[cat.label] && cat.props.map(prop => (
            <PropertyRow
              key={prop.key}
              prop={prop}
              value={widget.properties[prop.key]}
              onChange={(val) => onUpdateProperty(widget.id, prop.key, val)}
            />
          ))}
        </div>
      ))}

      <div className="properties-section">
        <div
          className="properties-section-header"
          onClick={() => setExpandedSections(s => ({ ...s, 'Advanced': !s['Advanced'] }))}
        >
          {expandedSections['Advanced'] ? '▼' : '▶'} Layout & Position
        </div>
        {expandedSections['Advanced'] && (
          <>
            <PropertyRow prop={{ key: 'x', label: 'X', type: 'number', default: 0, category: 'layout' }} value={widget.area.x} onChange={v => onUpdateProperty(widget.id, '_x', v)} />
            <PropertyRow prop={{ key: 'y', label: 'Y', type: 'number', default: 0, category: 'layout' }} value={widget.area.y} onChange={v => onUpdateProperty(widget.id, '_y', v)} />
            <PropertyRow prop={{ key: 'w', label: 'Width', type: 'number', default: 100, category: 'layout' }} value={widget.area.w} onChange={v => onUpdateProperty(widget.id, '_w', v)} />
            <PropertyRow prop={{ key: 'h', label: 'Height', type: 'number', default: 100, category: 'layout' }} value={widget.area.h} onChange={v => onUpdateProperty(widget.id, '_h', v)} />
          </>
        )}
      </div>
    </div>
  );
}

function PropertyRow({ prop, value, onChange }: {
  prop: LvglWidgetProperty;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const [localValue, setLocalValue] = useState(value);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setLocalValue(value);
  }, [value, focused]);

  const handleChange = (newVal: unknown) => {
    setLocalValue(newVal);
    onChange(newVal);
  };

  switch (prop.type) {
    case 'text':
    case 'textarea':
      return (
        <div className="property-row">
          <label className="property-label">{prop.label}</label>
          {prop.type === 'textarea' ? (
            <textarea
              className="property-input property-textarea"
              value={String(localValue ?? '')}
              onChange={e => handleChange(e.target.value)}
              rows={3}
            />
          ) : (
            <input
              className="property-input"
              type="text"
              value={String(localValue ?? '')}
              onChange={e => handleChange(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
            />
          )}
        </div>
      );
    case 'number':
      return (
        <div className="property-row">
          <label className="property-label">{prop.label}</label>
          <input
            className="property-input"
            type="number"
            value={Number(localValue ?? 0)}
            min={prop.min}
            max={prop.max}
            step={prop.step}
            onChange={e => handleChange(Number(e.target.value))}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
        </div>
      );
    case 'color':
      return (
        <div className="property-row">
          <label className="property-label">{prop.label}</label>
          <div className="property-color-row">
            <input
              className="property-color-input"
              type="color"
              value={String(localValue ?? '#000000')}
              onChange={e => handleChange(e.target.value)}
            />
            <input
              className="property-input property-color-text"
              type="text"
              value={String(localValue ?? '#000000')}
              onChange={e => handleChange(e.target.value)}
            />
          </div>
        </div>
      );
    case 'boolean':
      return (
        <div className="property-row">
          <label className="property-label">{prop.label}</label>
          <input
            className="property-checkbox"
            type="checkbox"
            checked={Boolean(localValue)}
            onChange={e => handleChange(e.target.checked)}
          />
        </div>
      );
    case 'select':
      return (
        <div className="property-row">
          <label className="property-label">{prop.label}</label>
          <select
            className="property-input property-select"
            value={String(localValue ?? '')}
            onChange={e => handleChange(e.target.value)}
          >
            {(prop.options || []).map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      );
    default:
      return null;
  }
}

function EventsForm({ widget, onAddEvent, onRemoveEvent }: {
  widget: LvglWidgetNode;
  onAddEvent: (id: string, event: LvglEventHandler) => void;
  onRemoveEvent: (id: string, eventName: string) => void;
}) {
  const [newEvent, setNewEvent] = useState('');
  const [newCode, setNewCode] = useState('// TODO: Add event handler code');

  const eventOptions = [
    'clicked', 'pressed', 'released', 'short_clicked', 'long_pressed',
    'long_pressed_repeat', 'double_clicked', 'value_changed', 'ready',
    'focused', 'defocused', 'scroll_begin', 'scroll_end', 'size_changed',
  ];

  return (
    <div className="events-form">
      {widget.events.length === 0 && (
        <div className="panel-empty">No events defined</div>
      )}
      {widget.events.map((evt, i) => (
        <div key={i} className="event-row">
          <div className="event-header">
            <span className="event-name">{evt.event}</span>
            {evt.name && <span className="event-fn">({evt.name})</span>}
            <button className="event-remove" onClick={() => onRemoveEvent(widget.id, evt.event)}>✕</button>
          </div>
          <pre className="event-code">{evt.code}</pre>
        </div>
      ))}
      <div className="event-add">
        <div className="event-add-header">Add Event</div>
        <select className="property-input" value={newEvent} onChange={e => setNewEvent(e.target.value)}>
          <option value="">Select event...</option>
          {eventOptions.filter(ev => !widget.events.find(e => e.event === ev)).map(evt => (
            <option key={evt} value={evt}>{evt}</option>
          ))}
        </select>
        <textarea
          className="property-input property-textarea code-input"
          value={newCode}
          onChange={e => setNewCode(e.target.value)}
          rows={6}
        />
        <button
          className="event-add-btn"
          disabled={!newEvent}
          onClick={() => {
            if (newEvent) {
              onAddEvent(widget.id, { event: newEvent as LvglEventHandler['event'], code: newCode, name: `${widget.id}_${newEvent}` });
              setNewCode('// TODO: Add event handler code');
            }
          }}
        >
          + Add Event Handler
        </button>
      </div>
    </div>
  );
}

function findWidgetById(widgets: LvglWidgetNode[], id: string): LvglWidgetNode | undefined {
  for (const w of widgets) {
    if (w.id === id) return w;
    const found = findWidgetById(w.children, id);
    if (found) return found;
  }
  return undefined;
}
