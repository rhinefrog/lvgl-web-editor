import { useRef, useState } from 'react';
import { useEditorStore } from '../store/editorStore';
import { generateCode } from '../codegen';

interface ToolbarProps {
  showToolbox: boolean;
  showPanel: boolean;
  onToggleToolbox: () => void;
  onTogglePanel: () => void;
  activeTab: string;
  onTabChange: (tab: 'properties' | 'code' | 'events') => void;
  mode: 'editor' | 'screenshot';
  onModeChange: (mode: 'editor' | 'screenshot') => void;
}

export default function Toolbar({ showToolbox, showPanel, onToggleToolbox, onTogglePanel, activeTab, onTabChange, mode, onModeChange }: ToolbarProps) {
  const { widgets, screenWidth, screenHeight, setScreenSize, clearProject, exportProject, importProject } = useEditorStore();
  const importRef = useRef<HTMLInputElement>(null);
  const [showScreenDialog, setShowScreenDialog] = useState(false);
  const [sw, setSw] = useState(screenWidth.toString());
  const [sh, setSh] = useState(screenHeight.toString());
  const [exporting, setExporting] = useState(false);
  const [showBoardDialog, setShowBoardDialog] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState('waveshare_rp2350_touch_lcd_7');
  const [useFreeRtos, setUseFreeRtos] = useState(false);

  const downloadFile = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCCode = () => {
    const code = generateCode(widgets, screenWidth, screenHeight);
    downloadFile(code, 'lvgl_ui.c', 'text/plain');
  };

  const handleExportProject = () => {
    const json = exportProject();
    downloadFile(json, 'lvgl_project.json', 'application/json');
  };

  const handleImportProject = () => {
    importRef.current?.click();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result;
      if (typeof text === 'string') {
        if (!importProject(text)) {
          alert('Invalid project file');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleExportPicoProject = async () => {
    setExporting(true);
    try {
      const { generatePicoProject } = await import('../codegen/picoProject');
      const zip = generatePicoProject(widgets, screenWidth, screenHeight, selectedBoard, useFreeRtos);
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lvgl_${selectedBoard}_project.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to generate project');
    }
    setExporting(false);
    setShowBoardDialog(false);
  };

  return (
    <div className="toolbar">
      <div className="toolbar-left">
        <span className="toolbar-brand">LVGL Editor</span>
        <span className="toolbar-divider">|</span>
        <button
          className={`toolbar-btn ${mode === 'editor' ? 'active' : ''}`}
          onClick={() => onModeChange('editor')}
          title="Editor Mode"
        >
          ✏️ Editor
        </button>
        <button
          className={`toolbar-btn ${mode === 'screenshot' ? 'active' : ''}`}
          onClick={() => onModeChange('screenshot')}
          title="Screenshot to LVGL"
        >
          📷 Screenshot
        </button>
        <span className="toolbar-divider">|</span>
        <button
          className={`toolbar-btn ${showToolbox ? 'active' : ''}`}
          onClick={onToggleToolbox}
          title="Toggle Toolbox"
        >
          📦
        </button>
        <button
          className={`toolbar-btn ${showPanel ? 'active' : ''}`}
          onClick={onTogglePanel}
          title="Toggle Properties"
        >
          ⚙
        </button>
        <span className="toolbar-divider">|</span>
        <button
          className="toolbar-btn"
          onClick={() => setShowScreenDialog(v => !v)}
          title="Screen Settings"
        >
          📐 {screenWidth}x{screenHeight}
        </button>
        {showScreenDialog && (
          <div className="screen-dialog">
            <label>W: <input type="number" value={sw} onChange={e => setSw(e.target.value)} className="toolbar-input" /></label>
            <label>H: <input type="number" value={sh} onChange={e => setSh(e.target.value)} className="toolbar-input" /></label>
            <button className="toolbar-btn" onClick={() => { setScreenSize(Number(sw), Number(sh)); setShowScreenDialog(false); }}>Apply</button>
            <div className="screen-presets">
              {[
                [320, 240], [480, 320], [640, 480], [800, 480],
                [128, 128], [240, 240], [240, 135], [320, 480],
              ].map(([w, h]) => (
                <button key={`${w}x${h}`} className="toolbar-btn preset-btn" onClick={() => { setScreenSize(w, h); setSw(String(w)); setSh(String(h)); setShowScreenDialog(false); }}>
                  {w}x{h}
                </button>
              ))}
            </div>
          </div>
        )}
        <span className="toolbar-divider">|</span>
        <button
          className={`toolbar-btn ${activeTab === 'properties' ? 'active' : ''}`}
          onClick={() => onTabChange('properties')}
        >
          Properties
        </button>
        <button
          className={`toolbar-btn ${activeTab === 'code' ? 'active' : ''}`}
          onClick={() => onTabChange('code')}
        >
          Code
        </button>
        <button
          className={`toolbar-btn ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => onTabChange('events')}
        >
          Events
        </button>
      </div>
      <div className="toolbar-right">
        <input ref={importRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleImportFile} />
        <button className="toolbar-btn" onClick={handleImportProject} title="Import Project">
          📂 Open
        </button>
        <button className="toolbar-btn" onClick={handleExportProject} title="Export Project">
          💾 Save
        </button>
        <span className="toolbar-divider">|</span>
        <button className="toolbar-btn" onClick={handleExportCCode} title="Export as LVGL C code">
          📥 C Code
        </button>
        <button className="toolbar-btn" onClick={() => setShowBoardDialog(v => !v)} disabled={exporting} title="Export Pico SDK project">
          {exporting ? '⏳' : '🎯'} Pico SDK
        </button>
        {showBoardDialog && (
          <div className="board-dialog">
            <select value={selectedBoard} onChange={e => setSelectedBoard(e.target.value)} className="toolbar-select">
              <option value="waveshare_rp2350_touch_lcd_7">Waveshare RP2350 7" (800x480)</option>
              <option value="waveshare_rp2350_touch_lcd_2_8c">Waveshare RP2350 2.8C (480x480)</option>
              <option value="waveshare_rp2350_touch_lcd_4">Waveshare RP2350 4" (480x480)</option>
              <option value="waveshare_rp2350_touch_lcd_generic">Generic RP2350 (480x320 SPI)</option>
            </select>
            <label className="toolbar-checkbox-label">
              <input type="checkbox" checked={useFreeRtos} onChange={e => setUseFreeRtos(e.target.checked)} />
              FreeRTOS
            </label>
            <button className="toolbar-btn" onClick={handleExportPicoProject}>Export</button>
          </div>
        )}
        <span className="toolbar-divider">|</span>
        <button className="toolbar-btn" onClick={clearProject} title="Clear All">
          🗑
        </button>
      </div>
    </div>
  );
}
