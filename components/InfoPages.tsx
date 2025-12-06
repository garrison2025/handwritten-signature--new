import React, { useEffect } from 'react';
import { Shield, Mail, Lock, FileText, ArrowLeft } from 'lucide-react';
import { AppView } from '../types';
import SEO from './SEO';

interface PageProps {
    onNavigate: (view: AppView) => void;
}

const PageLayout: React.FC<{ 
    title: string; 
    subtitle?: string; 
    children: React.ReactNode; 
    onNavigate: (view: AppView) => void 
}> = ({ title, subtitle, children, onNavigate }) => {
    
    useEffect(() => {
        try {
            window.scrollTo(0, 0);
        } catch(e) { /* ignore */ }
    }, []);

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <button 
                onClick={() => onNavigate('home')} 
                className="flex items-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-8 group text-sm font-medium"
            >
                <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Generator
            </button>

            <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] sm:rounded-[2rem] shadow-sm border border-gray-100 dark:border-slate-800 p-6 sm:p-12 lg:p-16">
                <header className="mb-10 sm:mb-12 border-b border-gray-100 dark:border-slate-800 pb-8 sm:pb-10">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif-display text-slate-900 dark:text-white mb-4 leading-tight">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 font-light max-w-2xl leading-relaxed">
                            {subtitle}
                        </p>
                    )}
                </header>

                <div className="prose prose-slate dark:prose-invert prose-lg max-w-none prose-headings:font-serif-display prose-headings:font-medium prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline">
                    {children}
                </div>
            </div>
        </div>
    );
};

export const AboutPage: React.FC<PageProps> = ({ onNavigate }) => (
    <>
        <SEO title="About Us" description="Learn about SignCraft's mission to provide secure, client-side signature generation tools." slug="about" />
        <PageLayout 
            title="About Us" 
            subtitle="Crafting digital authenticity in an artificial world." 
            onNavigate={onNavigate}
        >
            <p>
                Welcome to <strong>HandwrittenSignatureGenerator.org</strong>. In a digital landscape increasingly dominated by generic automation and AI-generated content, we stand for the preservation of personal identity and the human touch.
            </p>

            <h3>Our Mission</h3>
            <p>
                Our mission is simple: to provide professionals, creatives, and individuals with a tool to create professional digital signatures without compromising their privacy. We believe that your signature is a unique identifier—an artifact of your personality—and it should not be stored on a remote server or processed by opaque algorithms.
            </p>

            <h3>Why We Are Different</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose my-10">
                <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <Shield className="w-8 h-8 text-slate-900 dark:text-white mb-4" />
                    <h4 className="font-bold text-slate-900 dark:text-white mb-2">Zero-Knowledge Privacy</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        We built SignCraft with a "Client-Side First" architecture. Your keystrokes and drawings never leave your browser.
                    </p>
                </div>
                <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <FileText className="w-8 h-8 text-slate-900 dark:text-white mb-4" />
                    <h4 className="font-bold text-slate-900 dark:text-white mb-2">Vector Precision</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        Unlike basic tools that output blurry images, we rely on advanced SVG vector paths for crisp scaling.
                    </p>
                </div>
            </div>

            <h3>The Technology</h3>
            <p>
                HandwrittenSignatureGenerator.org utilizes advanced HTML5 Canvas APIs and simulated pressure-sensitivity algorithms. By calculating the velocity of your cursor, we mimic the flow of ink—thickening when you slow down and thinning when you speed up—creating a result that feels indistinguishable from a handwritten signature.
            </p>
        </PageLayout>
    </>
);

export const ContactPage: React.FC<PageProps> = ({ onNavigate }) => (
    <>
        <SEO title="Contact Us" description="Get in touch with the SignCraft team for support, feedback, or inquiries." slug="contact" />
        <PageLayout 
            title="Contact Us" 
            subtitle="We'd love to hear from you. Questions, feedback, or feature requests?" 
            onNavigate={onNavigate}
        >
            <p>
                At <strong>HandwrittenSignatureGenerator.org</strong>, we are constantly striving to improve our tool. Whether you've found a bug, want to request a new font style, or just want to say hello, we are here to listen.
            </p>

            <div className="bg-slate-900 dark:bg-slate-800 text-white p-8 rounded-2xl my-10 not-prose flex flex-col items-center text-center space-y-4 shadow-xl shadow-slate-900/10">
                <div className="bg-white/10 p-3 rounded-full">
                    <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h3 className="text-xl font-medium mb-1">General Inquiries</h3>
                    <p className="text-slate-300 text-sm mb-4">For support, partnerships, or press.</p>
                    <a 
                        href="mailto:info@handwrittensignaturegenerator.org" 
                        className="text-2xl md:text-3xl font-serif-display font-bold hover:text-blue-300 transition-colors break-all"
                    >
                        info@handwrittensignaturegenerator.org
                    </a>
                </div>
            </div>

            <h3>Frequently Asked Topics</h3>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-400">
                <li><strong>Feature Requests:</strong> Do you need a specific pen style or export format?</li>
                <li><strong>Bug Reports:</strong> Is the drawing pad not responding on your specific device?</li>
                <li><strong>Business:</strong> Interested in integrating our signature pad into your workflow?</li>
            </ul>
        </PageLayout>
    </>
);

export const PrivacyPage: React.FC<PageProps> = ({ onNavigate }) => (
    <>
        <SEO title="Privacy Policy" description="Review SignCraft's privacy policy. We prioritize zero-knowledge, client-side processing." slug="privacy" />
        <PageLayout 
            title="Privacy Policy" 
            subtitle={`Effective Date: December 5, 2025`} 
            onNavigate={onNavigate}
        >
            <p>
                Your privacy is critically important to us. At <strong>HandwrittenSignatureGenerator.org</strong> ("we", "us", or "our"), we have a few fundamental principles: we don't ask you for personal information, we don't store your data on our servers, and we don't share your information with anyone.
            </p>

            <h3>1. Information Collection</h3>
            <p>
                <strong>We do not collect any personal data.</strong> The text you type, the signatures you draw, and the settings you choose are processed entirely within your web browser (Client-Side Processing). This data is stored temporarily in your browser's local storage (`localStorage`) solely for your convenience, so you don't lose your work if you refresh the generator page. This data is never transmitted to our servers.
            </p>

            <h3>2. Analytics and Cookies</h3>
            <p>
                We may use anonymous, privacy-focused analytics to understand how our site is used (e.g., total visitor counts). These tools do not track your browsing history across other websites and do not collect personally identifiable information (PII). We do not use advertising cookies.
            </p>

            <h3>3. Data Security</h3>
            <div className="flex items-start gap-4 bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-100 dark:border-green-900/30 not-prose my-6">
                <Lock className="w-6 h-6 text-green-700 dark:text-green-400 flex-shrink-0 mt-1" />
                <div>
                    <h4 className="font-bold text-green-800 dark:text-green-300 text-sm">End-to-End Client Security</h4>
                    <p className="text-green-700 dark:text-green-400 text-sm mt-1">
                        Since no signature data is ever uploaded to the cloud, there is zero risk of your signature being intercepted or leaked from a database breach on our end.
                    </p>
                </div>
            </div>

            <h3>4. Third-Party Links</h3>
            <p>
                Our website may contain links to third-party sites (e.g., social media). We are not responsible for the privacy practices or content of those sites. We encourage you to read the privacy policies of any third-party sites you visit.
            </p>

            <h3>5. Contact Us</h3>
            <p>
                If you have any questions about this Privacy Policy, please contact us at: <a href="mailto:info@handwrittensignaturegenerator.org">info@handwrittensignaturegenerator.org</a>.
            </p>
        </PageLayout>
    </>
);

export const TermsPage: React.FC<PageProps> = ({ onNavigate }) => (
    <>
        <SEO title="Terms & Conditions" description="Terms of service for using the SignCraft signature generator." slug="terms" />
        <PageLayout 
            title="Terms & Conditions" 
            subtitle={`Last Updated: December 5, 2025`} 
            onNavigate={onNavigate}
        >
            <p>
                Please read these Terms and Conditions ("Terms", "Terms and Conditions") carefully before using the <strong>handwrittensignaturegenerator.org</strong> website operated by us.
            </p>

            <h3>1. Acceptance of Terms</h3>
            <p>
                By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the Service.
            </p>

            <h3>2. Intellectual Property of Generated Signatures</h3>
            <p>
                <strong>You own your signature.</strong> We claim no intellectual property rights over the signatures, graphics, or text you generate using our tool. You are free to use the downloaded PNG or SVG files for personal, commercial, legal, or creative purposes without attribution.
            </p>

            <h3>3. Legal Validity and E-Signatures</h3>
            <p>
                This tool generates graphical representations of a signature. The legal validity of an electronic signature is defined by laws such as the <strong><a href="https://www.fdic.gov/resources/supervision-and-examinations/consumer-compliance-examination-manual/documents/10/x-3-1.pdf" target="_blank" rel="nofollow noopener noreferrer">ESIGN Act</a></strong> (U.S.) and <strong><a href="https://www.uniformlaws.org/committees/community-home?CommunityKey=2c04b76c-2b7d-4399-977e-d5876ba7e034" target="_blank" rel="nofollow noopener noreferrer">UETA</a></strong>. 
            </p>
            <p>
                While our signature creator creates the visual component often used in e-signing workflows, the legal binding nature of a signature typically requires additional audit trails, consent, and intent validation which are outside the scope of this image generation tool. We recommend using this tool in conjunction with certified e-signature platforms for high-stakes contracts.
            </p>

            <h3>4. Disclaimer</h3>
            <p>
                The materials on handwrittenSignatureGenerator.org's website are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>

            <h3>5. Limitations</h3>
            <p>
                In no event shall handwrittenSignatureGenerator.org or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on our website.
            </p>

            <h3>6. Governing Law</h3>
            <p>
                These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which the site operator resides, and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
            </p>

            <h3>7. Contact Information</h3>
            <p>
                Questions about the Terms should be sent to us at <a href="mailto:info@handwrittensignaturegenerator.org">info@handwrittensignaturegenerator.org</a>.
            </p>
        </PageLayout>
    </>
);

export const InfoPageWrapper: React.FC<{view: AppView, onNavigate: (view: AppView) => void}> = ({ view, onNavigate }) => {
    switch (view) {
        case 'about': return <AboutPage onNavigate={onNavigate} />;
        case 'contact': return <ContactPage onNavigate={onNavigate} />;
        case 'privacy': return <PrivacyPage onNavigate={onNavigate} />;
        case 'terms': return <TermsPage onNavigate={onNavigate} />;
        default: return null;
    }
};