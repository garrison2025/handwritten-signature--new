
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Download, Copy, RefreshCw, X, SlidersHorizontal, MoreHorizontal, FileCode, ImagePlus, FolderHeart } from 'lucide-react';
import { FONTS, PRESET_TEXTS } from '../constants';
import { SignatureColor, FontOption, TypeStyle, SignatureLineOptions } from '../types';
import { trimCanvas } from '../utils';
import useLocalStorage from '../hooks/useLocalStorage';

interface TypeModeProps {
  text: string;
  setText: (text: string) => void;
  color: SignatureColor;
  onShowToast: (message: string, type: 'success' | 'info') => void;
  onSignDocument: (signatureData: string) => void;
  // Lifted State
  style: TypeStyle;
  setStyle: (style: TypeStyle) => void;
  onSaveToGallery: (font: FontOption) => void;
}

// -- Helper: Draw Logic (Stateless) --
const drawToCanvas = (
    ctx: CanvasRenderingContext2D, 
    font: FontOption, 
    textToDraw: string, 
    canvasWidth: number, 
    canvasHeight: number,
    drawStyle: TypeStyle,
    color: string,
    lineOptions: SignatureLineOptions,
    useWhiteText: boolean = false,
    useWhiteBackground: boolean = false
  ) => {
    let fontSize = 150;
    const fontFamily = font.family.split(',')[0].trim();
    const subtitle = drawStyle.subtitle || '';
    
    if (useWhiteBackground) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    } else {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    }

    const textColor = useWhiteText ? '#ffffff' : color;
    
    const hasSubtitle = subtitle.length > 0;
    let baselineY = canvasHeight / 2;
    if (lineOptions.enabled) baselineY = canvasHeight * 0.55;
    if (hasSubtitle) baselineY -= 30;

    const lineY = baselineY + 20; 
    const subtitleY = lineY + 40; 

    if (lineOptions.enabled) {
        ctx.save();
        ctx.strokeStyle = textColor;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        if (lineOptions.style === 'dashed') ctx.setLineDash([10, 10]);
        const lineStart = canvasWidth * 0.15;
        const lineEnd = canvasWidth * 0.85;
        ctx.beginPath();
        ctx.moveTo(lineStart, lineY);
        ctx.lineTo(lineEnd, lineY);
        ctx.stroke();
        if (lineOptions.showX) {
            ctx.font = `bold 40px "Inter", sans-serif`;
            ctx.fillStyle = textColor;
            ctx.fillText("X", lineStart, lineY - 10);
        }
        ctx.restore();
    }

    ctx.save();
    ctx.translate(canvasWidth / 2, baselineY);
    const globalAngle = (Math.random() - 0.5) * 2 * (Math.PI / 180); 
    ctx.rotate(globalAngle);
    const skewRad = ((drawStyle.slant || 0) * Math.PI) / 180;
    ctx.transform(1, 0, Math.tan(skewRad * -1), 1, 0, 0);
    ctx.fillStyle = textColor;
    
    ctx.canvas.style.letterSpacing = `${drawStyle.spacing || 0}px`;
    ctx.font = `${fontSize}px ${fontFamily}`;
    let textWidth = ctx.measureText(textToDraw).width;
    const padding = 60;
    const maxWidth = canvasWidth - (padding * 2);

    while (textWidth > maxWidth && fontSize > 40) {
        fontSize -= 5;
        ctx.font = `${fontSize}px ${fontFamily}`;
        textWidth = ctx.measureText(textToDraw).width;
    }

    if (!useWhiteText) { 
        ctx.shadowColor = textColor;
        ctx.shadowBlur = 1; 
    }
    ctx.globalAlpha = 0.95;

    const isMessyHandwriting = font.category === 'handwriting';
    if (isMessyHandwriting) {
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
        const totalWidth = ctx.measureText(textToDraw).width;
        let currentX = -totalWidth / 2;
        for (let i = 0; i < textToDraw.length; i++) {
            const char = textToDraw[i];
            const charWidth = ctx.measureText(char).width;
            ctx.save();
            const sizeJitter = 1 + (Math.random() - 0.5) * 0.1;
            const angleJitter = (Math.random() - 0.5) * 8 * (Math.PI / 180);
            const yJitter = (Math.random() - 0.5) * 5;
            ctx.translate(currentX + charWidth/2, yJitter);
            ctx.rotate(angleJitter);
            ctx.scale(sizeJitter, sizeJitter);
            ctx.fillText(char, -charWidth/2, 0);
            ctx.restore();
            currentX += charWidth;
        }
    } else {
        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic';
        ctx.fillText(textToDraw, 0, 0);
        if (!useWhiteText) {
            ctx.globalAlpha = 0.2;
            const jitter = 0.5;
            ctx.fillText(textToDraw, (Math.random() - 0.5) * jitter, (Math.random() - 0.5) * jitter);
        }
    }
    ctx.restore();

    if (hasSubtitle) {
        ctx.save();
        ctx.fillStyle = textColor;
        ctx.font = `500 24px "Inter", sans-serif`; 
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.letterSpacing = '1px';
        ctx.globalAlpha = 0.8;
        const drawSubtitleY = lineOptions.enabled ? subtitleY : baselineY + 50;
        ctx.fillText(subtitle.toUpperCase(), canvasWidth / 2, drawSubtitleY);
        ctx.restore();
    }
    ctx.canvas.style.letterSpacing = '0px';
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1.0;
};


// -- Sub-Component: Lazy Font Card --
interface LazyFontCardProps {
    font: FontOption;
    text: string;
    color: string;
    style: TypeStyle;
    lineOptions: SignatureLineOptions;
    activeDropdown: string | null;
    onToggleDropdown: (e: React.MouseEvent, fontName: string) => void;
    onSaveToGallery: (font: FontOption) => void;
    onDownload: (font: FontOption, options: { withBg?: boolean, whiteInk?: boolean }) => void;
    onCopy: (font: FontOption) => void;
    onSignDocument: (font: FontOption) => void;
    onDownloadSVG: (font: FontOption) => void;
}

const LazyFontCard: React.FC<LazyFontCardProps> = ({
    font,
    text,
    color,
    style,
    lineOptions,
    activeDropdown,
    onToggleDropdown,
    onSaveToGallery,
    onDownload,
    onCopy,
    onSignDocument,
    onDownloadSVG
}) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isFontLoaded, setIsFontLoaded] = useState(false);

    // 1. Intersection Observer: Only load when card is near viewport
    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
                observer.disconnect(); // Stop observing once visible
            }
        }, {
            rootMargin: '200px' // Preload 200px before it hits view
        });

        if (cardRef.current) {
            observer.observe(cardRef.current);
        }

        return () => observer.disconnect();
    }, []);

    // 2. Load Font when visible
    useEffect(() => {
        if (isVisible) {
            const fontName = font.name.replace(/ /g, '+');
            // Handle specific weights for fonts that might need them, or default to standard
            let weightSpec = '';
            if (['Caveat', 'Dancing Script'].includes(font.name)) {
                weightSpec = ':wght@400..700';
            } else if (['WindSong'].includes(font.name)) {
                weightSpec = ':wght@400;500';
            }

            const url = `https://fonts.googleapis.com/css2?family=${fontName}${weightSpec}&display=swap`;
            
            // Avoid duplicate link injection
            if (!document.querySelector(`link[href="${url}"]`)) {
                const link = document.createElement('link');
                link.href = url;
                link.rel = 'stylesheet';
                document.head.appendChild(link);
            }

            // Wait for font to actually be available to canvas/DOM
            document.fonts.load(`1em "${font.family}"`).then(() => {
                setIsFontLoaded(true);
            }).catch(() => {
                // Fallback if load fails, still show card
                setIsFontLoaded(true);
            });
        }
    }, [isVisible, font.name, font.family]);

    const displayFont = isFontLoaded ? font.family : 'sans-serif';
    const isLoading = isVisible && !isFontLoaded;

    return (
        <div ref={cardRef} className="group relative bg-white rounded-xl p-8 border border-gray-100 dark:border-slate-800 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-500 flex flex-col items-center justify-center min-h-[250px]">
            
            {/* Loading State */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center z-30 bg-white/50 dark:bg-slate-900/50">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-300 dark:border-slate-600"></div>
                </div>
            )}

            <div className={`flex-grow flex items-center justify-center w-full overflow-hidden px-4 relative flex-col gap-2 transition-opacity duration-500 ${isFontLoaded ? 'opacity-100' : 'opacity-0'}`}>
                {lineOptions.enabled && (
                    <div className="absolute w-full bottom-[25%] left-0 px-8 pointer-events-none opacity-50">
                        {lineOptions.showX && (<span className="absolute left-8 bottom-1 font-sans font-bold text-2xl text-slate-300">X</span>)}
                        <div className="w-full h-px bg-slate-300" style={{ borderBottom: lineOptions.style === 'dashed' ? '1px dashed #cbd5e1' : '1px solid #cbd5e1', background: 'transparent'}} />
                    </div>
                )}
                <p 
                    style={{ 
                        fontFamily: displayFont, 
                        color: color, 
                        fontSize: 'clamp(2rem, 8vw, 3.5rem)', 
                        lineHeight: 1.2, 
                        transform: `skewX(-${style.slant || 0}deg) translateY(${lineOptions.enabled ? '-10px' : '0px'}) rotate(${(Math.random() - 0.5) * 2}deg)`, 
                        letterSpacing: `${style.spacing || 0}px`, 
                        textShadow: `0px 0px 1px ${color}`, 
                        opacity: 0.9 
                    }} 
                    className="text-center break-words w-full select-none transition-all duration-300 z-10"
                >
                    {text.trim() || 'Signature'}
                </p>
                {style.subtitle && (
                    <p className="text-center font-sans font-medium text-slate-500 text-sm tracking-widest uppercase mt-4 z-10 opacity-80" style={{ color: color }}>{style.subtitle}</p>
                )}
            </div>
            
            <div className="absolute inset-0 bg-white/95 dark:bg-slate-900/95 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-xl backdrop-blur-[2px] z-20">
              <div className="flex flex-col items-center space-y-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <div className="flex items-center space-x-2">
                    <button onClick={() => onSaveToGallery(font)} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 px-4 py-2.5 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-2" aria-label="Save to Gallery">
                        <FolderHeart size={16} /> Save
                    </button>
                    <button onClick={() => onDownload(font, { withBg: false })} className="flex items-center space-x-2 bg-slate-900 dark:bg-blue-600 text-white px-4 py-2.5 rounded-lg shadow-lg hover:bg-slate-800 dark:hover:bg-blue-500 text-sm font-medium transition-transform active:scale-95" aria-label="Download PNG">
                        <Download size={16} /><span>PNG</span>
                    </button>
                    <div className="relative">
                        <button onClick={(e) => onToggleDropdown(e, font.name)} className={`p-2.5 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors ${activeDropdown === font.name ? 'bg-gray-100 dark:bg-slate-700 ring-2 ring-slate-200 dark:ring-slate-600' : 'bg-white dark:bg-slate-800'}`}>
                            <MoreHorizontal size={16} className="text-slate-600 dark:text-slate-300" />
                        </button>
                        {activeDropdown === font.name && (
                            <div className="absolute right-0 bottom-full mb-2 w-52 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50">
                                <button onClick={() => onCopy(font)} className="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2"><Copy size={14} className="text-slate-400" /> Copy to Clipboard</button>
                                <button onClick={() => onSignDocument(font)} className="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2"><ImagePlus size={14} className="text-slate-400" /> Sign Document</button>
                                <button onClick={() => onDownloadSVG(font)} className="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2"><FileCode size={14} className="text-slate-400" /> SVG (Vector)</button>
                                <button onClick={() => onDownload(font, { withBg: true })} className="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2"><span className="w-3 h-3 rounded-full border border-gray-200 bg-white"></span> White Background</button>
                                <button onClick={() => onDownload(font, { whiteInk: true })} className="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2 border-t border-gray-50 dark:border-slate-700"><span className="w-3 h-3 rounded-full border border-gray-300 bg-slate-900"></span> White Ink</button>
                            </div>
                        )}
                    </div>
                </div>
              </div>
            </div>
            <div className="absolute bottom-4 left-0 w-full text-center opacity-100 group-hover:opacity-0 transition-opacity duration-200">
              <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-medium">{font.name}</span>
            </div>
        </div>
    );
};


// -- Main Component --
const TypeMode: React.FC<TypeModeProps> = ({ 
  text, 
  setText, 
  color, 
  onShowToast, 
  onSignDocument,
  style,
  setStyle,
  onSaveToGallery
}) => {
  const [lineOptions, setLineOptions] = useLocalStorage<SignatureLineOptions>('sc_line_options', { enabled: false, style: 'solid', showX: true });
  
  const [showControls, setShowControls] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [debouncedText, setDebouncedText] = useState(text);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedText(text);
    }, 300);
    return () => clearTimeout(handler);
  }, [text]);

  // Global click handler to close dropdowns
  useEffect(() => {
    const handleClickOutside = () => setActiveDropdown(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const toggleDropdown = (e: React.MouseEvent, fontName: string) => {
    e.stopPropagation();
    setActiveDropdown(activeDropdown === fontName ? null : fontName);
  };

  const handleDownload = useCallback((font: FontOption, options: { withBg?: boolean, whiteInk?: boolean }) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = 1200;
    canvas.height = 800; 
    const textToDraw = text.trim() || 'Signature';
    drawToCanvas(ctx, font, textToDraw, canvas.width, canvas.height, style, color, lineOptions, options.whiteInk, options.withBg);
    const trimmed = trimCanvas(canvas);
    const dataUrl = trimmed.toDataURL('image/png');
    const link = document.createElement('a');
    let filename = `signature-${font.name.toLowerCase().replace(/\s+/g, '-')}`;
    if (options.whiteInk) filename += '-white-ink';
    if (options.withBg) filename += '-bg';
    link.download = `${filename}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setActiveDropdown(null);
    onShowToast("Signature downloaded successfully", "success");
  }, [text, color, style, lineOptions, onShowToast]);

  const handleSignDocument = useCallback((font: FontOption) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = 1200;
    canvas.height = 800; 
    const textToDraw = text.trim() || 'Signature';
    drawToCanvas(ctx, font, textToDraw, canvas.width, canvas.height, style, color, lineOptions);
    const trimmed = trimCanvas(canvas);
    onSignDocument(trimmed.toDataURL('image/png'));
    setActiveDropdown(null);
  }, [text, color, style, lineOptions, onSignDocument]);

  const handleDownloadSVG = useCallback((font: FontOption) => {
    const textToDraw = text.trim() || 'Signature';
    const fontFamily = font.family.split(',')[0].trim();
    const skewDeg = (style.slant || 0) * -1;
    const textColor = color;
    const subtitle = style.subtitle || '';
    
    let extraElements = '';
    let yText = '50%';
    let viewBoxHeight = 200;
    
    if (lineOptions.enabled || subtitle) {
        yText = '45%';
        viewBoxHeight = 300;
    }
    if (lineOptions.enabled) {
        const dashArray = lineOptions.style === 'dashed' ? 'stroke-dasharray="10,10"' : '';
        const xMark = lineOptions.showX ? `<text x="10%" y="64%" font-family="Inter, sans-serif" font-weight="bold" font-size="40" fill="${textColor}">X</text>` : '';
        extraElements += `${xMark}<line x1="10%" y1="65%" x2="90%" y2="65%" stroke="${textColor}" stroke-width="2" stroke-linecap="round" ${dashArray} />`;
    }
    if (subtitle) {
        const subY = lineOptions.enabled ? "80%" : "70%";
        extraElements += `<text x="50%" y="${subY}" font-family="Inter, sans-serif" font-weight="500" font-size="24" letter-spacing="1" text-anchor="middle" fill="${textColor}" opacity="0.8">${subtitle.toUpperCase()}</text>`;
    }
    const filterDef = `
    <defs>
      <filter id="ink-bleed" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
      </filter>
    </defs>`;

    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="${viewBoxHeight}" viewBox="0 0 600 ${viewBoxHeight}">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=${font.name.replace(/ /g, '+')}&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@500;700&display=swap');
    .signature { font-family: '${fontFamily.replace(/['"]/g, '')}', cursive; font-size: 100px; fill: ${textColor}; }
  </style>
  ${filterDef}
  ${extraElements}
  <text x="50%" y="${yText}" dominant-baseline="middle" text-anchor="middle" class="signature" transform="skewX(${skewDeg})" letter-spacing="${style.spacing || 0}" filter="url(#ink-bleed)">${textToDraw}</text>
</svg>`.trim();

    const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `signature-${font.name.toLowerCase().replace(/\s+/g, '-')}.svg`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setActiveDropdown(null);
    onShowToast("Vector SVG downloaded", "success");
  }, [text, color, style, lineOptions, onShowToast]);

  const handleCopy = useCallback(async (font: FontOption) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      canvas.width = 1200;
      canvas.height = 800;
      const textToDraw = text.trim() || 'Signature';
      drawToCanvas(ctx, font, textToDraw, canvas.width, canvas.height, style, color, lineOptions);
      const trimmed = trimCanvas(canvas);
      trimmed.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([new ClipboardItem({[blob.type]: blob})]);
        onShowToast("Copied to clipboard", "success");
      }, 'image/png');
    } catch (err) {
      console.error('Failed to copy image: ', err);
      onShowToast("Failed to copy", "info");
    }
  }, [text, color, style, lineOptions, onShowToast]);


  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      
      {/* Input Section */}
      <div className="flex flex-col items-center space-y-6">
          <div className="relative max-w-2xl w-full mx-auto group space-y-4">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type your name..."
              maxLength={40}
              aria-label="Name Input"
              className="w-full text-center text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif-display py-6 bg-transparent border-b-2 border-gray-200 dark:border-slate-700 focus:border-slate-900 dark:focus:border-slate-400 outline-none placeholder:text-gray-200 dark:placeholder:text-slate-800 transition-colors text-slate-900 dark:text-white pr-12"
            />
            
            <div className="absolute right-0 top-6 -translate-y-1/2 flex items-center space-x-2">
                {text.length > 0 && (
                    <button onClick={() => setText('')} className="p-2 text-gray-300 hover:text-red-500 transition-colors" title="Clear"><X size={20} /></button>
                )}
                <button onClick={() => setText(PRESET_TEXTS[Math.floor(Math.random() * PRESET_TEXTS.length)])} className="p-2 text-gray-300 hover:text-slate-900 dark:hover:text-white transition-colors" title="Random Name"><RefreshCw size={20} /></button>
            </div>

            <div className={`transition-all duration-300 overflow-hidden ${showControls ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
                <input
                    type="text"
                    value={style.subtitle || ''}
                    onChange={(e) => setStyle({...style, subtitle: e.target.value})}
                    placeholder="Add subtitle (e.g. Chief Executive Officer)"
                    className="w-full text-center text-lg font-medium tracking-wide text-slate-500 dark:text-slate-400 bg-transparent border-b border-dashed border-gray-200 dark:border-slate-700 focus:border-slate-400 outline-none placeholder:text-gray-300 pb-2"
                />
            </div>
          </div>

          <button 
            onClick={() => setShowControls(!showControls)}
            className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full transition-all duration-300 ${showControls ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
          >
            <SlidersHorizontal size={14} />
            <span>Customize Style</span>
          </button>

          {showControls && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 bg-gray-50/50 dark:bg-slate-800/50 p-6 rounded-2xl w-full max-w-2xl border border-gray-100 dark:border-slate-700 animate-in slide-in-from-top-2 fade-in duration-300">
                <div className="space-y-3">
                    <div className="flex justify-between text-xs uppercase tracking-wider font-semibold text-gray-400">
                        <label>Slant</label><span>{style.slant}°</span>
                    </div>
                    <input type="range" min="-15" max="15" value={style.slant} onChange={(e) => setStyle({...style, slant: Number(e.target.value)})} className="w-full h-1.5 bg-gray-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-slate-900 dark:accent-slate-200" />
                </div>
                <div className="space-y-3">
                    <div className="flex justify-between text-xs uppercase tracking-wider font-semibold text-gray-400">
                        <label>Spacing</label><span>{style.spacing}px</span>
                    </div>
                    <input type="range" min="-5" max="20" value={style.spacing} onChange={(e) => setStyle({...style, spacing: Number(e.target.value)})} className="w-full h-1.5 bg-gray-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-slate-900 dark:accent-slate-200" />
                </div>
                <div className="md:col-span-2 pt-4 border-t border-gray-200/50 dark:border-slate-700/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                     <span className="text-xs uppercase tracking-wider font-semibold text-gray-400 self-start sm:self-center">Signature Line</span>
                     <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                         <button onClick={() => setLineOptions(prev => ({ ...prev, enabled: !prev.enabled }))} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${lineOptions.enabled ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-gray-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>{lineOptions.enabled ? 'On' : 'Off'}</button>
                         {lineOptions.enabled && (
                            <>
                                <button onClick={() => setLineOptions(prev => ({ ...prev, style: prev.style === 'solid' ? 'dashed' : 'solid' }))} className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-md text-slate-600 dark:text-slate-300">{lineOptions.style === 'solid' ? 'Solid' : 'Dashed'}</button>
                                <button onClick={() => setLineOptions(prev => ({ ...prev, showX: !prev.showX }))} className={`px-3 py-1.5 text-xs font-medium border rounded-md transition-colors ${lineOptions.showX ? 'bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-500 text-slate-900 dark:text-white' : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'}`}>"X" Mark</button>
                            </>
                         )}
                     </div>
                </div>
            </div>
          )}
      </div>

      {/* Lazy Loaded Font Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {FONTS.map((font) => (
          <LazyFontCard 
            key={font.name}
            font={font}
            text={debouncedText}
            color={color}
            style={style}
            lineOptions={lineOptions}
            activeDropdown={activeDropdown}
            onToggleDropdown={toggleDropdown}
            onSaveToGallery={onSaveToGallery}
            onDownload={handleDownload}
            onCopy={handleCopy}
            onSignDocument={handleSignDocument}
            onDownloadSVG={handleDownloadSVG}
          />
        ))}
      </div>
    </div>
  );
};

export default TypeMode;
