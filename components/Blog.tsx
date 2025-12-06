
import React, { useEffect, useState, useMemo } from 'react';
import { ArrowLeft, Calendar, Clock, Tag, Share2, ArrowRight, List } from 'lucide-react';
import { BlogPost, AppView } from '../types';
import { BLOG_POSTS } from '../constants';

interface BlogProps {
    view: AppView;
    activeSlug: string | null;
    onNavigate: (view: AppView, slug?: string) => void;
    onShowToast: (message: string, type: 'success' | 'info') => void;
}

const Blog: React.FC<BlogProps> = ({ view, activeSlug, onNavigate, onShowToast }) => {
    
    // Reading Progress State
    const [readingProgress, setReadingProgress] = useState(0);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [view, activeSlug]);

    // Reading Progress Logic
    useEffect(() => {
        if (view !== 'blog-post') return;

        const updateProgress = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (docHeight > 0) {
                const progress = (scrollTop / docHeight) * 100;
                setReadingProgress(Math.min(100, Math.max(0, progress)));
            }
        };

        window.addEventListener('scroll', updateProgress);
        return () => window.removeEventListener('scroll', updateProgress);
    }, [view]);

    const handleShare = async (post: BlogPost) => {
        const url = `https://handwrittensignaturegenerator.org/blog/${post.slug}`;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: post.title,
                    text: post.summary,
                    url: url,
                });
            } catch (err) {
                // ignore share error
            }
        } else {
            await navigator.clipboard.writeText(url);
            onShowToast("Article link copied to clipboard", "success");
        }
    };

    const safePosts = Array.isArray(BLOG_POSTS) ? BLOG_POSTS : [];

    // Inject IDs into HTML content for Table of Contents linkage
    const processContent = (content: string) => {
        // Simple regex to add ID to H2 and H3 tags
        let counter = 0;
        const processed = content.replace(/<h([23])>(.*?)<\/h\1>/g, (match, level, text) => {
            const id = `heading-${counter++}`;
            return `<h${level} id="${id}">${text}</h${level}>`;
        });
        return { html: processed, totalHeadings: counter };
    };

    // Extract Table of Contents from HTML
    const extractTOC = (content: string) => {
        const headings: { id: string; text: string; level: number }[] = [];
        let counter = 0;
        // Match both H2 and H3
        const regex = /<h([23])>(.*?)<\/h\1>/g;
        let match;
        while ((match = regex.exec(content)) !== null) {
            // Remove HTML tags from header text (e.g. <strong>)
            const cleanText = match[2].replace(/<[^>]*>/g, "");
            headings.push({
                id: `heading-${counter++}`,
                text: cleanText,
                level: parseInt(match[1])
            });
        }
        return headings;
    };

    // SINGLE POST VIEW
    if (view === 'blog-post' && activeSlug) {
        const post = safePosts.find(p => p.slug === activeSlug);
        
        if (!post) {
            return (
                <div className="max-w-4xl mx-auto py-20 text-center animate-in fade-in duration-500">
                    <h2 className="text-2xl font-serif-display text-slate-900 mb-2">Article not found</h2>
                    <p className="text-slate-500 mb-6">The article you are looking for does not exist or has been moved.</p>
                    <button 
                        onClick={() => onNavigate('blog')}
                        className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                    >
                        Return to Blog
                    </button>
                </div>
            );
        }

        const processedContent = useMemo(() => processContent(post.content), [post.content]);
        const toc = useMemo(() => extractTOC(post.content), [post.content]);

        return (
            <div className="relative pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Reading Progress Bar */}
                <div 
                    className="reading-progress-bar" 
                    style={{ transform: `scaleX(${readingProgress / 100})` }} 
                />

                <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-12">
                    {/* Main Content */}
                    <main className="lg:w-3/4">
                        <button 
                            onClick={() => onNavigate('blog')} 
                            className="flex items-center text-slate-500 hover:text-slate-900 transition-colors mb-8 group text-sm font-medium"
                        >
                            <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                            Back to Articles
                        </button>

                        <article>
                            <header className="mb-10">
                                <div className="flex flex-wrap items-center gap-4 text-xs font-medium uppercase tracking-wider text-slate-400 mb-4">
                                    <span className="flex items-center gap-1"><Calendar size={12} /> {post.date}</span>
                                    <span className="flex items-center gap-1"><Clock size={12} /> {post.readTime}</span>
                                </div>
                                <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif-display text-slate-900 mb-6 leading-tight">
                                    {post.title}
                                </h1>
                                <div className="flex items-center justify-between border-b border-gray-100 pb-8">
                                    <div className="text-sm font-medium text-slate-600">
                                        By <span className="text-slate-900">{post.author}</span>
                                    </div>
                                    <button 
                                        onClick={() => handleShare(post)}
                                        className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors text-sm"
                                    >
                                        <Share2 size={16} />
                                        Share
                                    </button>
                                </div>
                            </header>

                            {post.image && (
                                <div className="mb-10 rounded-2xl overflow-hidden shadow-lg border border-gray-100">
                                    <img 
                                        src={post.image} 
                                        alt={post.title} 
                                        loading="lazy"
                                        decoding="async"
                                        className="w-full h-[300px] sm:h-[400px] object-cover hover:scale-105 transition-transform duration-700"
                                    />
                                </div>
                            )}

                            <div 
                                className="prose prose-slate prose-lg max-w-none prose-headings:font-serif-display prose-headings:font-medium prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl"
                                dangerouslySetInnerHTML={{ __html: processedContent.html }}
                            />

                            <div className="mt-12 pt-8 border-t border-gray-100">
                                <div className="flex flex-wrap gap-2">
                                    {post.tags.map(tag => (
                                        <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                                            <Tag size={10} className="mr-1.5" />
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </article>
                    </main>

                    {/* Sidebar Table of Contents (Desktop) */}
                    <aside className="hidden lg:block lg:w-1/4">
                        <div className="sticky top-24">
                            <h4 className="flex items-center gap-2 font-serif-display text-slate-900 font-medium mb-4 text-lg">
                                <List size={20} />
                                Table of Contents
                            </h4>
                            <nav className="space-y-1 border-l-2 border-gray-100 pl-4">
                                {toc.map((heading) => (
                                    <a 
                                        key={heading.id} 
                                        href={`#${heading.id}`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            document.getElementById(heading.id)?.scrollIntoView({ behavior: 'smooth' });
                                        }}
                                        className={`block text-sm py-1.5 transition-colors duration-200 border-l-2 -ml-[18px] pl-4 ${heading.level === 3 ? 'ml-2 text-slate-400 hover:text-slate-700' : 'text-slate-500 hover:text-blue-600 hover:border-blue-500 border-transparent'}`}
                                    >
                                        {heading.text}
                                    </a>
                                ))}
                            </nav>
                        </div>
                    </aside>
                </div>
            </div>
        );
    }

    // BLOG INDEX VIEW
    return (
        <div className="max-w-6xl mx-auto animate-in fade-in duration-700 pb-20">
            <header className="text-center max-w-2xl mx-auto mb-16">
                <h1 className="text-4xl md:text-5xl font-serif-display text-slate-900 mb-4">SignCraft Blog</h1>
                <p className="text-lg text-slate-500 font-light">
                    Insights on digital identity, design tips, and productivity hacks for the paperless world.
                </p>
            </header>

            {safePosts.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
                    <p className="text-slate-500">No articles available at the moment. Check back soon!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {safePosts.map(post => (
                        <div 
                            key={post.id} 
                            className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 overflow-hidden flex flex-col h-full cursor-pointer"
                            onClick={() => onNavigate('blog-post', post.slug)}
                        >
                            {post.image && (
                                <div className="w-full h-48 overflow-hidden bg-gray-100">
                                    <img 
                                        src={post.image} 
                                        alt={post.title} 
                                        loading="lazy"
                                        decoding="async"
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                </div>
                            )}
                            <div className="p-8 flex-grow flex flex-col">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{post.tags[0]}</span>
                                    <span className="text-xs text-slate-400">{post.readTime}</span>
                                </div>
                                <h2 className="text-2xl font-serif-display text-slate-900 mb-3 group-hover:text-blue-700 transition-colors leading-snug">
                                    {post.title}
                                </h2>
                                <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-3">
                                    {post.summary}
                                </p>
                                <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                                    <span className="text-xs font-medium text-slate-500">{post.date}</span>
                                    <span className="text-blue-600 group-hover:translate-x-1 transition-transform">
                                        <ArrowRight size={18} />
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Blog;
