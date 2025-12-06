import React, { useState, useEffect, Suspense } from 'react';
import { PenTool, Keyboard, Shield, Zap, Layers, Menu, X, Star, Feather, Sun, Moon, FolderHeart } from 'lucide-react';
import TypeMode from './components/TypeMode';
import ColorPicker from './components/ColorPicker';
import Toast from './components/Toast';
import DocumentSigner from './components/DocumentSigner';
import SignatureGallery from './components/SignatureGallery';
import SEO from './components/SEO';
import { TabMode, SignatureColor, ToastMessage, AppView, Theme, DocumentData, Stroke, TypeStyle, SavedSignature, FontOption } from './types';
import useLocalStorage from './hooks/useLocalStorage';
import { FONTS } from './constants';

// Code Splitting: Lazy load heavy components
const DrawMode = React.lazy(() => import('./components/DrawMode'));
const Blog = React.lazy(() => import('./components/Blog'));
const InfoPages = React.lazy(() => import('./components/InfoPages').then(module => ({ default: module.InfoPageWrapper })));

// Loading Component
const LoadingSpinner = () => (
    <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 dark:border-white"></div>
    </div>
);

function App() {
  // Navigation State
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [activeBlogSlug, setActiveBlogSlug] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // App State
  const [activeTab, setActiveTab] = useLocalStorage<TabMode>('sc_active_tab', 'type');
  const [text, setText] = useLocalStorage<string>('sc_text', '');
  const [color, setColor] = useLocalStorage<SignatureColor>('sc_color', '#0f172a');
  
  // Lifted State for DrawMode
  const [drawStrokes, setDrawStrokes] = useLocalStorage<Stroke[]>('sc_draw_strokes', []);

  // Lifted State for TypeMode
  const [typeStyle, setTypeStyle] = useLocalStorage<TypeStyle>('sc_type_style', { slant: 0, spacing: 0, subtitle: '' });

  // Signature Gallery State
  const [savedSignatures, setSavedSignatures] = useLocalStorage<SavedSignature[]>('sc_gallery', []);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  
  // Theme State
  const [theme, setTheme] = useLocalStorage<Theme>('sc_theme', 'light');

  // Document Signing State
  const [docData, setDocData] = useState<DocumentData>({ isOpen: false, signatureImage: null });

  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Apply Theme to DOM
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Router Logic
  useEffect(() => {
      const handleRoute = () => {
          const path = window.location.pathname;
          
          if (path === '/' || path === '') {
              setCurrentView('home');
          } else if (path === '/about') {
              setCurrentView('about');
          } else if (path === '/contact') {
              setCurrentView('contact');
          } else if (path === '/privacy') {
              setCurrentView('privacy');
          } else if (path === '/terms') {
              setCurrentView('terms');
          } else if (path === '/blog') {
              setCurrentView('blog');
          } else if (path.startsWith('/blog/')) {
              const slug = path.split('/blog/')[1];
              if (slug) {
                  setActiveBlogSlug(slug);
                  setCurrentView('blog-post');
              } else {
                  setCurrentView('blog');
              }
          } else {
              setCurrentView('home');
          }
      };

      handleRoute();

      const onPopState = (event: PopStateEvent) => {
          if (event.state) {
              if (event.state.view) setCurrentView(event.state.view);
              if (event.state.slug) setActiveBlogSlug(event.state.slug);
              else setActiveBlogSlug(null);
          } else {
              handleRoute();
          }
      };

      window.addEventListener('popstate', onPopState);
      return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const handleNavigate = (view: AppView, slug?: string) => {
      if (view === currentView && slug === activeBlogSlug) return;
      setCurrentView(view);
      if (slug) setActiveBlogSlug(slug);
      else setActiveBlogSlug(null);
      setIsMobileMenuOpen(false);
      let path = '/';
      if (view !== 'home') path = `/${view}`;
      if (view === 'blog-post' && slug) path = `/blog/${slug}`;
      try {
          if (window.location.protocol !== 'blob:') {
             window.history.pushState({ view, slug }, '', path);
          }
          window.scrollTo(0, 0);
      } catch (e) { console.warn(e); }
  };

  const showToast = (message: string, type: 'success' | 'info') => {
    setToast({ id: Date.now().toString(), message, type });
  };

  const openDocumentSigner = (signatureData: string) => {
      setDocData({ isOpen: true, signatureImage: signatureData });
  };

  // Gallery Logic
  const handleSaveDrawSignature = () => {
    if (drawStrokes.length === 0) return;
    const newSig: SavedSignature = {
      id: Date.now().toString(),
      type: 'drawn',
      date: Date.now(),
      color: color,
      strokes: drawStrokes
    };
    setSavedSignatures([newSig, ...savedSignatures]);
    showToast("Signature saved to Gallery", "success");
  };

  const handleSaveTypeSignature = (font: FontOption) => {
    if (!text.trim()) return;
    const newSig: SavedSignature = {
      id: Date.now().toString(),
      type: 'typed',
      date: Date.now(),
      text: text,
      color: color,
      fontFamily: font.family,
      fontName: font.name,
      style: typeStyle
    };
    setSavedSignatures([newSig, ...savedSignatures]);
    showToast("Signature saved to Gallery", "success");
  };

  const handleLoadSignature = (sig: SavedSignature) => {
    setColor(sig.color);
    if (sig.type === 'drawn' && sig.strokes) {
      setDrawStrokes(sig.strokes);
      setActiveTab('draw');
    } else if (sig.type === 'typed' && sig.text) {
      setText(sig.text);
      if (sig.style) setTypeStyle(sig.style);
      setActiveTab('type');
    }
    showToast("Signature loaded", "info");
  };

  const handleDeleteSignature = (id: string) => {
    setSavedSignatures(savedSignatures.filter(s => s.id !== id));
    showToast("Signature deleted", "info");
  };

  const NavLink = ({ view, label }: { view: AppView, label: string }) => (
      <button 
        onClick={() => handleNavigate(view)}
        className={`text-sm font-medium transition-colors ${currentView === view ? 'text-slate-900 dark:text-white font-semibold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
      >
        {label}
      </button>
  );

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-slate-900 selection:text-white dark:selection:bg-blue-500 dark:selection:text-white transition-colors duration-300">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => handleNavigate('home')} className="flex items-center space-x-2 group">
            <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-2 rounded-lg group-hover:scale-105 transition-transform">
              <Feather size={20} />
            </div>
            <span className="text-xl font-serif-display font-semibold tracking-tight text-slate-900 dark:text-white">SignCraft</span>
          </button>
          
          <nav className="hidden md:flex items-center space-x-8">
            <NavLink view="home" label="Generator" />
            <NavLink view="blog" label="Blog" />
            <NavLink view="about" label="About" />
            <NavLink view="contact" label="Contact" />
            
            <div className="h-6 w-px bg-gray-200 dark:bg-slate-800"></div>

            <button
                onClick={() => setIsGalleryOpen(true)}
                className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                aria-label="Open Gallery"
            >
                <FolderHeart size={18} />
                <span>Gallery</span>
            </button>

            {/* Dark Mode Toggle */}
            <button
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="p-2 rounded-full text-slate-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                aria-label="Toggle Dark Mode"
            >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
          </nav>

          <div className="flex items-center gap-4 md:hidden">
              <button
                  onClick={() => setIsGalleryOpen(true)}
                  className="p-2 text-slate-600 dark:text-slate-300"
              >
                  <FolderHeart size={20} />
              </button>
              <button
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="p-2 rounded-full text-slate-500 dark:text-slate-400"
              >
                  {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </button>
              <button 
                className="p-2 text-slate-600 dark:text-slate-300"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
          </div>
        </div>

        {/* Mobile Nav Dropdown */}
        {isMobileMenuOpen && (
            <div className="md:hidden absolute top-16 left-0 w-full bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 shadow-lg animate-in slide-in-from-top-5 duration-200">
                <div className="flex flex-col p-4 space-y-4">
                    <button onClick={() => handleNavigate('home')} className="text-left font-medium text-slate-700 dark:text-slate-200 py-2">Generator</button>
                    <button onClick={() => handleNavigate('blog')} className="text-left font-medium text-slate-700 dark:text-slate-200 py-2">Blog</button>
                    <button onClick={() => handleNavigate('about')} className="text-left font-medium text-slate-700 dark:text-slate-200 py-2">About Us</button>
                    <button onClick={() => handleNavigate('contact')} className="text-left font-medium text-slate-700 dark:text-slate-200 py-2">Contact</button>
                </div>
            </div>
        )}
      </header>

      <main className="flex-grow px-4 sm:px-6 py-8 sm:py-12 bg-[#F8F9FA] dark:bg-slate-950 transition-colors duration-300">
        {currentView === 'home' ? (
            <div className="max-w-4xl mx-auto">
              <SEO 
                title={activeTab === 'draw' ? "Draw Signature Online - Free Tool" : "SignCraft - Free Handwritten Signature Generator"} 
                description="Create professional, realistic handwritten signatures online. Type to generate or draw your own without any sign-up."
                schemaType="SoftwareApplication"
              />
              
              <div className="text-center mb-10 sm:mb-16 space-y-4 sm:space-y-6 animate-in slide-in-from-bottom-4 duration-700">
                <div className="inline-flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-100 dark:border-yellow-900/50 px-3 py-1 rounded-full mb-2">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-bold text-yellow-700 dark:text-yellow-500">Excellent 4.9/5 Average Rating</span>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-6xl font-serif-display font-medium text-slate-900 dark:text-white leading-tight">
                  The Art of the <span className="italic text-slate-600 dark:text-slate-400">Signature</span>
                </h1>
                <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed px-4">
                  Experience the most realistic <strong>handwritten signature generator</strong> online. Create a professional, secure digital mark in seconds. 
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-white dark:border-slate-800 overflow-hidden relative transition-colors duration-300">
                <div className="flex border-b border-gray-100 dark:border-slate-800">
                  <button
                    onClick={() => setActiveTab('type')}
                    className={`flex-1 py-4 sm:py-5 text-sm font-medium transition-all relative flex items-center justify-center space-x-2 ${
                      activeTab === 'type' ? 'text-slate-900 dark:text-white bg-white dark:bg-slate-900' : 'text-slate-400 dark:text-slate-500 bg-gray-50 dark:bg-slate-950 hover:text-slate-600 dark:hover:text-slate-300'
                    }`}
                  >
                    <Keyboard size={18} />
                    <span>Type</span>
                    {activeTab === 'type' && (
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-slate-900 dark:bg-blue-500" />
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('draw')}
                    className={`flex-1 py-4 sm:py-5 text-sm font-medium transition-all relative flex items-center justify-center space-x-2 ${
                      activeTab === 'draw' ? 'text-slate-900 dark:text-white bg-white dark:bg-slate-900' : 'text-slate-400 dark:text-slate-500 bg-gray-50 dark:bg-slate-950 hover:text-slate-600 dark:hover:text-slate-300'
                    }`}
                  >
                    <PenTool size={18} />
                    <span>Draw</span>
                    {activeTab === 'draw' && (
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-slate-900 dark:bg-blue-500" />
                    )}
                  </button>
                </div>

                <div className="p-4 sm:p-8 md:p-12 min-h-[400px] sm:min-h-[500px] flex flex-col items-center">
                  <div className="mb-8">
                    <ColorPicker selectedColor={color} onColorChange={setColor} />
                  </div>

                  <div className="w-full relative">
                    <div className={activeTab === 'type' ? 'block' : 'hidden'}>
                         <TypeMode 
                            text={text} 
                            setText={setText} 
                            color={color} 
                            onShowToast={showToast} 
                            onSignDocument={openDocumentSigner} 
                            style={typeStyle}
                            setStyle={setTypeStyle}
                            onSaveToGallery={handleSaveTypeSignature}
                         />
                    </div>
                    
                    <div className={activeTab === 'draw' ? 'block' : 'hidden'}>
                        <Suspense fallback={<LoadingSpinner />}>
                             <DrawMode 
                                color={color} 
                                isVisible={activeTab === 'draw'} 
                                onShowToast={showToast} 
                                onSignDocument={openDocumentSigner} 
                                strokes={drawStrokes}
                                onStrokesChange={setDrawStrokes}
                                onSaveToGallery={handleSaveDrawSignature}
                             />
                        </Suspense>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-20 sm:mt-24 grid grid-cols-1 md:grid-cols-12 gap-12 max-w-5xl mx-auto px-2">
                  <div className="md:col-span-4">
                      <h2 className="text-2xl font-serif-display font-medium mb-6 text-slate-900 dark:text-white">Why Use a <strong>Handwritten Signature Generator</strong>?</h2>
                      <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
                          In the digital age, a professional online signature is essential for branding. SignCraft offers a free, secure, and artistically refined solution.
                      </p>
                  </div>
                  <div className="md:col-span-8 flex flex-col justify-center space-y-6">
                      <div className="flex items-start gap-4">
                          <div className="bg-white dark:bg-slate-900 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 text-slate-900 dark:text-white"><Shield size={20} /></div>
                          <div>
                              <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">Secure & Private</h3>
                              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">Operates entirely in your browser (Client-Side), ensuring zero data leaks.</p>
                          </div>
                      </div>
                      <div className="flex items-start gap-4">
                          <div className="bg-white dark:bg-slate-900 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 text-slate-900 dark:text-white"><Zap size={20} /></div>
                          <div>
                              <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">Instant Vector Export</h3>
                              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">Download Scalable Vector Graphics (SVG) directly for professional printing.</p>
                          </div>
                      </div>
                      <div className="flex items-start gap-4">
                          <div className="bg-white dark:bg-slate-900 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 text-slate-900 dark:text-white"><Layers size={20} /></div>
                          <div>
                              <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">Natural Ink Technology</h3>
                              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">Simulates real ink velocity and pressure for an authentic feel.</p>
                          </div>
                      </div>
                  </div>
              </div>
              
              <div className="mt-20 border-t border-gray-200 dark:border-slate-800 pt-16">
                  <h2 className="text-center text-2xl font-serif-display font-medium mb-12 text-slate-900 dark:text-white">How to Use</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[
                          { title: "1. Choose Your Mode", desc: "Select 'Type' for a polished font look, or 'Draw' to sketch." },
                          { title: "2. Customize Style", desc: "Adjust settings like slant, letter spacing, stroke width, and color." },
                          { title: "3. Download & Use", desc: "Save as PNG, SVG, or Sign a Document directly." }
                      ].map((step, i) => (
                          <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
                              <span className="text-4xl font-serif-display text-gray-100 dark:text-slate-800 font-bold mb-4 block">0{i+1}</span>
                              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{step.title}</h3>
                              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                          </div>
                      ))}
                  </div>
              </div>

               <div className="mt-20 border-t border-gray-200 dark:border-slate-800 pt-10 pb-4 text-center">
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-widest mb-4">Supported Signature Styles</p>
                  <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 max-w-3xl mx-auto">
                      {FONTS.map(f => (
                          <span key={f.name} className="text-[10px] text-gray-400 font-light hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-default">
                              {f.name} Signature
                          </span>
                      ))}
                  </div>
               </div>
            </div>
        ) : (
            <div className="mt-4 sm:mt-8">
                <Suspense fallback={<LoadingSpinner />}>
                    {currentView === 'blog' && <Blog view='blog' activeSlug={null} onNavigate={handleNavigate} onShowToast={showToast} />}
                    {currentView === 'blog-post' && <Blog view='blog-post' activeSlug={activeBlogSlug} onNavigate={handleNavigate} onShowToast={showToast} />}
                    
                    {(currentView === 'about' || currentView === 'contact' || currentView === 'privacy' || currentView === 'terms') && (
                        <InfoPages view={currentView} onNavigate={handleNavigate} />
                    )}
                </Suspense>
            </div>
        )}
      </main>

      <footer className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 pt-20 pb-10 mt-12 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 mb-16">
                <div className="col-span-1 sm:col-span-2 md:col-span-1 space-y-4">
                    <div className="flex items-center space-x-2">
                        <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-1.5 rounded-lg">
                            <Feather size={16} />
                        </div>
                        <span className="text-lg font-serif-display font-semibold tracking-tight text-slate-900 dark:text-white">SignCraft</span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                        The professional standard for digital identity.
                    </p>
                </div>
                <div>
                    <h4 className="font-serif-display font-medium text-slate-900 dark:text-white mb-6">Product</h4>
                    <ul className="space-y-3">
                        <li><button onClick={() => handleNavigate('home')} className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Signature Generator</button></li>
                        <li><button onClick={() => handleNavigate('blog')} className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Blog</button></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-serif-display font-medium text-slate-900 dark:text-white mb-6">Company</h4>
                    <ul className="space-y-3">
                        <li><button onClick={() => handleNavigate('about')} className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">About Us</button></li>
                        <li><button onClick={() => handleNavigate('contact')} className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Contact</button></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-serif-display font-medium text-slate-900 dark:text-white mb-6">Legal</h4>
                    <ul className="space-y-3">
                        <li><button onClick={() => handleNavigate('privacy')} className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Privacy Policy</button></li>
                        <li><button onClick={() => handleNavigate('terms')} className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Terms & Conditions</button></li>
                    </ul>
                </div>
            </div>
            <div className="border-t border-gray-100 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-xs text-gray-400">© 2025 handwrittensignaturegenerator.org</p>
            </div>
        </div>
      </footer>

      {/* Document Signer Modal */}
      {docData.isOpen && docData.signatureImage && (
          <DocumentSigner 
            signatureImage={docData.signatureImage} 
            onClose={() => setDocData({ isOpen: false, signatureImage: null })}
            onShowToast={showToast}
          />
      )}

      {/* Signature Gallery Modal */}
      <SignatureGallery
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        signatures={savedSignatures}
        onLoad={handleLoadSignature}
        onDelete={handleDeleteSignature}
      />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

export default App;