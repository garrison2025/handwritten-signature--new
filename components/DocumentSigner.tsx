
import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Download, Move, Image as ImageIcon } from 'lucide-react';

interface DocumentSignerProps {
  signatureImage: string;
  onClose: () => void;
  onShowToast: (message: string, type: 'success' | 'info') => void;
}

const DocumentSigner: React.FC<DocumentSignerProps> = ({ signatureImage, onClose, onShowToast }) => {
  const [docImage, setDocImage] = useState<HTMLImageElement | null>(null);
  const [position, setPosition] = useState({ x: 50, y: 50 }); // Percentage
  const [scale, setScale] = useState(0.3);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle File Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => setDocImage(img);
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  // Dragging Logic
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;

    setPosition({ 
        x: Math.min(100, Math.max(0, x)), 
        y: Math.min(100, Math.max(0, y)) 
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Composite and Download
  const handleDownload = () => {
    if (!docImage || !containerRef.current) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas to match the original document resolution
    canvas.width = docImage.naturalWidth;
    canvas.height = docImage.naturalHeight;

    // Draw Document
    ctx.drawImage(docImage, 0, 0);

    // Draw Signature
    const sigImg = new Image();
    sigImg.onload = () => {
      const containerRect = containerRef.current!.getBoundingClientRect();
      
      // Calculate aspect ratio relative to container
      const sigWidth = docImage.naturalWidth * scale;
      const sigHeight = sigWidth * (sigImg.naturalHeight / sigImg.naturalWidth);

      const xPos = (position.x / 100) * docImage.naturalWidth - (sigWidth / 2);
      const yPos = (position.y / 100) * docImage.naturalHeight - (sigHeight / 2);

      ctx.drawImage(sigImg, xPos, yPos, sigWidth, sigHeight);

      // Download
      const link = document.createElement('a');
      link.download = 'signed-document.jpg';
      link.href = canvas.toDataURL('image/jpeg', 0.9);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      onShowToast("Document downloaded successfully", "success");
    };
    sigImg.src = signatureImage;
  };

  useEffect(() => {
     window.addEventListener('mouseup', handleMouseUp);
     window.addEventListener('touchend', handleMouseUp);
     return () => {
         window.removeEventListener('mouseup', handleMouseUp);
         window.removeEventListener('touchend', handleMouseUp);
     }
  }, []);

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-gray-200 dark:border-slate-700">
        
        {/* Header */}
        <div className="h-16 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between px-6 bg-white dark:bg-slate-900 z-10">
          <h3 className="text-lg font-serif-display font-medium text-slate-900 dark:text-white flex items-center gap-2">
            <ImageIcon size={20} className="text-blue-500" />
            Sign Document
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500 dark:text-slate-400">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden relative bg-gray-50 dark:bg-slate-950 flex flex-col md:flex-row">
            
            {/* Sidebar Controls */}
            <div className="w-full md:w-64 bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800 p-6 flex flex-col gap-6 z-20 shadow-sm md:shadow-none">
                {!docImage ? (
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-slate-800 transition-all flex flex-col items-center gap-3"
                    >
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full text-blue-600 dark:text-blue-400">
                            <Upload size={24} />
                        </div>
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Upload Image</span>
                        <span className="text-xs text-slate-400">JPG, PNG, WebP</span>
                    </div>
                ) : (
                    <>
                        <div>
                            <label className="text-xs font-bold uppercase text-gray-400 mb-2 block tracking-wider">Signature Size</label>
                            <input 
                                type="range" 
                                min="0.1" 
                                max="1" 
                                step="0.05"
                                value={scale}
                                onChange={(e) => setScale(parseFloat(e.target.value))}
                                className="w-full h-1.5 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-slate-900 dark:accent-blue-500"
                            />
                        </div>
                        
                        <div className="mt-auto space-y-3">
                            <button 
                                onClick={handleDownload}
                                className="w-full bg-slate-900 dark:bg-blue-600 text-white py-3 rounded-xl font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                            >
                                <Download size={18} />
                                Download Signed
                            </button>
                            <button 
                                onClick={() => setDocImage(null)}
                                className="w-full bg-gray-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-3 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                            >
                                Change Document
                            </button>
                        </div>
                    </>
                )}
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    className="hidden" 
                />
            </div>

            {/* Canvas Area */}
            <div className="flex-1 relative overflow-auto flex items-center justify-center p-4 md:p-8 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
                {docImage ? (
                    <div 
                        ref={containerRef}
                        className="relative shadow-2xl ring-1 ring-black/5 select-none"
                        style={{ maxHeight: '100%', maxWidth: '100%' }}
                        onMouseMove={handleMouseMove}
                        onTouchMove={handleMouseMove}
                    >
                        <img 
                            src={docImage.src} 
                            alt="Document to sign" 
                            className="max-h-[75vh] object-contain block bg-white"
                            draggable={false}
                        />
                        
                        {/* Draggable Signature Overlay */}
                        <div 
                            className="absolute cursor-move group touch-none"
                            style={{ 
                                left: `${position.x}%`, 
                                top: `${position.y}%`,
                                transform: `translate(-50%, -50%) scale(${scale})`,
                                width: docImage.naturalWidth, // Base size logic
                                pointerEvents: 'none' // Allow click through to container for tracking
                            }}
                        >
                            <div className="relative pointer-events-auto" onMouseDown={handleMouseDown} onTouchStart={handleMouseDown}>
                                <img 
                                    src={signatureImage} 
                                    alt="Signature" 
                                    className="w-full pointer-events-none"
                                />
                                <div className={`absolute inset-0 border-2 border-blue-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ${isDragging ? 'opacity-100' : ''}`}>
                                     <div className="absolute -top-3 -right-3 bg-blue-500 text-white p-1 rounded-full shadow-sm">
                                         <Move size={12} />
                                     </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-slate-400 dark:text-slate-600">
                        <ImageIcon size={48} className="mx-auto mb-4 opacity-20" />
                        <p>Upload a document image to start signing</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentSigner;
