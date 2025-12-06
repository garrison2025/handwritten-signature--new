
import React from 'react';
import { COLORS } from '../constants';
import { SignatureColor } from '../types';
import { Plus } from 'lucide-react';

interface ColorPickerProps {
  selectedColor: SignatureColor;
  onColorChange: (color: SignatureColor) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ selectedColor, onColorChange }) => {
  return (
    <div className="flex items-center justify-center space-x-2 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-2 rounded-full border border-gray-100 dark:border-slate-700 shadow-sm inline-flex">
      {COLORS.map((color) => (
        <button
          key={color}
          onClick={() => onColorChange(color)}
          className={`w-6 h-6 rounded-full transition-all duration-300 relative group outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 dark:focus:ring-offset-slate-900`}
          style={{ backgroundColor: color }}
          aria-label={`Select color ${color}`}
        >
          {selectedColor === color && (
             <span className="absolute inset-0 ring-2 ring-offset-2 ring-gray-300 dark:ring-slate-500 rounded-full scale-110" />
          )}
        </button>
      ))}
      <div className="w-px h-6 bg-gray-200 dark:bg-slate-700 mx-2"></div>
      
      {/* Custom Color Picker */}
      <div className="relative flex items-center justify-center w-6 h-6">
        <div className={`absolute inset-0 rounded-full bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 flex items-center justify-center transition-all pointer-events-none ${!COLORS.includes(selectedColor) ? 'ring-2 ring-offset-2 ring-gray-300 dark:ring-slate-500 scale-110' : ''}`}>
           <Plus size={12} className="text-white" />
        </div>
        <input
            type="color"
            value={selectedColor}
            onChange={(e) => onColorChange(e.target.value)}
            className="w-8 h-8 opacity-0 cursor-pointer absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
            title="Custom Color"
        />
      </div>
    </div>
  );
};

export default ColorPicker;
