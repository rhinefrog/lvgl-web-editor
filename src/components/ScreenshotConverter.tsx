import { useCallback, useRef, useState } from 'react';
import { useEditorStore } from '../store/editorStore';
import type { LvglWidgetType, LvglArea } from '../types/lvgl';

interface DetectedRegion {
  area: LvglArea;
  confidence: number;
  type: LvglWidgetType;
  label: string;
  color: string;
}

export default function ScreenshotConverter() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<string | null>(null);
  const [regions, setRegions] = useState<DetectedRegion[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [threshold, setThreshold] = useState(30);
  const [minSize, setMinSize] = useState(20);
  const [activeTool, setActiveTool] = useState<'select' | 'rect' | 'label' | 'btn'>('select');
  const [drawing, setDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [drawEnd, setDrawEnd] = useState<{ x: number; y: number } | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [pendingRegion, setPendingRegion] = useState<LvglArea | null>(null);

  const addWidget = useEditorStore(s => s.addWidget);
  const screenWidth = useEditorStore(s => s.screenWidth);
  const screenHeight = useEditorStore(s => s.screenHeight);

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImage(ev.target?.result as string);
      setRegions([]);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }, []);

  const detectRegions = useCallback(() => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;

    setAnalyzing(true);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const w = canvas.width;
    const h = canvas.height;

    const visited = new Uint8Array(w * h);
    const detected: DetectedRegion[] = [];

    const floodFillRect = (startX: number, startY: number) => {
      const stack: [number, number][] = [[startX, startY]];
      let minX = startX, maxX = startX, minY = startY, maxY = startY;
      const baseIdx = (startY * w + startX) * 4;
      const baseR = data[baseIdx], baseG = data[baseIdx + 1], baseB = data[baseIdx + 2];
      const thresholdVal = threshold;
      const thresh2 = thresholdVal * 3;

      while (stack.length > 0) {
        const [cx, cy] = stack.pop()!;
        const idx = cy * w + cx;
        if (visited[idx]) continue;
        visited[idx] = 1;

        const pi = idx * 4;
        const dr = Math.abs(data[pi] - baseR);
        const dg = Math.abs(data[pi + 1] - baseG);
        const db = Math.abs(data[pi + 2] - baseB);
        if (dr + dg + db > thresh2) continue;

        minX = Math.min(minX, cx);
        maxX = Math.max(maxX, cx);
        minY = Math.min(minY, cy);
        maxY = Math.max(maxY, cy);

        for (const [nx, ny] of [[cx - 1, cy], [cx + 1, cy], [cx, cy - 1], [cx, cy + 1]]) {
          if (nx >= 0 && nx < w && ny >= 0 && ny < h && !visited[ny * w + nx]) {
            stack.push([nx, ny]);
          }
        }
      }

      const rw = maxX - minX + 1;
      const rh = maxY - minY + 1;
      if (rw < minSize || rh < minSize) return null;

      return { x: minX, y: minY, w: rw, h: rh };
    };

    for (let y = 0; y < h; y += Math.max(2, Math.floor(minSize / 2))) {
      for (let x = 0; x < w; x += Math.max(2, Math.floor(minSize / 2))) {
        if (visited[y * w + x]) continue;
        const rect = floodFillRect(x, y);
        if (rect) {
          const nw = rect.w / w;
          const nh = rect.h / h;

          let type: LvglWidgetType = 'lv_obj';
          let label = 'Container';

          if (nw > 0.1 && nh > 0.05 && nh < 0.2) {
            type = 'lv_btn';
            label = 'Button';
          } else if (nh < 0.15 && nw > 0.15) {
            type = 'lv_label';
            label = 'Label';
          } else if (nw > 0.2 && nh < 0.08) {
            type = 'lv_slider';
            label = 'Slider';
          } else if (nw > 0.2 && nh < 0.1) {
            type = 'lv_bar';
            label = 'Bar';
          } else if (nw < 0.1 && nh < 0.1) {
            type = 'lv_led';
            label = 'LED';
          }

          detected.push({
            area: { x, y, w: rect.w, h: rect.h },
            confidence: 0.5,
            type,
            label,
            color: `hsl(${(detected.length * 47) % 360}, 70%, 60%)`,
          });
        }
      }
    }

    detected.sort((a, b) => b.area.w * b.area.h - a.area.w * a.area.h);
    const filtered = filterOverlapping(detected);
    setRegions(filtered);
    drawRegions(filtered);
    setAnalyzing(false);
  }, [threshold, minSize]);

  const filterOverlapping = (regions: DetectedRegion[]): DetectedRegion[] => {
    const result: DetectedRegion[] = [];
    for (const r of regions) {
      let overlapped = false;
      for (const existing of result) {
        const ox = Math.max(r.area.x, existing.area.x);
        const oy = Math.max(r.area.y, existing.area.y);
        const ow = Math.min(r.area.x + r.area.w, existing.area.x + existing.area.w) - ox;
        const oh = Math.min(r.area.y + r.area.h, existing.area.y + existing.area.h) - oy;
        if (ow > 0 && oh > 0) {
          const overlapRatio = (ow * oh) / (r.area.w * r.area.h);
          if (overlapRatio > 0.5) {
            overlapped = true;
            break;
          }
        }
      }
      if (!overlapped) result.push(r);
    }
    return result;
  };

  const drawRegions = (detected: DetectedRegion[]) => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);

    for (const r of detected) {
      ctx.strokeStyle = r.color;
      ctx.lineWidth = 2;
      ctx.strokeRect(r.area.x, r.area.y, r.area.w, r.area.h);
      ctx.fillStyle = r.color.replace(')', ', 0.15)').replace('hsl', 'hsla');
      ctx.fillRect(r.area.x, r.area.y, r.area.w, r.area.h);
      ctx.fillStyle = r.color;
      ctx.font = '11px sans-serif';
      ctx.fillText(`${r.label} (${Math.round(r.confidence * 100)}%)`, r.area.x + 4, r.area.y - 4);
    }
  };

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === 'select') {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const mx = (e.clientX - rect.left) * scaleX;
      const my = (e.clientY - rect.top) * scaleY;

      for (const r of regions) {
        if (mx >= r.area.x && mx <= r.area.x + r.area.w &&
            my >= r.area.y && my <= r.area.y + r.area.h) {
          const sx = (r.area.x / canvas.width) * screenWidth;
          const sy = (r.area.y / canvas.height) * screenHeight;
          addWidget(r.type, Math.round(sx), Math.round(sy));
          break;
        }
      }
      return;
    }

    if (activeTool === 'rect' || activeTool === 'label' || activeTool === 'btn') {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const mx = (e.clientX - rect.left) * scaleX;
      const my = (e.clientY - rect.top) * scaleY;

      if (!drawing) {
        setDrawing(true);
        setDrawStart({ x: mx, y: my });
        setDrawEnd({ x: mx, y: my });
      }
    }
  }, [activeTool, regions, addWidget, screenWidth, screenHeight, drawing]);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing || !drawStart) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;
    setDrawEnd({ x: mx, y: my });

    const ctx = canvas.getContext('2d');
    const img = imgRef.current;
    if (!ctx || !img) return;
    ctx.drawImage(img, 0, 0);
    drawRegions(regions);

    const x = Math.min(drawStart.x, mx);
    const y = Math.min(drawStart.y, my);
    const w = Math.abs(mx - drawStart.x);
    const h = Math.abs(my - drawStart.y);
    ctx.strokeStyle = '#f5c2e7';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(x, y, w, h);
    ctx.setLineDash([]);
  }, [drawing, drawStart, regions]);

  const handleCanvasMouseUp = useCallback(() => {
    if (!drawing || !drawStart || !drawEnd) return;
    setDrawing(false);
    const x = Math.min(drawStart.x, drawEnd.x);
    const y = Math.min(drawStart.y, drawEnd.y);
    const w = Math.abs(drawEnd.x - drawStart.x);
    const h = Math.abs(drawEnd.y - drawStart.y);

    if (w < 10 || h < 10) {
      setDrawStart(null);
      setDrawEnd(null);
      return;
    }

    if (activeTool === 'rect' || activeTool === 'label' || activeTool === 'btn') {
      setPendingRegion({ x, y, w, h });
      setShowNameDialog(true);
    }

    setDrawStart(null);
    setDrawEnd(null);
  }, [drawing, drawStart, drawEnd, activeTool]);

  const confirmRegion = () => {
    if (!pendingRegion || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const sx = Math.round((pendingRegion.x / canvas.width) * screenWidth);
    const sy = Math.round((pendingRegion.y / canvas.height) * screenHeight);

    let type: LvglWidgetType = 'lv_obj';
    if (activeTool === 'label') type = 'lv_label';
    else if (activeTool === 'btn') type = 'lv_btn';

    addWidget(type, sx, sy);
    setShowNameDialog(false);
    setPendingRegion(null);

    const newRegion: DetectedRegion = {
      area: pendingRegion,
      confidence: 1,
      type,
      label: nameInput || type.replace('lv_', ''),
      color: `hsl(${(regions.length * 47 + 120) % 360}, 70%, 60%)`,
    };
    setRegions(prev => [...prev, newRegion]);
    drawRegions([...regions, newRegion]);
    setNameInput('');
  };

  const addAllToCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const sorted = [...regions].sort((a, b) => a.area.y - b.area.y);
    for (const r of sorted) {
      const sx = Math.round((r.area.x / canvas.width) * screenWidth);
      const sy = Math.round((r.area.y / canvas.height) * screenHeight);
      addWidget(r.type, sx, sy);
    }
  };

  return (
    <div className="screenshot-converter">
      <div className="screenshot-converter-toolbar">
        <span className="converter-title">📷 Screenshot to LVGL</span>
        <button className="toolbar-btn" onClick={() => fileRef.current?.click()}>
          📁 Open Image
        </button>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />

        {image && (
          <>
            <span className="toolbar-divider">|</span>
            <button className="toolbar-btn" onClick={detectRegions} disabled={analyzing}>
              {analyzing ? '🔍 Analyzing...' : '🔍 Auto Detect'}
            </button>
            <span className="toolbar-divider">|</span>
            <span className="tool-label">Threshold:</span>
            <input className="toolbar-input slider-input" type="range" min={5} max={100} value={threshold} onChange={e => setThreshold(Number(e.target.value))} />
            <span className="tool-value">{threshold}</span>
            <span className="tool-label">Min Size:</span>
            <input className="toolbar-input slider-input" type="range" min={5} max={100} value={minSize} onChange={e => setMinSize(Number(e.target.value))} />
            <span className="tool-value">{minSize}</span>
            <span className="toolbar-divider">|</span>
            <button className={`toolbar-btn ${activeTool === 'select' ? 'active' : ''}`} onClick={() => setActiveTool('select')}>👆 Select</button>
            <button className={`toolbar-btn ${activeTool === 'rect' ? 'active' : ''}`} onClick={() => setActiveTool('rect')}>⬜ Rect</button>
            <button className={`toolbar-btn ${activeTool === 'label' ? 'active' : ''}`} onClick={() => setActiveTool('label')}>A Label</button>
            <button className={`toolbar-btn ${activeTool === 'btn' ? 'active' : ''}`} onClick={() => setActiveTool('btn')}>▣ Button</button>
            <span className="toolbar-divider">|</span>
            <button className="toolbar-btn" onClick={addAllToCanvas} disabled={regions.length === 0}>
              ➕ Add All to Canvas
            </button>
          </>
        )}
      </div>

      <div className="screenshot-canvas-area">
        {!image ? (
          <div className="screenshot-dropzone" onClick={() => fileRef.current?.click()}>
            <div className="dropzone-icon">📷</div>
            <div className="dropzone-text">Drop a screenshot here or click to browse</div>
            <div className="dropzone-hint">PNG, JPG, WEBP</div>
          </div>
        ) : (
          <div className="screenshot-image-wrapper">
            <canvas
              ref={canvasRef}
              className="screenshot-canvas"
              onClick={handleCanvasClick}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
            />
            <img
              ref={imgRef}
              src={image}
              alt="Screenshot"
              style={{ display: 'none' }}
              onLoad={() => {
                const canvas = canvasRef.current;
                const img = imgRef.current;
                if (canvas && img) {
                  canvas.width = img.naturalWidth;
                  canvas.height = img.naturalHeight;
                  const ctx = canvas.getContext('2d');
                  if (ctx) ctx.drawImage(img, 0, 0);
                }
              }}
            />
            {regions.length > 0 && (
              <div className="screenshot-stats">
                {regions.length} regions detected — click a region to add, or draw new ones
              </div>
            )}
          </div>
        )}
      </div>

      {showNameDialog && (
        <div className="modal-overlay" onClick={() => setShowNameDialog(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">Name this region</div>
            <input
              className="modal-input"
              type="text"
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              placeholder={activeTool === 'label' ? 'Label text...' : 'Region name...'}
              autoFocus
            />
            <div className="modal-buttons">
              <button className="toolbar-btn" onClick={() => setShowNameDialog(false)}>Cancel</button>
              <button className="toolbar-btn active" onClick={confirmRegion}>Add to Canvas</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
