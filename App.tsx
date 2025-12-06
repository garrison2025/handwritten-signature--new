
import React, { useState, useEffect, Suspense } from 'react';
import { PenTool, Keyboard, Shield, Zap, Layers, Menu, X, Star, Feather } from 'lucide-react';
import TypeMode from './components/TypeMode';
import ColorPicker from './components/ColorPicker';
import Toast from './components/Toast';
import { TabMode, SignatureColor, ToastMessage, AppView } from './types';
import useLocalStorage from './hooks/useLocalStorage';
import { FONTS, BLOG_POSTS } from './constants';

// Code Splitting: Lazy load heavy components
const DrawMode = React.lazy(() => import('./components/DrawMode'));
const Blog = React.lazy(() => import('./components/Blog'));
const InfoPages = React.lazy(() => import('./components/InfoPages').then(module => ({ default: module.InfoPageWrapper })));

// Loading Component
const LoadingSpinner = () => (
    <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
    </div>
);

function App() {
  // Navigation State
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [activeBlogSlug, setActiveBlogSlug] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Use persistent state for Generator
  const [activeTab, setActiveTab] = useLocalStorage<TabMode>('sc_active_tab', 'type');
  const [text, setText] = useLocalStorage<string>('sc_text', '');
  const [color, setColor] = useLocalStorage<SignatureColor>('sc_color', '#0f172a'); // Default to Midnight
  
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Router Logic: Handle Initial Load & PopState
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
              // Default to home for unknown routes (Soft 404 behavior)
              setCurrentView('home');
          }
      };

      // Handle initial load
      handleRoute();

      // Handle browser back/forward
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

  // Dynamic SEO & Title Management Engine
  useEffect(() => {
    const baseTitle = "SignCraft - Free Handwritten Signature Generator";
    const baseUrl = "https://handwrittensignaturegenerator.org";
    
    let title = baseTitle;
    let description = "Create professional, realistic handwritten signatures online. Type to generate or draw your own. Secure, private, and beautifully crafted.";
    let path = "/";
    let articleData = null;
    let ogImage = "https://ui-avatars.com/api/?name=Sign+Craft&background=0f172a&color=fff&size=512";

    switch (currentView) {
        case 'home':
            if (activeTab === 'draw') {
                title = "Draw Signature Online - Realistic Handwriting Pad | SignCraft";
                description = "Free online signature drawing pad. Create realistic handwritten signatures with pressure sensitivity. Export as vector SVG or transparent PNG.";
            } else {
                title = "Type Your Signature Online - Free Generator | SignCraft";
                description = "Generate professional signatures by typing. Choose from 20+ handwritten fonts. Customize slant, color, and style. No AI, 100% Client-side.";
            }
            path = "/";
            break;
        case 'about':
            title = "About Us - SignCraft Mission & Privacy";
            description = "Learn about SignCraft's mission to protect digital identity with secure, client-side signature generation technology.";
            path = "/about";
            break;
        case 'contact':
            title = "Contact Us - SignCraft Support";
            description = "Get in touch with the SignCraft team for feature requests, bug reports, or partnership inquiries.";
            path = "/contact";
            break;
        case 'privacy':
            title = "Privacy Policy - SignCraft";
            description = "We value your privacy. SignCraft operates entirely in your browser. No signature data is ever sent to a server.";
            path = "/privacy";
            break;
        case 'terms':
            title = "Terms & Conditions - SignCraft";
            description = "Read our Terms and Conditions regarding the usage of generated signatures and intellectual property.";
            path = "/terms";
            break;
        case 'blog':
            title = "SignCraft Blog - Digital Identity & Productivity Tips";
            description = "Explore articles on electronic signatures, graphology, and design tips for the modern professional.";
            path = "/blog";
            break;
        case 'blog-post':
            if (activeBlogSlug) {
                const post = BLOG_POSTS.find(p => p.slug === activeBlogSlug);
                if (post) {
                    title = `${post.title} | SignCraft Blog`;
                    description = post.summary;
                    path = `/blog/${activeBlogSlug}`;
                    if (post.image) ogImage = post.image;
                    
                    // Safe Date Parsing
                    let safeDate = new Date().toISOString().split('T')[0];
                    try {
                        safeDate = new Date(post.date).toISOString().split('T')[0];
                    } catch (e) {
                        console.warn("Date parsing error", e);
                    }

                    // Article Structured Data
                    articleData = {
                        "@context": "https://schema.org",
                        "@type": "Article",
                        "headline": post.title,
                        "description": post.summary,
                        "image": post.image || "https://ui-avatars.com/api/?name=SC&background=0f172a&color=fff&size=1024",
                        "datePublished": safeDate,
                        "author": {
                            "@type": "Organization",
                            "name": post.author
                        },
                        "publisher": {
                            "@type": "Organization",
                            "name": "SignCraft",
                            "logo": {
                                "@type": "ImageObject",
                                "url": "https://ui-avatars.com/api/?name=Sign+Craft&background=0f172a&color=fff&size=512"
                            }
                        }
                    };
                }
            }
            break;
    }

    // Update Document Title
    document.title = title;

    // Helper to update or create meta tag safely
    const updateMeta = (name: string, content: string, property?: string) => {
        try {
            let element: Element | null = null;
            if (name) element = document.querySelector(`meta[name="${name}"]`);
            if (!element && property) element = document.querySelector(`meta[property="${property}"]`);
            
            if (!element) {
                element = document.createElement('meta');
                if (name) element.setAttribute('name', name);
                if (property) element.setAttribute('property', property);
                document.head.appendChild(element);
            }
            element.setAttribute('content', content || '');
        } catch (e) {
            console.error('Error updating meta tag', e);
        }
    };

    updateMeta('description', description);
    updateMeta('', title, 'og:title');
    updateMeta('', description, 'og:description');
    updateMeta('', baseUrl + (path === '/' ? '' : path), 'og:url');
    updateMeta('', ogImage, 'og:image');
    updateMeta('robots', 'index, follow');

    // Update Canonical Link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', baseUrl + (path === '/' ? '' : path));

    // Handle Article Schema Injection
    try {
        const existingSchema = document.getElementById('json-ld-article');
        if (existingSchema) existingSchema.remove();

        if (articleData) {
            const script = document.createElement('script');
            script.type = 'application/ld+json';
            script.id = 'json-ld-article';
            script.text = JSON.stringify(articleData);
            document.head.appendChild(script);
        }
    } catch (e) {
        console.warn('Error injecting schema', e);
    }

  }, [currentView, activeTab, activeBlogSlug]);

  const handleNavigate = (view: AppView, slug?: string) => {
      // If we are already on this view/slug, do nothing
      if (view === currentView && slug === activeBlogSlug) return;
      
      setCurrentView(view);
      if (slug) setActiveBlogSlug(slug);
      else setActiveBlogSlug(null);
      
      setIsMobileMenuOpen(false);
      
      // Push State
      let path = '/';
      if (view !== 'home') path = `/${view}`;
      if (view === 'blog-post' && slug) path = `/blog/${slug}`;
      
      try {
          // Check for blob protocol to avoid SecurityError in preview environments
          if (window.location.protocol !== 'blob:') {
             window.history.pushState({ view, slug }, '', path);
          }
          window.scrollTo(0, 0);
      } catch (e) {
          // Fallback if pushState fails
          console.warn('Navigation state update failed:', e);
      }
  };

  const showToast = (message: string, type: 'success' | 'info') => {
    setToast({ id: Date.now().toString(), message, type });
  };

  const NavLink = ({ view, label }: { view: AppView, label: string }) => (
      <button 
        onClick={() => handleNavigate(view)}
        className={`text-sm font-medium transition-colors ${currentView === view ? 'text-slate-900 font-semibold' : 'text-slate-500 hover:text-slate-900'}`}
      >
        {label}
      </button>
  );

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-slate-900 selection:text-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => handleNavigate('home')} className="flex items-center space-x-2 group">
            <div className="bg-slate-900 text-white p-2 rounded-lg group-hover:scale-105 transition-transform">
              <Feather size={20} />
            </div>
            <span className="text-xl font-serif-display font-semibold tracking-tight text-slate-900">SignCraft</span>
          </button>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-8">
            <NavLink view="home" label="Generator" />
            <NavLink view="blog" label="Blog" />
            <NavLink view="about" label="About" />
            <NavLink view="contact" label="Contact" />
          </nav>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-slate-600"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Nav Dropdown */}
        {isMobileMenuOpen && (
            <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-gray-100 shadow-lg animate-in slide-in-from-top-5 duration-200">
                <div className="flex flex-col p-4 space-y-4">
                    <button onClick={() => handleNavigate('home')} className="text-left font-medium text-slate-700 py-2">Generator</button>
                    <button onClick={() => handleNavigate('blog')} className="text-left font-medium text-slate-700 py-2">Blog</button>
                    <button onClick={() => handleNavigate('about')} className="text-left font-medium text-slate-700 py-2">About Us</button>
                    <button onClick={() => handleNavigate('contact')} className="text-left font-medium text-slate-700 py-2">Contact</button>
                </div>
            </div>
        )}
      </header>

      <main className="flex-grow px-4 sm:px-6 py-8 sm:py-12 bg-[#F8F9FA]">
        {currentView === 'home' ? (
            <div className="max-w-4xl mx-auto">
              {/* Hero */}
              <div className="text-center mb-10 sm:mb-16 space-y-4 sm:space-y-6 animate-in slide-in-from-bottom-4 duration-700">
                <div className="inline-flex items-center gap-1 bg-yellow-50 border border-yellow-100 px-3 py-1 rounded-full mb-2">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-bold text-yellow-700">Excellent 4.9/5 Average Rating</span>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-6xl font-serif-display font-medium text-slate-900 leading-tight">
                  The Art of the <span className="italic text-slate-600">Signature</span>
                </h1>
                <p className="text-base sm:text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed px-4">
                  Experience the most realistic <strong>handwritten signature generator</strong> online. Create a professional, secure digital mark in seconds. 
                  <span className="hidden sm:inline"> Free, purely client-side, and designed for professionals.</span>
                </p>
              </div>

              {/* Main App Container */}
              <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl shadow-slate-200/50 border border-white overflow-hidden relative">
                
                {/* Tab Switcher */}
                <div className="flex border-b border-gray-100">
                  <button
                    onClick={() => setActiveTab('type')}
                    className={`flex-1 py-4 sm:py-5 text-sm font-medium transition-all relative flex items-center justify-center space-x-2 ${
                      activeTab === 'type' ? 'text-slate-900 bg-white' : 'text-slate-400 bg-gray-50 hover:text-slate-600'
                    }`}
                  >
                    <Keyboard size={18} />
                    <span>Type</span>
                    {activeTab === 'type' && (
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-slate-900" />
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('draw')}
                    className={`flex-1 py-4 sm:py-5 text-sm font-medium transition-all relative flex items-center justify-center space-x-2 ${
                      activeTab === 'draw' ? 'text-slate-900 bg-white' : 'text-slate-400 bg-gray-50 hover:text-slate-600'
                    }`}
                  >
                    <PenTool size={18} />
                    <span>Draw</span>
                    {activeTab === 'draw' && (
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-slate-900" />
                    )}
                  </button>
                </div>

                {/* Workspace */}
                <div className="p-4 sm:p-8 md:p-12 min-h-[400px] sm:min-h-[500px] flex flex-col items-center">
                  
                  {/* Color Picker (Global) */}
                  <div className="mb-8">
                    <ColorPicker selectedColor={color} onColorChange={setColor} />
                  </div>

                  {/* Modes */}
                  <div className="w-full relative">
                    {/* Keep TypeMode mounted as it's the primary view */}
                    <div className={activeTab === 'type' ? 'block' : 'hidden'}>
                         <TypeMode text={text} setText={setText} color={color} onShowToast={showToast} />
                    </div>
                    
                    {/* Lazy load DrawMode with Suspense */}
                    <div className={activeTab === 'draw' ? 'block' : 'hidden'}>
                        <Suspense fallback={<LoadingSpinner />}>
                             <DrawMode color={color} isVisible={activeTab === 'draw'} onShowToast={showToast} />
                        </Suspense>
                    </div>
                  </div>
                </div>
              </div>

              {/* SEO Content Section - Magazine Layout */}
              <div className="mt-20 sm:mt-24 grid grid-cols-1 md:grid-cols-12 gap-12 max-w-5xl mx-auto px-2">
                  <div className="md:col-span-4">
                      <h2 className="text-2xl font-serif-display font-medium mb-6">Why Use a <strong>Handwritten Signature Generator</strong>?</h2>
                      <p className="text-slate-500 leading-relaxed text-sm">
                          In the digital age, a professional online signature is essential for branding. SignCraft offers a free, secure, and artistically refined <strong>handwritten signature generator</strong> solution for contracts, emails, and digital art.
                      </p>
                  </div>
                  <div className="md:col-span-8 flex flex-col justify-center space-y-6">
                      <div className="flex items-start gap-4">
                          <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 text-slate-900"><Shield size={20} /></div>
                          <div>
                              <h3 className="font-semibold text-slate-900 text-sm mb-1">Secure & Private</h3>
                              <p className="text-slate-500 text-xs leading-relaxed">Our unique <strong>handwritten signature generator</strong> operates entirely in your browser (Client-Side), ensuring zero data leaks.</p>
                          </div>
                      </div>
                      <div className="flex items-start gap-4">
                          <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 text-slate-900"><Zap size={20} /></div>
                          <div>
                              <h3 className="font-semibold text-slate-900 text-sm mb-1">Instant Vector Export</h3>
                              <p className="text-slate-500 text-xs leading-relaxed">Download Scalable Vector Graphics (SVG) directly from the <strong>handwritten signature generator</strong> for professional printing.</p>
                          </div>
                      </div>
                      <div className="flex items-start gap-4">
                          <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 text-slate-900"><Layers size={20} /></div>
                          <div>
                              <h3 className="font-semibold text-slate-900 text-sm mb-1">Natural Ink Technology</h3>
                              <p className="text-slate-500 text-xs leading-relaxed">Unlike basic tools, this <strong>handwritten signature generator</strong> simulates real ink velocity and pressure for an authentic feel.</p>
                          </div>
                      </div>
                  </div>
              </div>
              
              {/* How to Steps - Cards */}
              <div className="mt-20 border-t border-gray-200 pt-16">
                  <h2 className="text-center text-2xl font-serif-display font-medium mb-12">How to Use the <strong>Handwritten Signature Generator</strong></h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[
                          { title: "1. Choose Your Mode", desc: "Select 'Type' in the handwritten signature generator for a polished font look, or 'Draw' to sketch with your finger/mouse." },
                          { title: "2. Customize Style", desc: "Adjust settings like slant, letter spacing, stroke width, and color within the generator to match your unique brand identity." },
                          { title: "3. Download & Use", desc: "Save your creation as a high-res PNG or SVG. Use the 'White Ink' mode for dark backgrounds." }
                      ].map((step, i) => (
                          <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                              <span className="text-4xl font-serif-display text-gray-100 font-bold mb-4 block">0{i+1}</span>
                              <h3 className="font-semibold text-slate-900 mb-2">{step.title}</h3>
                              <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
                          </div>
                      ))}
                  </div>
              </div>

               {/* SEO Footer - Keyword Injection for Fonts */}
               <div className="mt-20 border-t border-gray-200 pt-10 pb-4 text-center">
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-widest mb-4">Supported Signature Styles</p>
                  <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 max-w-3xl mx-auto">
                      {FONTS.map(f => (
                          <span key={f.name} className="text-[10px] text-gray-400 font-light hover:text-gray-600 transition-colors cursor-default">
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
                    
                    {/* Info Pages mapped via Wrapper */}
                    {(currentView === 'about' || currentView === 'contact' || currentView === 'privacy' || currentView === 'terms') && (
                        <InfoPages view={currentView} onNavigate={handleNavigate} />
                    )}
                </Suspense>
            </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 pt-20 pb-10 mt-12">
        <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 mb-16">
                
                {/* Brand Column */}
                <div className="col-span-1 sm:col-span-2 md:col-span-1 space-y-4">
                    <div className="flex items-center space-x-2">
                        <div className="bg-slate-900 text-white p-1.5 rounded-lg">
                            <Feather size={16} />
                        </div>
                        <span className="text-lg font-serif-display font-semibold tracking-tight text-slate-900">SignCraft</span>
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed">
                        The professional standard for digital identity. The ultimate <strong>handwritten signature generator</strong> for the modern world.
                    </p>
                </div>

                {/* Product Links */}
                <div>
                    <h4 className="font-serif-display font-medium text-slate-900 mb-6">Product</h4>
                    <ul className="space-y-3">
                        <li><button onClick={() => handleNavigate('home')} className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Signature Generator</button></li>
                        <li><button onClick={() => handleNavigate('blog')} className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Blog & Guides</button></li>
                        <li><button onClick={() => setActiveTab('draw')} className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Drawing Pad</button></li>
                    </ul>
                </div>

                {/* Company Links */}
                <div>
                    <h4 className="font-serif-display font-medium text-slate-900 mb-6">Company</h4>
                    <ul className="space-y-3">
                        <li><button onClick={() => handleNavigate('about')} className="text-sm text-slate-500 hover:text-slate-900 transition-colors">About Us</button></li>
                        <li><button onClick={() => handleNavigate('contact')} className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Contact Support</button></li>
                    </ul>
                </div>

                {/* Legal Links */}
                <div>
                    <h4 className="font-serif-display font-medium text-slate-900 mb-6">Legal</h4>
                    <ul className="space-y-3">
                        <li><button onClick={() => handleNavigate('privacy')} className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Privacy Policy</button></li>
                        <li><button onClick={() => handleNavigate('terms')} className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Terms & Conditions</button></li>
                    </ul>
                </div>
            </div>

            <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-xs text-gray-400">
                    © 2025 handwrittensignaturegenerator.org. All rights reserved.
                </p>
                <div className="flex gap-4">
                    <span className="text-xs text-gray-300">Privacy First Architecture</span>
                    <span className="text-xs text-gray-300">•</span>
                    <span className="text-xs text-gray-300">No AI Processing</span>
                </div>
            </div>
        </div>
      </footer>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

export default App;
