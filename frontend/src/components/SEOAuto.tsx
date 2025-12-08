import React from "react";
import { useLocation } from "react-router-dom";
import { defaultSEO, seoPages } from "../seo.config";

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
}

const SEOAuto: React.FC<SEOProps> = (props) => {
  const { pathname } = useLocation();

  const seo =
    seoPages[pathname] ??
    {
      title: props.title || defaultSEO.title,
      description: props.description || defaultSEO.description,
      canonical: props.canonical || defaultSEO.canonical,
    };

  return (
    <>
      <title>{seo.title}</title>

      <meta name="description" content={seo.description} />
      <meta name="keywords" content={seo.keywords || defaultSEO.keywords} />

      <link rel="canonical" href={seo.canonical} />

      {/* Open Graph */}
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={seo.canonical} />
      <meta property="og:image" content={defaultSEO.ogImage} />

      {/* No Twitter Card (requested) */}
    </>
  );
};

export default SEOAuto;
