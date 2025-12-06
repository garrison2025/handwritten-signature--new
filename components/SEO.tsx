import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  type?: 'website' | 'article';
  slug?: string;
  author?: string;
  datePublished?: string;
  schemaType?: 'SoftwareApplication' | 'Article' | 'WebSite';
}

const SEO: React.FC<SEOProps> = ({
  title = "SignCraft - Free Handwritten Signature Generator | Type & Draw",
  description = "Create professional handwritten signatures for free. Type or draw realistic signatures. 100% private, client-side processing. Download SVG/PNG instantly.",
  keywords = "signature generator, handwritten signature, online signature, digital signature, svg signature, draw signature, electronic signature, free signature maker, signature creator",
  image = "https://ui-avatars.com/api/?name=Sign+Craft&background=0f172a&color=fff&size=512",
  type = 'website',
  slug = '',
  author = 'SignCraft',
  datePublished,
  schemaType
}) => {
  const siteUrl = 'https://handwrittensignaturegenerator.org';
  const url = `${siteUrl}${slug ? (slug.startsWith('/') ? slug : `/${slug}`) : ''}`;
  const fullTitle = title.includes('SignCraft') ? title : `${title} | SignCraft`;

  // Construct JSON-LD Schema
  let schema = null;

  if (schemaType === 'SoftwareApplication') {
    schema = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "SignCraft",
      "applicationCategory": "DesignApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "ratingCount": "1250"
      },
      "description": description,
      "image": image,
      "url": siteUrl
    };
  } else if (schemaType === 'Article') {
    schema = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": title,
      "image": [image],
      "datePublished": datePublished,
      "author": [{
        "@type": "Person",
        "name": author
      }],
      "publisher": {
        "@type": "Organization",
        "name": "SignCraft",
        "logo": {
          "@type": "ImageObject",
          "url": `${siteUrl}/icon.png` 
        }
      },
      "description": description
    };
  } else {
    schema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "SignCraft",
      "url": siteUrl,
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${siteUrl}/?q={search_term_string}`,
        "query-input": "required name=search_term_string"
      }
    };
  }

  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />

      {/* JSON-LD Schema */}
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

export default SEO;