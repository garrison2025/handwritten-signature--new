
import React from 'react';
import { X, Trash2, PenTool, Keyboard } from 'lucide-react';
import { SavedSignature } from '../types';
import { getSvgPathFromStroke } from '../utils';
import { getStroke } from 'perfect-freehand';

interface SignatureGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  signatures: SavedSignature[];
  onLoad: (signature: SavedSignature) => void;
  onDelete: (id: string) => void;
}

const SignatureGallery: React.FC<SignatureGalleryProps> = ({ 
  isOpen, 
  onClose, 
  signatures, 
  onLoad, 
  onDelete 
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]" onClick={onClose} />
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white dark:bg-slate-900 shadow-2xl z-[70] transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col border-l border-gray-100 dark:border-slate-800`}>
        
        <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
          <div>
            <h2 className="text-xl font-serif-display font-medium text-slate-900 dark:text-white">Signature Gallery</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Your saved collection</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full text-slate-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-slate-950">
          {signatures.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-50">
              <div className="bg-white dark:bg-slate-800 p-4 rounded-full mb-4">
                <PenTool className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="font-medium text-slate-900 dark:text-white mb-2">No signatures yet</h3>
              <p className="text-sm text-slate-500">Save your drawn or typed signatures to access them here anytime.</p>
            </div>
          ) : (
            signatures.map((sig) => (
              <div key={sig.id} className="group bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all overflow-hidden">
                <div 
                  className="h-32 flex items-center justify-center p-4 cursor-pointer relative bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:12px_12px]"
                  onClick={() => {
                    onLoad(sig);
                    onClose();
                  }}
                >
                  {sig.type === 'typed' ? (
                    <div style={{
                      fontFamily: sig.fontFamily,
                      color: sig.color,
                      transform: `skewX(-${sig.style?.slant || 0}deg)`,
                      letterSpacing: `${sig.style?.spacing || 0}px`,
                      fontSize: '32px'
                    }} className="text-center">
                      {sig.text}
                    </div>
                  ) : (
                    <svg viewBox="0 0 400 200" className="w-full h-full">
                      {sig.strokes?.map((stroke, i) => {
                        let d = '';
                        // Normalize stroke to fit in viewbox roughly
                        const points = stroke.points.map(p => ({
                            ...p,
                            x: p.x * 0.5 + 50, // rough scaling for preview
                            y: p.y * 0.5 + 50
                        }));
                        
                        if (stroke.style === 'fountain') {
                           const outline = getStroke(points, { size: stroke.baseWidth * 2, thinning: 0.5, smoothing: 0.5, streamline: 0.5 });
                           d = getSvgPathFromStroke(outline);
                           return <path key={i} d={d} fill={stroke.color} />;
                        } else {
                           // Simple line for monoline preview
                           if (points.length < 2) return null;
                           d = `M ${points[0].x} ${points[0].y}`;
                           for (let j = 1; j < points.length; j++) d += ` L ${points[j].x} ${points[j].y}`;
                           return <path key={i} d={d} stroke={stroke.color} strokeWidth={stroke.baseWidth} fill="none" strokeLinecap="round" />;
                        }
                      })}
                    </svg>
                  )}
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">Load Signature</span>
                  </div>
                </div>

                <div className="px-4 py-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    {sig.type === 'typed' ? <Keyboard size={12} /> : <PenTool size={12} />}
                    <span>{new Date(sig.date).toLocaleDateString()}</span>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(sig.id);
                    }}
                    className="text-slate-400 hover:text-red-500 transition-colors p-1"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default SignatureGallery;
