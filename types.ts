
export type SignatureColor = string;

export interface FontOption {
  name: string;
  family: string;
  category: 'elegant' | 'casual' | 'handwriting';
}

export type TabMode = 'type' | 'draw';

// Navigation State
export type AppView = 'home' | 'about' | 'contact' | 'privacy' | 'terms' | 'blog' | 'blog-post';

export interface SignatureSettings {
  text: string;
  color: SignatureColor;
  fontSize: number; 
  strokeWidth: number; 
}

export interface TypeStyle {
  slant: number; // -10 to 20 degrees
  spacing: number; // -5 to 15 pixels
  subtitle?: string; // New subtitle field
}

export interface SignatureLineOptions {
    enabled: boolean;
    style: 'solid' | 'dashed';
    showX: boolean;
}

export interface ExportOptions {
  background: 'transparent' | 'white';
  invert: boolean;
}

export type PenStyle = 'fountain' | 'monoline';

export interface ToastMessage {
    id: string;
    message: string;
    type: 'success' | 'info';
}

export interface Point {
    x: number;
    y: number;
    pressure: number; // 0 to 1
    time: number;
}

export type BackgroundPattern = 'blank' | 'grid' | 'lines';

export interface Stroke {
  points: Point[];
  color: string;
  baseWidth: number;
  style: PenStyle;
}

export type SignatureType = 'drawn' | 'typed';

export interface SavedSignature {
  id: string;
  type: SignatureType;
  date: number;
  // For Typed
  text?: string;
  fontFamily?: string;
  fontName?: string;
  color: string;
  style?: TypeStyle;
  // For Drawn
  strokes?: Stroke[];
  backgroundColor?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string; // HTML string
  date: string;
  author: string;
  readTime: string;
  tags: string[];
  image?: string;
}

export type Theme = 'light' | 'dark';

export interface DocumentData {
    isOpen: boolean;
    signatureImage: string | null; // Data URL of the generated signature
}
