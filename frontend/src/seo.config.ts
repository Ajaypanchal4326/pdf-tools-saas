export const SITE_URL = "https://pdf-tools-saas-amyc.vercel.app";

export const defaultSEO = {
  title: "PDFTools – Free PDF & Image Tools",
  description:
    "Convert, compress, merge, and extract PDF & image files instantly. 100% browser-based tools with complete privacy.",
  canonical: SITE_URL,
  keywords:
    "pdf tools, convert pdf, image tools, pdf compressor, merge pdf, split pdf, image converter, jpg to png, png to jpg, pdf to image, image to pdf",
  ogImage: `${SITE_URL}/logo.svg`,
};

// 🔥 Page-specific SEO
export const seoPages: Record<
  string,
  { title: string; description: string; canonical: string; keywords: string }
> = {
  "/": {
    title: "PDFTools – Free PDF & Image Converter (Fast & Secure)",
    description:
      "Use 10+ free PDF & image tools to convert, compress, merge, extract, and optimize your files. No upload—100% browser-based.",
    canonical: SITE_URL,
    keywords:
      "pdf tools, online pdf editor, image converter, pdf merger, jpg to png converter",
  },

  "/image-to-pdf": {
    title: "Image to PDF – Convert JPG/PNG/WebP to PDF Online",
    description:
      "Convert multiple JPG, PNG, and WebP images into a single high-quality PDF. Fast, free, 100% secure.",
    canonical: `${SITE_URL}/image-to-pdf`,
    keywords: "image to pdf, jpg to pdf, png to pdf, webp to pdf",
  },

  "/pdf-to-image": {
    title: "PDF to Image – Convert PDF Pages to JPG or PNG",
    description:
      "Extract all PDF pages into high-quality JPG or PNG images. No upload required.",
    canonical: `${SITE_URL}/pdf-to-image`,
    keywords: "pdf to jpg, pdf to png, pdf extractor",
  },

  "/merge-pdf": {
    title: "Merge PDF – Combine Multiple PDFs Online",
    description:
      "Merge multiple PDF files into one single clean document. Free and browser-based.",
    canonical: `${SITE_URL}/merge-pdf`,
    keywords: "merge pdf, pdf combiner, join pdf online",
  },

  "/compress-pdf": {
    title: "PDF Compressor – Reduce PDF Size Online",
    description:
      "Compress PDF size with Low/Medium/High quality optimization. Improve file size instantly.",
    canonical: `${SITE_URL}/compress-pdf`,
    keywords: "compress pdf, reduce pdf size, pdf optimizer",
  },

  "/image-compressor": {
    title: "Image Compressor – Compress JPG/PNG/WebP Online",
    description:
      "Compress images without losing quality. Supports JPG, PNG, WEBP formats.",
    canonical: `${SITE_URL}/image-compressor`,
    keywords: "compress image, reduce jpg size, png compressor, webp compressor",
  },

  "/jpg-to-png": {
    title: "JPG to PNG Converter – Free Online Tool",
    description: "Convert JPG images to PNG while keeping transparency.",
    canonical: `${SITE_URL}/jpg-to-png`,
    keywords: "jpg to png converter, image converter",
  },

  "/png-to-jpg": {
    title: "PNG to JPG Converter – Free Online Tool",
    description: "Convert PNG images to JPG for smaller file sizes.",
    canonical: `${SITE_URL}/png-to-jpg`,
    keywords: "png to jpg converter, image converter",
  },

  "/jpg-to-webp": {
    title: "JPG to WEBP Converter – Reduce Image Size",
    description: "Convert JPG to modern WEBP for 30–70% smaller file sizes.",
    canonical: `${SITE_URL}/jpg-to-webp`,
    keywords: "jpg to webp, image compression",
  },

  "/png-to-webp": {
    title: "PNG to WEBP Converter – Fast & Free",
    description: "Convert PNG images to WEBP for better compression.",
    canonical: `${SITE_URL}/png-to-webp`,
    keywords: "png to webp converter",
  },

  "/webp-to-jpg": {
    title: "WEBP to JPG Converter – Fast & Free",
    description: "Convert WEBP images to JPG format instantly.",
    canonical: `${SITE_URL}/webp-to-jpg`,
    keywords: "webp to jpg converter",
  },

  "/webp-to-png": {
    title: "WEBP to PNG Converter – High Quality",
    description: "Convert WEBP images to PNG losslessly.",
    canonical: `${SITE_URL}/webp-to-png`,
    keywords: "webp to png converter",
  },

  "/extract-pages": {
    title: "PDF Page Extractor – Extract PDF Pages Online",
    description:
      "Select and extract specific PDF pages and export them as a new PDF.",
    canonical: `${SITE_URL}/extract-pages`,
    keywords: "extract pdf pages, pdf splitter, pdf page extractor",
  },
};
