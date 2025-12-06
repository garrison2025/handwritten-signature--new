
import { FontOption, SignatureColor, BlogPost } from './types';

export const FONTS: FontOption[] = [
  // CEO Scribble / Business (Illegible/Fast)
  { name: 'Dr Sugiyama', family: "'Dr Sugiyama', cursive", category: 'scribble' },
  { name: 'Comforter Brush', family: "'Comforter Brush', cursive", category: 'scribble' },
  { name: 'WindSong', family: "'WindSong', cursive", category: 'scribble' },
  { name: 'Monsieur La Doulaise', family: "'Monsieur La Doulaise', cursive", category: 'scribble' },
  { name: 'Mrs Saint Delafield', family: "'Mrs Saint Delafield', cursive", category: 'scribble' },
  { name: 'Qwigley', family: "'Qwigley', cursive", category: 'scribble' },
  { name: 'Reenie Beanie', family: "'Reenie Beanie', cursive", category: 'scribble' },

  // Messy / Natural Handwriting
  { name: 'Waiting for the Sunrise', family: "'Waiting for the Sunrise', cursive", category: 'handwriting' },
  { name: 'Nothing You Could Do', family: "'Nothing You Could Do', cursive", category: 'handwriting' },
  { name: 'Zeyada', family: "'Zeyada', cursive", category: 'handwriting' },
  { name: 'Homemade Apple', family: "'Homemade Apple', cursive", category: 'handwriting' },
  { name: 'Covered By Your Grace', family: "'Covered By Your Grace', cursive", category: 'handwriting' },
  { name: 'Just Me Again Down Here', family: "'Just Me Again Down Here', cursive", category: 'handwriting' },
  { name: 'La Belle Aurore', family: "'La Belle Aurore', cursive", category: 'handwriting' },
  { name: 'Meddon', family: "'Meddon', cursive", category: 'handwriting' },
  
  // Elegant / Cursive
  { name: 'Great Vibes', family: "'Great Vibes', cursive", category: 'elegant' },
  { name: 'Pinyon Script', family: "'Pinyon Script', cursive", category: 'elegant' },
  { name: 'Parisienne', family: "'Parisienne', cursive", category: 'elegant' },
  { name: 'Allura', family: "'Allura', cursive", category: 'elegant' },
  { name: 'Herr Von Muellerhoff', family: "'Herr Von Muellerhoff', cursive", category: 'elegant' },
  { name: 'Alex Brush', family: "'Alex Brush', cursive", category: 'elegant' },
  { name: 'Sacramento', family: "'Sacramento', cursive", category: 'elegant' },
  
  // Casual
  { name: 'Dancing Script', family: "'Dancing Script', cursive", category: 'casual' },
  { name: 'Caveat', family: "'Caveat', cursive", category: 'casual' },
  { name: 'Gloria Hallelujah', family: "'Gloria Hallelujah', cursive", category: 'casual' },
];

export const COLORS: SignatureColor[] = [
  '#0f172a', // Midnight (Almost Black)
  '#1e40af', // Royal Blue
  '#b91c1c', // Classic Crimson
  '#065f46', // Deep Emerald
  '#4b5563', // Steel Gray
  '#4c1d95', // Deep Violet
];

export const PRESET_TEXTS = [
  "James Anderson",
  "Isabella Rossi",
  "Signature",
  "Elizabeth Sterling",
];

export const BLOG_POSTS: BlogPost[] = [
    {
        id: '1',
        title: "Digital Signature vs. Electronic Signature: The Definitive Guide for 2025",
        slug: "digital-signature-vs-electronic-signature",
        summary: "Confused by the terminology? This comprehensive guide explains the legal, technical, and practical differences between electronic signatures and cryptographic digital signatures.",
        date: "December 6, 2025",
        author: "SignCraft Legal Team",
        readTime: "12 min read",
        tags: ["Legal", "Technology", "Business"],
        image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=1000",
        content: `
            <p>In the rapidly evolving landscape of remote work and paperless offices, the act of signing a document has transformed from a physical ritual into a digital necessity. However, as businesses and individuals transition to online workflows, a common point of confusion arises: What is the difference between an <strong>Electronic Signature</strong> and a <strong>Digital Signature</strong>?</p>
            
            <p>While these terms are often used interchangeably in casual conversation, they represent two vastly different concepts with distinct legal implications, technical architectures, and use cases. Whether you are a freelancer signing a contract, an artist protecting your work, or a CEO approving a merger, understanding this distinction is crucial.</p>

            <p>In this extensive guide, we will explore the nuances of e-signatures, the role of a <a href="/">handwritten signature generator</a>, and when you need high-level cryptography versus a simple visual mark.</p>

            <h2>1. What is an Electronic Signature?</h2>
            <p>An <strong>Electronic Signature (e-signature)</strong> is the broad legal category that encompasses almost any electronic sound, symbol, or process attached to or logically associated with a contract or other record and executed or adopted by a person with the intent to sign the record.</p>
            
            <p>Think of the "Electronic Signature" as the umbrella term. It focuses on the <strong>intent</strong> of the signer rather than the specific technology used to capture that intent.</p>

            <h3>Common Forms of Electronic Signatures:</h3>
            <ul>
                <li><strong>Visual Representations:</strong> A scan of your wet-ink signature or a PNG image created by a <strong>handwritten signature generator</strong> like SignCraft.</li>
                <li><strong>Clickwrap Agreements:</strong> Checking a box that says "I Agree" to Terms and Conditions.</li>
                <li><strong>Email Sign-offs:</strong> Simply typing your name at the bottom of an email can legally constitute a signature in many jurisdictions.</li>
                <li><strong>Stylized Typography:</strong> Using a cursive font to represent your name on a digital document.</li>
            </ul>

            <p>The primary function of tools found on <a href="/">handwrittensignaturegenerator.org</a> is to create this visual layer of the electronic signature. By providing a high-quality, transparent image that mimics the nuance of human handwriting, our tool bridges the gap between the cold digital world and the personal touch of a traditional signature.</p>

            <h2>2. What is a Digital Signature?</h2>
            <p>A <strong>Digital Signature</strong> is not just a type of electronic signature; it is a specific technical implementation of one. It relies on a technology called <strong>Public Key Infrastructure (PKI)</strong> to provide the highest levels of security and universal acceptance.</p>

            <p>Unlike a simple image of a signature, a Digital Signature is a "digital fingerprint." It embeds a unique, encrypted code into the document itself. This code is generated using a private key (known only to the signer) and can be verified by anyone using the signer's public key.</p>

            <h3>Key Features of Digital Signatures:</h3>
            <ul>
                <li><strong>Authentication:</strong> It proves that the signer is who they claim to be. This often requires identity verification via a trusted third party known as a Certificate Authority (CA).</li>
                <li><strong>Integrity:</strong> It ensures that the document has not been altered since it was signed. If even a single comma is changed in the PDF after signing, the digital signature becomes invalid.</li>
                <li><strong>Non-repudiation:</strong> The signer cannot easily deny that they signed the document, as the cryptographic evidence is compelling.</li>
            </ul>

            <p>According to <a href="https://www.cisa.gov/news-events/news/understanding-digital-signatures" target="_blank" rel="nofollow noopener noreferrer">CISA (Cybersecurity & Infrastructure Security Agency)</a>, digital signatures are essential for government and high-security communications because they validate the source of the message.</p>

            <h2>3. Legal Frameworks: ESIGN, UETA, and eIDAS</h2>
            <p>To understand the validity of the output from a <strong>handwritten signature generator</strong>, we must look at the legal frameworks governing electronic transactions.</p>

            <h3>The ESIGN Act (United States)</h3>
            <p>Passed in 2000, the <strong>Electronic Signatures in Global and National Commerce Act (ESIGN)</strong> grants electronic signatures the same legal status as handwritten signatures. The <a href="https://www.ftc.gov/legal-library/browse/statutes/electronic-signatures-global-national-commerce-act" target="_blank" rel="nofollow noopener noreferrer">Federal Trade Commission (FTC)</a> outlines that for an electronic signature to be valid, it must demonstrate:</p>
            <ul>
                <li><strong>Intent to Sign:</strong> The user must purposefully generate the signature.</li>
                <li><strong>Consent to do Business Electronically:</strong> All parties must agree to use electronic records.</li>
            </ul>
            <p>This means that an image generated by our tool, when placed on a contract with the intent to be bound by its terms, is legally enforceable in the US for most commercial transactions.</p>

            <h3>eIDAS (European Union)</h3>
            <p>The EU's regulation is stricter, classifying signatures into three levels:</p>
            <ol>
                <li><strong>Simple Electronic Signatures (SES):</strong> This includes scanned images and signatures from a <strong>handwritten signature generator</strong>. Good for general business.</li>
                <li><strong>Advanced Electronic Signatures (AES):</strong> Requires unique links to the signer.</li>
                <li><strong>Qualified Electronic Signatures (QES):</strong> The highest level, legally equivalent to a wet-ink signature, requiring specific hardware tokens.</li>
            </ol>

            <h2>4. When to Use a Handwritten Signature Generator</h2>
            <p>While cryptographic digital signatures offer superior security, they are often overkill—and too expensive—for everyday tasks. This is where a <strong>handwritten signature generator</strong> shines.</p>

            <h3>Ideal Use Cases for Visual Signatures:</h3>
            <ul>
                <li><strong>Personal Branding:</strong> Adding a touch of professionalism to your email footer. A plain text name looks robotic; a stylized signature looks executive.</li>
                <li><strong>Creative Work:</strong> Photographers and digital artists use our tool to sign their artwork (Watermarking) before publishing online.</li>
                <li><strong>HR and Internal Documents:</strong> Signing offer letters, vacation requests, or internal memos where the risk of fraud is low.</li>
                <li><strong>Freelance Contracts:</strong> For standard service agreements, a visual signature indicates valid acceptance and helps the document "feel" official to clients.</li>
            </ul>

            <p>Furthermore, visual signatures provide a psychological benefit. A study on user experience suggests that seeing a handwritten mark increases the perceived authenticity of a document, even if the underlying technology is digital.</p>

            <h2>5. How to Combine Both for Maximum Effect</h2>
            <p>The most professional workflow often involves combining both technologies. You can use <a href="/">handwrittensignaturegenerator.org</a> to create the <em>visual appearance</em> of your signature—the beautiful, transparent PNG—and then upload that image into a secure platform like DocuSign or Adobe Acrobat Sign to handle the cryptographic backend.</p>

            <p>This gives you the best of both worlds: the aesthetic beauty of a custom handwritten signature and the forensic security of a digital certificate.</p>

            <h2>Conclusion</h2>
            <p>In 2025, the line between physical and digital continues to blur. Whether you need a quick signature for a permission slip or a brand asset for your newsletter, a high-quality <strong>handwritten signature generator</strong> is an essential tool in your digital toolkit. It provides the speed, customization, and privacy (client-side processing) that modern professionals demand.</p>
        `
    },
    {
        id: '2',
        title: "The Psychology of a Signature: What Your Handwriting Says About Your Brand",
        slug: "psychology-of-signature-analysis-branding",
        summary: "Your signature is your personal logo. Graphology experts suggest that slant, size, and legibility reveal hidden traits. Learn how to craft a digital signature that projects confidence.",
        date: "December 5, 2025",
        author: "Sarah Jenkins, Graphology Enthusiast",
        readTime: "10 min read",
        tags: ["Graphology", "Design", "Personal Branding"],
        image: "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&q=80&w=1000",
        content: `
            <p>Before the digital age, your signature was your bond. It was a unique bio-metric marker that verified your identity. Today, in a world of pixels and PDFs, your signature has evolved into something else: <strong>Your Personal Logo</strong>.</p>
            
            <p>When you use a <strong>handwritten signature generator</strong> to craft your digital identity, you aren't just choosing a font; you are choosing how you want the world to perceive you. Graphology, the study of handwriting, suggests that the loops, slants, and spacing of a signature communicate subconscious signals about personality, leadership style, and emotional intelligence.</p>

            <p>In this article, we'll dive deep into the psychology of signatures and how you can use <a href="/">SignCraft</a> to engineer a signature that projects the exact image you want.</p>

            <h2>1. The Science of Graphology</h2>
            <p>Graphology has been used for centuries, from analyzing historical manuscripts to screening candidates for employment in France. While some consider it a pseudoscience, there is a general consensus in the design world that specific shapes evoke specific emotions.</p>
            
            <p>According to <a href="https://www.psychologytoday.com/us/basics/handwriting" target="_blank" rel="nofollow noopener noreferrer">Psychology Today</a>, handwriting analysis looks at over 300 different features. However, for a digital signature, we focus on the "Big Three": Size, Slant, and Legibility.</p>

            <h2>2. Size Matters: Confidence vs. Modesty</h2>
            <p>When customizing your signature in our generator, pay attention to the scale relative to the document line.</p>

            <h3>Large Signatures</h3>
            <p>A signature that dominates the page (think John Hancock) signals <strong>confidence, extroversion, and ambition</strong>. It says, "I am here, and I am not afraid to be seen."</p>
            <ul>
                <li><strong>Brand implication:</strong> Great for CEOs, public speakers, and sales leaders.</li>
                <li><strong>How to achieve it:</strong> Use bold, thick stroke settings in the 'Draw' mode of our <strong>handwritten signature generator</strong>.</li>
            </ul>

            <h3>Small Signatures</h3>
            <p>A small, contained signature often indicates <strong>modesty, high concentration, and attention to detail</strong>. It suggests a person who prefers to let their work speak for itself rather than claiming the spotlight.</p>
            <ul>
                <li><strong>Brand implication:</strong> Ideal for researchers, writers, and technical professionals.</li>
                <li><strong>How to achieve it:</strong> Choose a fine 'Monoline' pen style and keep the loops tight.</li>
            </ul>

            <h2>3. Slant and Emotional Availability</h2>
            <p>The angle of your writing is a barometer of your emotional expression.</p>
            
            <ul>
                <li><strong>Right Slant (///):</strong> This is the most common and indicates a person who is <strong>forward-thinking, social, and warm</strong>. It suggests you reach out to the world and are driven by heart and intuition.</li>
                <li><strong>Vertical (|||):</strong> A vertical signature suggests <strong>logic, practicality, and a "head over heart" approach</strong>. You are independent and self-sufficient.</li>
                <li><strong>Left Slant (\\\):</strong> This is rarer and can indicate <strong>introspection, reserve, or skepticism</strong>. You might be someone who analyzes things deeply before committing.</li>
            </ul>
            
            <p><em>Pro Tip: Use the "Slant" slider in the Type Mode of <a href="/">SignCraft</a> to adjust the emotional "temperature" of your signature by +/- 15 degrees.</em></p>

            <h2>4. Legibility: The Transparency Scale</h2>
            <p>One of the most famous examples of signature evolution is that of Steve Jobs. As Apple grew, his signature became increasingly minimalist and lowercase. What does legibility tell us?</p>

            <h3>Highly Legible Signatures</h3>
            <p>If your signature is easy to read (like our <em>'Gloria Hallelujah'</em> font), it suggests <strong>openness and honesty</strong>. You have nothing to hide and you communicate clearly. This is excellent for customer support agents, teachers, and public servants.</p>

            <h3>Illegible / Abstract Signatures</h3>
            <p>A signature that looks like a scribble or a thread (like our <em>'Meddon'</em> or <em>'Monsieur La Doulaise'</em> fonts) often indicates <strong>mental agility and a busy mind</strong>. Many doctors and high-level executives sign this way not just for speed, but because they prioritize big-picture thinking over details. It adds an air of mystery and exclusivity.</p>

            <h2>5. Embellishments: Underlines and Swashes</h2>
            <p>Does your signature have a line underneath it? In graphology, an underline signifies <strong>self-reliance and a need for recognition</strong>. It creates a literal platform for your name to stand on.</p>
            
            <p>Complexity also plays a role. A simple signature suggests a direct, no-nonsense person. A complex signature with many decorative loops (swashes) suggests a person with a flair for the dramatic or high creativity.</p>

            <h2>6. Designing Your Digital Persona</h2>
            <p>Now that you understand the psychology, you can use a <strong>handwritten signature generator</strong> to essentially "fake it 'til you make it." You don't have to use your actual physical signature for every digital interaction.</p>

            <p><strong>Scenario A: The Creative Freelancer</strong><br>
            Use a font like <em>'Caveat'</em> or draw a signature with varying pressure. Make it legible but playful. This invites collaboration.</p>

            <p><strong>Scenario B: The Corporate Lawyer</strong><br>
            Use a font like <em>'Mrs Saint Delafield'</em>. It looks traditional, serious, and established. It conveys authority and heritage.</p>

            <p><strong>Scenario C: The Tech Founder</strong><br>
            Use <em>'Reenie Beanie'</em> or a simple custom drawing. Keep it minimal, perhaps just your initials. This signals efficiency and modernism.</p>

            <h2>Conclusion</h2>
            <p>Your digital signature is a small asset, but it appears on every email you send and every contract you sign. It has thousands of impressions per year. Don't let it be an afterthought. Use the tools at <a href="/">handwrittensignaturegenerator.org</a> to craft a signature that tells the right story about who you are.</p>
        `
    },
    {
        id: '3',
        title: "The Ultimate Guide to Transparent PNG Signatures: Stop Using White Boxes",
        slug: "guide-transparent-background-signature-png",
        summary: "A professional document shouldn't look like a scrapbook. Learn why transparent PNGs are the gold standard for digital signatures and how to use them in Word, PDF, and Gmail.",
        date: "December 4, 2025",
        author: "SignCraft Design Team",
        readTime: "15 min read",
        tags: ["Tutorial", "Productivity", "Tips"],
        image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1000",
        content: `
            <p>We have all received that contract. You know the one: it's a pristine PDF, except for one glaring issue. The signature at the bottom looks like a grainy, gray rectangle with a white background, awkwardly pasted over the signature line, obscuring the text below it.</p>
            
            <p>It looks amateurish. It looks edited. And in some strict legal contexts, it can even raise questions about document integrity.</p>

            <p>The solution is simple: <strong>Transparency</strong>. In this comprehensive guide, we will explain why the Alpha Channel is your best friend and how to use a <strong>handwritten signature generator</strong> to create professional, versatile signature assets for any software.</p>

            <h2>1. The "White Box" Problem</h2>
            <p>Why does this happen? Most people digitize their signature by signing a piece of paper and taking a photo with their phone. The result is a JPEG file.</p>
            
            <p><strong>The technical limitation of JPEG:</strong> The JPEG format does not support transparency. It must have a background color. Even if the paper looks white to you, the camera sensor sees it as "Off-White" or "Light Gray" depending on lighting. When you paste that "Off-White" JPEG onto a "Pure White" Word document, the mismatch is obvious.</p>

            <p>Furthermore, most contracts have a horizontal line (________________) where you need to sign. A JPEG will cover this line up, breaking the visual flow of the document.</p>

            <h2>2. The Solution: PNG with Alpha Channel</h2>
            <p>The PNG (Portable Network Graphics) format supports a feature called the <strong>Alpha Channel</strong>. This allows specific pixels in the image to be defined as "transparent."</p>
            
            <p>When you use <a href="/">SignCraft</a>, our engine generates pixels for the ink strokes (your name) and assigns a transparency value of 100% to everything else. This means:</p>
            <ul>
                <li>You can place the signature <strong>over</strong> lines, and the lines will show through the loops of your letters (like 'l', 'o', 'g').</li>
                <li>You can place the signature on a colored background (like a blue invoice header), and it will blend perfectly.</li>
                <li>It mimics the physics of real ink on paper.</li>
            </ul>

            <h2>3. Step-by-Step Guide: Microsoft Word & Google Docs</h2>
            <p>Once you have downloaded your transparent signature from our <strong>handwritten signature generator</strong>, here is how to insert it correctly.</p>

            <h3>Microsoft Word:</h3>
            <ol>
                <li>Go to <strong>Insert > Pictures</strong> and select your downloaded PNG signature.</li>
                <li><strong>Crucial Step:</strong> Click on the image. Look for the "Layout Options" icon (a small bridge with a rainbow) that appears next to it.</li>
                <li>Select <strong>"In Front of Text"</strong>.</li>
                <li>Now, you can drag the signature freely around the page. Position it right on top of the signature line. The line will remain visible underneath the transparent parts of your signature.</li>
            </ol>
            <p>For more detailed formatting help, refer to <a href="https://support.microsoft.com/en-us/office/insert-a-picture-in-word-powerpoint-or-excel-823a3e79-0b61-45da-9c87-c54d241c306a" target="_blank" rel="nofollow noopener noreferrer">Microsoft Support</a>.</p>

            <h3>Google Docs:</h3>
            <ol>
                <li>Go to <strong>Insert > Image > Upload from computer</strong>.</li>
                <li>Click the image. In the menu below the image, select the icon for <strong>"In front of text"</strong>.</li>
                <li>Resize and drag to position.</li>
            </ol>

            <h2>4. Step-by-Step Guide: Signing PDFs</h2>
            <p>PDFs are the standard for contracts. While you can pay for expensive e-signing platforms, you can often sign simple PDFs for free using the image you generated.</p>

            <h3>Adobe Acrobat Reader (Free Version):</h3>
            <ol>
                <li>Open your PDF.</li>
                <li>Click on the <strong>"Fill & Sign"</strong> tool in the right sidebar.</li>
                <li>Click "Sign" in the top toolbar, then "Add Signature".</li>
                <li>Select <strong>"Image"</strong> and upload your SignCraft PNG.</li>
                <li>Adobe will save this. Now you can just click anywhere in the document to stamp your signature.</li>
            </ol>
            <p>Learn more at the official <a href="https://helpx.adobe.com/acrobat/using/fill-and-sign.html" target="_blank" rel="nofollow noopener noreferrer">Adobe Acrobat User Guide</a>.</p>

            <h3>Mac Preview (macOS):</h3>
            <ol>
                <li>Open the PDF in Preview.</li>
                <li>Click the Markup Toolbar icon (marker tip).</li>
                <li>Click the Signature icon. You can actually create a signature using your trackpad directly, OR you can drag and drop your generated SVG/PNG into the document if you treat it as an image insertion.</li>
            </ol>

            <h2>5. Dark Mode and "White Ink"</h2>
            <p>The digital world is increasingly embracing Dark Mode. A standard black ink signature disappears completely when placed on a dark gray or black background.</p>

            <p>This is why <a href="/">handwrittensignaturegenerator.org</a> includes a specialized <strong>"White Ink"</strong> feature.</p>
            
            <p><strong>Use Cases for White Ink Signatures:</strong></p>
            <ul>
                <li><strong>Website Footers:</strong> Many modern website footers are dark. A white signature adds a personal touch to your portfolio site.</li>
                <li><strong>Photography Watermarks:</strong> If you are watermarking a photo with dark shadows, a white signature is necessary for contrast.</li>
                <li><strong>Dark Mode Emails:</strong> If you want to ensure your signature is visible to recipients using Outlook in Dark Mode, consider using a light gray color or testing how our transparency behaves.</li>
            </ul>

            <h2>6. Vector SVGs: The Professional's Choice</h2>
            <p>While PNGs are great, they are "raster" images made of pixels. If you make them too big, they get blurry. For the ultimate professional quality, you should use the <strong>SVG (Scalable Vector Graphics)</strong> export option in our tool.</p>

            <p>SVGs use math to define the lines, not pixels. This means you can print your signature on a business card or a billboard, and the edges will remain razor-sharp. Graphic designers love SVGs because they can easily change the color of the signature in software like Illustrator or Figma without losing quality.</p>

            <h2>Conclusion</h2>
            <p>Don't let a bad signature image ruin a good first impression. By understanding the power of file formats like PNG and SVG, and utilizing a privacy-focused <strong>handwritten signature generator</strong>, you can ensure that your personal mark looks crisp, authentic, and professional on every device and document.</p>
        `
    }
];