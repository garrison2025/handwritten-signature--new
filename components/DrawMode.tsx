
import React, { useRef, useState, useEffect } from 'react';
import { Download, Trash2, Undo2, Redo2, PenTool, Edit3, Play, Pause, Grid3X3, AlignJustify, Square, Copy, ImagePlus, Clapperboard, FolderHeart } from 'lucide-react';
import { SignatureColor, PenStyle, Point, BackgroundPattern, Stroke } from '../types';
import { trimCanvas, getSvgPathFromStroke } from '../utils';
import useLocalStorage from '../hooks/useLocalStorage';
import { getStroke } from 'perfect-freehand';

interface DrawModeProps {
  color: SignatureColor;
  isVisible: boolean;
  onShowToast: (message: string, type: 'success' | 'info') => void;
  onSignDocument: (signatureData: string) => void;
  // Lifted State
  strokes: Stroke[];
  onStrokesChange: (strokes: Stroke[]) => void;
  onSaveToGallery: () => void;
}

const DrawMode: React.FC<DrawModeProps> = ({ 
  color, 
  isVisible, 
  onShowToast, 
  onSignDocument,
  strokes,
  onStrokesChange,
  onSaveToGallery
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  
  // Persist tools locally (user preference), but strokes are passed in
  const [baseWidth, setBaseWidth] = useLocalStorage<number>('sc_draw_width', 2.5);
  const [penStyle, setPenStyle] = useLocalStorage<PenStyle>('sc_draw_pen', 'fountain');
  const [bgPattern, setBgPattern] = useLocalStorage<BackgroundPattern>('sc_draw_bg', 'grid');
  
  // Internal history management
  // We initialize history with the incoming strokes.
  // Note: If strokes change externally (e.g. loaded from gallery), we must reset history.
  const [history, setHistory] = useState<Stroke[][]>([strokes]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(0);

  // Sync history when strokes prop changes significantly (external load)
  // We simple check if the current strokes match what we have in history.
  useEffect(() => {
    // If strokes is empty and history is not empty (cleared externally) OR
    // strokes is not empty and different from current history head (loaded externally)
    const currentHead = history[currentHistoryIndex];
    if (strokes !== currentHead) {
        setHistory([strokes]);
        setCurrentHistoryIndex(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [strokes]);

  const [showSaveOptions, setShowSaveOptions] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Refs for active drawing
  const currentStroke = useRef<Point[]>([]);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const preventDefault = (e: TouchEvent) => {
        if (e.target === canvas) {
            e.preventDefault();
        }
    };

    document.addEventListener('touchmove', preventDefault, { passive: false });
    document.body.style.overscrollBehavior = 'none';

    return () => {
        document.removeEventListener('touchmove', preventDefault);
        document.body.style.overscrollBehavior = 'auto';
    };
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;
    const setupCanvas = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;
      
      const rect = container.getBoundingClientRect();
      if (rect.width === 0) return;

      const dpr = window.devicePixelRatio || 1;
      const targetHeight = rect.height;

      if (canvas.width !== rect.width * dpr || canvas.height !== targetHeight * dpr) {
          canvas.width = rect.width * dpr;
          canvas.height = targetHeight * dpr;
          canvas.style.width = '100%'; 
          canvas.style.height = '100%';
      }

      if (!isPlaying) {
        renderCanvas();
      }
    };
    setupCanvas();

    let timeoutId: ReturnType<typeof setTimeout>;
    const handleResize = () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(setupCanvas, 100);
    };
    window.addEventListener('resize', handleResize);
    return () => {
        window.removeEventListener('resize', handleResize);
        clearTimeout(timeoutId);
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isVisible, strokes, color, isPlaying]);

  useEffect(() => {
      if (!isVisible) return;
      const handleKeyDown = (e: KeyboardEvent) => {
          if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
              e.preventDefault();
              if (e.shiftKey) {
                  redo();
              } else {
                  undo();
              }
          }
          if ((e.ctrlKey || e.metaKey) && (e.key === 'y')) {
             e.preventDefault();
             redo();
          }
      };
      
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, strokes, currentHistoryIndex, history]);

  const startReplay = () => {
      if (!Array.isArray(strokes) || strokes.length === 0 || isPlaying) return;
      setIsPlaying(true);
      
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!ctx || !canvas) return;

      const dpr = window.devicePixelRatio || 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.scale(dpr, dpr);

      let strokeIdx = 0;
      let pointIdx = 1;
      
      const animate = () => {
          if (strokeIdx >= strokes.length) {
              setIsPlaying(false);
              ctx.setTransform(1, 0, 0, 1, 0, 0); 
              renderCanvas(); 
              return;
          }

          const stroke = strokes[strokeIdx];
          
          if (stroke && stroke.points && pointIdx < stroke.points.length) {
              const partialPoints = stroke.points.slice(0, pointIdx + 1);
              
              if (stroke.style === 'fountain') {
                  const outlinePoints = getStroke(partialPoints, {
                      size: stroke.baseWidth * 3,
                      thinning: 0.5,
                      smoothing: 0.5,
                      streamline: 0.5,
                  });
                  const pathData = getSvgPathFromStroke(outlinePoints);
                  const path = new Path2D(pathData);
                  ctx.fillStyle = stroke.color;
                  ctx.fill(path);
              } else {
                   ctx.beginPath();
                   ctx.lineCap = 'round';
                   ctx.lineJoin = 'round';
                   ctx.strokeStyle = stroke.color;
                   ctx.lineWidth = stroke.baseWidth;
                   
                   const p1 = stroke.points[pointIdx-1];
                   const p2 = stroke.points[pointIdx];
                   ctx.moveTo(p1.x, p1.y);
                   ctx.lineTo(p2.x, p2.y);
                   ctx.stroke();
              }
              pointIdx += 2;
          } else {
              strokeIdx++;
              pointIdx = 1;
          }
          rafRef.current = requestAnimationFrame(animate);
      };
      animate();
  };

  const renderCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const dpr = window.devicePixelRatio || 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);

      if (Array.isArray(strokes)) {
        strokes.forEach(stroke => {
            if (!stroke || !stroke.points || stroke.points.length < 2) return;
            
            if (stroke.style === 'fountain') {
                const outlinePoints = getStroke(stroke.points, {
                    size: stroke.baseWidth * 3,
                    thinning: 0.5,
                    smoothing: 0.5,
                    streamline: 0.5,
                    easing: (t) => t,
                    start: { taper: 0, easing: (t) => t },
                    end: { taper: 0, easing: (t) => t },
                });
                const pathData = getSvgPathFromStroke(outlinePoints);
                const path = new Path2D(pathData);
                ctx.fillStyle = stroke.color;
                ctx.fill(path);
            } else {
                ctx.beginPath();
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.strokeStyle = stroke.color;
                ctx.lineWidth = stroke.baseWidth;
                
                if (stroke.points.length > 0) {
                    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
                    for (let i = 1; i < stroke.points.length - 1; i++) {
                        const p1 = stroke.points[i];
                        const p2 = stroke.points[i + 1];
                        const midX = (p1.x + p2.x) / 2;
                        const midY = (p1.y + p2.y) / 2;
                        ctx.quadraticCurveTo(p1.x, p1.y, midX, midY);
                    }
                    const last = stroke.points[stroke.points.length - 1];
                    ctx.lineTo(last.x, last.y);
                    ctx.stroke();
                }
            }
        });
      }
      ctx.restore();
  };

  const getCoordinates = (event: React.MouseEvent | React.TouchEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0, pressure: 0.5, time: Date.now() };
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY, pressure = 0.5;
    if ('touches' in event && event.touches.length > 0) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
      if ((event.touches[0] as any)['force']) pressure = (event.touches[0] as any)['force'];
    } else if ('changedTouches' in event && event.changedTouches.length > 0) {
      clientX = event.changedTouches[0].clientX;
      clientY = event.changedTouches[0].clientY;
    } else {
      clientX = (event as React.MouseEvent).clientX;
      clientY = (event as React.MouseEvent).clientY;
    }
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
      pressure: pressure,
      time: Date.now()
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (e.cancelable) e.preventDefault();
    setIsPlaying(false);
    setIsDrawing(true);
    const point = getCoordinates(e);
    currentStroke.current = [point];
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    if (e.cancelable) e.preventDefault(); 
    const point = getCoordinates(e);
    if (point.pressure === 0.5) {
        const lastPoint = currentStroke.current[currentStroke.current.length - 1];
        if (lastPoint) {
            const dist = Math.sqrt(Math.pow(point.x - lastPoint.x, 2) + Math.pow(point.y - lastPoint.y, 2));
            point.pressure = Math.max(0.1, Math.min(1, 1 - (dist / 50))); 
        }
    }
    currentStroke.current.push(point);
    renderCanvas();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && currentStroke.current.length > 1) {
        const dpr = window.devicePixelRatio || 1;
        ctx.save();
        ctx.scale(dpr, dpr);
        if (penStyle === 'fountain') {
            const outlinePoints = getStroke(currentStroke.current, {
                size: baseWidth * 3,
                thinning: 0.5,
                smoothing: 0.5,
                streamline: 0.5,
            });
            const pathData = getSvgPathFromStroke(outlinePoints);
            const path = new Path2D(pathData);
            ctx.fillStyle = color;
            ctx.fill(path);
        } else {
            ctx.beginPath();
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.strokeStyle = color;
            ctx.lineWidth = baseWidth;
            const pts = currentStroke.current;
            ctx.moveTo(pts[0].x, pts[0].y);
            for (let i = 1; i < pts.length - 1; i++) {
                 const p1 = pts[i];
                 const p2 = pts[i+1];
                 const midX = (p1.x + p2.x) / 2;
                 const midY = (p1.y + p2.y) / 2;
                 ctx.quadraticCurveTo(p1.x, p1.y, midX, midY);
            }
            ctx.stroke();
        }
        ctx.restore();
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentStroke.current.length > 0) {
        const newStroke: Stroke = {
            points: [...currentStroke.current],
            color: color,
            baseWidth: baseWidth,
            style: penStyle
        };
        // Update history first
        const safeStrokes = Array.isArray(strokes) ? strokes : [];
        const newStrokes = [...safeStrokes.slice(0, currentHistoryIndex + 1), newStroke];
        
        // Update local history
        setHistory(prev => [...prev.slice(0, currentHistoryIndex + 1), newStrokes]);
        setCurrentHistoryIndex(prev => prev + 1);
        
        // Notify parent
        onStrokesChange(newStrokes);
    }
    currentStroke.current = [];
    renderCanvas(); 
  };

  const undo = () => {
      if (currentHistoryIndex >= 0) {
          const newIndex = currentHistoryIndex - 1;
          setCurrentHistoryIndex(newIndex);
          const newStrokes = newIndex >= 0 ? history[newIndex] : [];
          onStrokesChange(newStrokes);
      }
  };

  const redo = () => {
      if (currentHistoryIndex < history.length - 1) {
          const newIndex = currentHistoryIndex + 1;
          setCurrentHistoryIndex(newIndex);
          const newStrokes = history[newIndex];
          onStrokesChange(newStrokes);
      }
  };

  const clearCanvas = () => {
    onStrokesChange([]);
    // Reset history to match clear state, but preserve redo stack? No, standard is new branch.
    setHistory(prev => [...prev.slice(0, currentHistoryIndex + 1), []]);
    setCurrentHistoryIndex(prev => prev + 1);
    setShowSaveOptions(false);
  };

  const downloadAnimatedSVG = () => {
    if (!Array.isArray(strokes) || strokes.length === 0) return;
    
    // Calculate bounds
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    strokes.forEach(s => s.points.forEach(p => {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
    }));

    const padding = 20;
    const width = (maxX - minX) + padding * 2;
    const height = (maxY - minY) + padding * 2;
    
    // Generate paths with unique IDs for animation
    let paths = '';
    strokes.forEach((stroke, i) => {
        let d = '';
        if (stroke.style === 'fountain') {
            const outlinePoints = getStroke(stroke.points.map(p => ({ ...p, x: p.x - minX + padding, y: p.y - minY + padding })), {
                size: stroke.baseWidth * 3, thinning: 0.5, smoothing: 0.5, streamline: 0.5
            });
            d = getSvgPathFromStroke(outlinePoints);
            // Fountain pen is filled, not stroked, so animation is tricky. We fade it in sequence.
            paths += `<path d="${d}" fill="${stroke.color}" opacity="0" style="animation: fadeIn 0.1s linear forwards ${i * 0.1}s" />`;
        } else {
            // Monoline stroke animation
            d = `M ${(stroke.points[0].x - minX + padding).toFixed(2)} ${(stroke.points[0].y - minY + padding).toFixed(2)}`;
            for (let j = 1; j < stroke.points.length - 1; j++) {
                const p1 = stroke.points[j];
                const p2 = stroke.points[j+1];
                d += ` Q ${(p1.x - minX + padding).toFixed(2)} ${(p1.y - minY + padding).toFixed(2)} ${((p1.x + p2.x)/2 - minX + padding).toFixed(2)} ${((p1.y + p2.y)/2 - minY + padding).toFixed(2)}`;
            }
            d += ` L ${(stroke.points[stroke.points.length - 1].x - minX + padding).toFixed(2)} ${(stroke.points[stroke.points.length - 1].y - minY + padding).toFixed(2)}`;
            
            // CSS trick for path animation: pathLength="1" allows us to animate from dashoffset 1 to 0
            paths += `<path d="${d}" stroke="${stroke.color}" stroke-width="${stroke.baseWidth}" fill="none" stroke-linecap="round" stroke-linejoin="round" pathLength="1" style="stroke-dasharray: 1; stroke-dashoffset: 1; animation: draw 0.5s linear forwards ${i * 0.4}s;" />`;
        }
    });

    const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <style>
    @keyframes draw { to { stroke-dashoffset: 0; } }
    @keyframes fadeIn { to { opacity: 1; } }
  </style>
  ${paths}
</svg>`;

    const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `signature-animated-${Date.now()}.svg`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowSaveOptions(false);
    onShowToast("Animated SVG downloaded", "success");
  };

  const downloadPNG = (options: { withBg?: boolean, whiteInk?: boolean }) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const trimmedCanvas = trimCanvas(canvas);
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = trimmedCanvas.width;
    finalCanvas.height = trimmedCanvas.height;
    const ctx = finalCanvas.getContext('2d');
    if (ctx) {
        if (options.withBg) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
        }
        if (options.whiteInk) {
            ctx.drawImage(trimmedCanvas, 0, 0);
            ctx.globalCompositeOperation = 'source-in';
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
            ctx.globalCompositeOperation = 'source-over';
        } else {
            ctx.drawImage(trimmedCanvas, 0, 0);
        }
    }
    const dataUrl = finalCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    let filename = `signature-drawn-${Date.now()}`;
    if (options.whiteInk) filename += '-white-ink';
    if (options.withBg) filename += '-bg';
    link.download = `${filename}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowSaveOptions(false);
    onShowToast("Signature downloaded successfully", "success");
  };

  const handleSignDocument = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const trimmedCanvas = trimCanvas(canvas);
    onSignDocument(trimmedCanvas.toDataURL('image/png'));
  };

  const handleCopy = () => {
    try {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const trimmedCanvas = trimCanvas(canvas);
        
        trimmedCanvas.toBlob(async (blob) => {
            if (!blob) return;
            await navigator.clipboard.write([
                new ClipboardItem({
                    [blob.type]: blob,
                }),
            ]);
            onShowToast("Copied to clipboard", "success");
        }, 'image/png');
    } catch (err) {
        console.error('Failed to copy image: ', err);
        onShowToast("Failed to copy", "info");
    }
  };

  const hasContent = Array.isArray(strokes) && strokes.length > 0;
  const canUndo = currentHistoryIndex >= 0;
  const canRedo = currentHistoryIndex < history.length - 1;

  const getBackgroundStyle = () => {
      switch(bgPattern) {
          case 'grid': return { backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px', opacity: 0.03 };
          case 'lines': return { backgroundImage: 'linear-gradient(transparent 39px, #000 40px)', backgroundSize: '100% 40px', opacity: 0.03 };
          case 'blank': return { background: 'white' }; // Always white for drawing pad contrast
          default: return {};
      }
  };

  return (
    <div className="relative group animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div 
        ref={containerRef}
        className="relative w-full h-[50vh] min-h-[350px] sm:h-[450px] bg-white rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-gray-100 dark:border-slate-800 overflow-hidden cursor-crosshair touch-none select-none"
      >
        <div className="absolute inset-0 pointer-events-none" style={getBackgroundStyle()} />
        
        {bgPattern !== 'blank' && (
            <div className="absolute top-1/2 left-10 right-10 h-px bg-blue-100/50 pointer-events-none" />
        )}

        {!hasContent && !isDrawing && (
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                 <p className="text-2xl sm:text-3xl font-handwriting text-gray-200 dark:text-gray-300 font-serif-display italic">Sign within the space</p>
             </div>
        )}
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={handleMove}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={handleMove}
          onTouchEnd={stopDrawing}
          className="w-full h-full block relative z-10 touch-none"
        />
      </div>

      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex flex-wrap items-center justify-center gap-1 sm:gap-2 p-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border border-gray-200 dark:border-slate-700 shadow-xl z-20 max-w-[95vw] sm:max-w-none">
          <div className="flex bg-gray-100 dark:bg-slate-800 rounded-xl p-0.5 mx-0.5 sm:mx-1">
             <button onClick={() => setPenStyle('fountain')} className={`p-2 rounded-lg transition-all ${penStyle === 'fountain' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600'}`} aria-label="Fountain Pen Style" title="Fountain Pen"><PenTool size={16} /></button>
             <button onClick={() => setPenStyle('monoline')} className={`p-2 rounded-lg transition-all ${penStyle === 'monoline' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600'}`} aria-label="Monoline Pen Style" title="Monoline Pen"><Edit3 size={16} /></button>
          </div>
          
          <div className="w-px h-6 bg-gray-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>
          
          <div className="flex bg-gray-100 dark:bg-slate-800 rounded-xl p-0.5 mx-0.5 sm:mx-1 hidden xs:flex">
             <button onClick={() => setBgPattern('grid')} className={`p-2 rounded-lg transition-all ${bgPattern === 'grid' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600'}`} aria-label="Grid Background" title="Grid"><Grid3X3 size={16} /></button>
             <button onClick={() => setBgPattern('lines')} className={`p-2 rounded-lg transition-all ${bgPattern === 'lines' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600'}`} aria-label="Lined Background" title="Lines"><AlignJustify size={16} /></button>
             <button onClick={() => setBgPattern('blank')} className={`p-2 rounded-lg transition-all ${bgPattern === 'blank' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600'}`} aria-label="Blank Background" title="Blank"><Square size={16} /></button>
          </div>

          <div className="w-px h-6 bg-gray-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>
          
          <div className="flex items-center px-2 gap-2 hidden sm:flex">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Size</span>
            <input aria-label="Pen Size" type="range" min="1" max="8" step="0.5" value={baseWidth} onChange={(e) => setBaseWidth(parseFloat(e.target.value))} className="w-20 h-1 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-slate-900 dark:accent-white" />
          </div>
          <div className="w-px h-6 bg-gray-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>
          
           <button onClick={startReplay} disabled={!hasContent || isPlaying} className={`p-2.5 rounded-full transition-colors ${!hasContent || isPlaying ? 'text-gray-300 dark:text-slate-700' : 'text-slate-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800'}`} aria-label="Replay Signature" title="Replay">
               {isPlaying ? <Pause size={18} /> : <Play size={18} />}
           </button>
           
          <div className="flex items-center gap-0.5 sm:gap-1">
            <button onClick={undo} disabled={!canUndo || isPlaying} className={`p-2.5 rounded-full transition-colors ${!canUndo || isPlaying ? 'text-gray-300 dark:text-slate-700' : 'text-slate-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800'}`} aria-label="Undo" title="Undo"><Undo2 size={18} /></button>
            <button onClick={redo} disabled={!canRedo || isPlaying} className={`p-2.5 rounded-full transition-colors ${!canRedo || isPlaying ? 'text-gray-300 dark:text-slate-700' : 'text-slate-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800'}`} aria-label="Redo" title="Redo"><Redo2 size={18} /></button>
            <button onClick={clearCanvas} disabled={isPlaying} className="p-2.5 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors" aria-label="Clear Canvas" title="Clear"><Trash2 size={18} /></button>
          </div>
          
          <div className="w-px h-6 bg-gray-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>
          
          <div className="flex items-center gap-1 sm:gap-2 ml-0.5 sm:ml-1">
              <button onClick={onSaveToGallery} disabled={!hasContent || isPlaying} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${hasContent && !isPlaying ? 'text-slate-700 dark:text-slate-200 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700' : 'text-gray-300 dark:text-slate-700 bg-gray-50 dark:bg-slate-900'}`} aria-label="Save to Gallery" title="Save to Gallery">
                 <FolderHeart size={16} />
              </button>
              
              <button onClick={handleCopy} disabled={!hasContent || isPlaying} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${hasContent && !isPlaying ? 'text-slate-700 dark:text-slate-200 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700' : 'text-gray-300 dark:text-slate-700 bg-gray-50 dark:bg-slate-900'}`} aria-label="Copy Image" title="Copy to Clipboard">
                 <Copy size={16} />
                 <span className="hidden sm:inline">Copy</span>
              </button>

              <div className="relative">
                  <button onClick={() => hasContent && setShowSaveOptions(!showSaveOptions)} disabled={!hasContent || isPlaying} className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium text-sm transition-all ${hasContent && !isPlaying ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-md hover:bg-slate-800 dark:hover:bg-blue-500' : 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-600 cursor-not-allowed'}`} aria-label="Open Download Options">
                    <Download size={16} /><span className="hidden sm:inline">Save</span>
                  </button>
                  {showSaveOptions && hasContent && (
                      <div className="absolute bottom-full right-0 mb-3 w-52 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden animate-in slide-in-from-bottom-2 fade-in duration-200">
                          <button onClick={handleSignDocument} className="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2"><ImagePlus size={14} className="text-slate-400" /> Sign Document</button>
                          <button onClick={downloadAnimatedSVG} className="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2"><Clapperboard size={14} className="text-slate-400" /> Animated SVG</button>
                          <button onClick={() => downloadPNG({ withBg: false })} className="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2"><span className="w-3 h-3 rounded border border-gray-300 bg-gray-100"></span> PNG Transparent</button>
                          <button onClick={() => downloadPNG({ withBg: true })} className="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2"><span className="w-3 h-3 rounded border border-gray-300 bg-white"></span> PNG White BG</button>
                          <button onClick={() => downloadPNG({ whiteInk: true })} className="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2 border-t border-gray-50 dark:border-slate-700"><span className="w-3 h-3 rounded border border-gray-300 bg-slate-900"></span> White Ink</button>
                      </div>
                  )}
              </div>
          </div>
      </div>
    </div>
  );
};

export default DrawMode;
