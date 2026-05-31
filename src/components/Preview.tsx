import { useEffect, useRef, useState } from 'react';

interface PreviewProps {
  width: number;
  height: number;
  visible: boolean;
}

export default function Preview({ width, height, visible }: PreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    if (!visible) return;

    setStatus('loading');

    const loadWasm = async () => {
      try {
        await WebAssembly.compileStreaming(
          fetch('/lvgl_preview.wasm')
        );
        setStatus('ready');
      } catch (err) {
        console.warn('WASM preview not available:', err);
        setStatus('error');
      }
    };

    loadWasm();
  }, [visible]);

  if (!visible) return null;

  if (status === 'loading') {
    return (
      <div className="preview-container">
        <div className="preview-loading">
          <div className="preview-spinner" />
          <span>Loading LVGL WASM...</span>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="preview-container">
        <div className="preview-error">
          <div className="preview-error-icon">⚠</div>
          <div className="preview-error-title">WASM Preview Not Available</div>
          <div className="preview-error-text">
            Build the LVGL WASM module first:<br />
            <code>cd lvgl-wasm && ./build.sh</code>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="preview-container">
      <canvas
        ref={canvasRef}
        id="lvgl-canvas"
        width={width}
        height={height}
        className="preview-canvas"
        style={{ width, height }}
      />
      <div className="preview-overlay">
        <span className="preview-badge">LIVE</span>
        <span className="preview-size">{width}x{height}</span>
      </div>
    </div>
  );
}
