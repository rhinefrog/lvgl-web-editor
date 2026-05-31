import { useState } from 'react';
import Toolbox from './components/Toolbox';
import Canvas from './components/Canvas';
import PropertiesPanel from './components/PropertiesPanel';
import Toolbar from './components/Toolbar';
import ScreenshotConverter from './components/ScreenshotConverter';
import './App.css';
import './components/styles.css';

export default function App() {
  const [activeTab, setActiveTab] = useState<'properties' | 'code' | 'events'>('properties');
  const [showToolbox, setShowToolbox] = useState(true);
  const [showPanel, setShowPanel] = useState(true);
  const [mode, setMode] = useState<'editor' | 'screenshot'>('editor');

  return (
    <div className="app">
      <Toolbar
        showToolbox={showToolbox}
        showPanel={showPanel}
        onToggleToolbox={() => setShowToolbox(v => !v)}
        onTogglePanel={() => setShowPanel(v => !v)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        mode={mode}
        onModeChange={setMode}
      />
      {mode === 'editor' ? (
        <div className="app-body">
          {showToolbox && <Toolbox />}
          <Canvas />
          {showPanel && (
            <PropertiesPanel
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          )}
        </div>
      ) : (
        <ScreenshotConverter />
      )}
    </div>
  );
}
