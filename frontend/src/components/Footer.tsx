import React from "react";
import { FileText, Mail, Twitter, Linkedin, Github } from "lucide-react";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const pdfToolsLinks = [
    { name: "Image to PDF", href: "/image-to-pdf" },
    { name: "PDF to Image", href: "/pdf-to-image" },
    { name: "Merge PDF", href: "/merge-pdf" },
    { name: "Compress PDF", href: "/compress-pdf" },
    { name: "PDF Page Extractor", href: "/pdf-extractor" },
  ];

  const imageConvertersLinks = [
    { name: "Image Compressor", href: "/image-compressor" },
    { name: "JPG to PNG", href: "/jpg-to-png" },
    { name: "PNG to JPG", href: "/png-to-jpg" },
    { name: "JPG to WEBP", href: "/jpg-to-webp" },
    { name: "WEBP to JPG", href: "/webp-to-jpg" },
    { name: "PNG to WEBP", href: "/png-to-webp" },
    { name: "WEBP to PNG", href: "/webp-to-png" },
  ];

  const legalLinks = [
    { name: "Privacy Policy", href: "/About" },
    { name: "FAQ", href: "/FAQ" },
    { name: "About", href: "/About" },
  ];

  const socialLinks = [
    { name: "Twitter", icon: <Twitter className="w-5 h-5" />, href: "#" },
    { name: "LinkedIn", icon: <Linkedin className="w-5 h-5" />, href: "#" },
    { name: "GitHub", icon: <Github className="w-5 h-5" />, href: "#" },
  ];

  const seoKeywords = [
    "online pdf editor",
    "free pdf tools",
    "jpg to png converter",
    "png to jpg converter",
    "webp converter online",
    "pdf compressor",
    "merge pdf",
    "image to pdf online",
    "pdf page extractor",
  ];

  return (
    <footer className="bg-white border-t border-gray-200">

      {/* TOP CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">

          {/* BRAND SECTION */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-3">
              <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">
                PDF<span className="text-blue-600">Tools</span>
              </span>
            </Link>

            <p className="text-gray-600 text-sm leading-relaxed mb-3">
              Simple, fast & secure PDF and image tools.  
              Everything runs in your browser — nothing stored.
            </p>

            <div className="flex space-x-3 mt-2">
              {socialLinks.map((s, i) => (
                <a key={i} href={s.href} className="text-gray-500 hover:text-blue-600">
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* PDF Tools */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">
              PDF Tools
            </h3>
            <ul className="space-y-2">
              {pdfToolsLinks.map((link, index) => (
                <li key={index}>
                  <Link to={link.href} className="text-gray-600 hover:text-blue-600 text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Image Tools */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">
              Image Tools
            </h3>
            <ul className="space-y-2">
              {imageConvertersLinks.map((link, index) => (
                <li key={index}>
                  <Link to={link.href} className="text-gray-600 hover:text-blue-600 text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">
              Legal
            </h3>
            <ul className="space-y-2">
              {legalLinks.map((link, index) => (
                <li key={index}>
                  <Link to={link.href} className="text-gray-600 hover:text-blue-600 text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* NEWSLETTER + SEO */}
      <div className="border-t border-gray-100 px-6 py-8">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-6">

          {/* Newsletter */}
          <div>
            <h3 className="text-gray-900 font-semibold text-sm mb-1">Stay Updated</h3>
            <p className="text-gray-600 text-sm mb-3">Weekly updates & new tools.</p>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  placeholder="Your email"
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg"
                />
              </div>
              <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Subscribe
              </button>
            </div>
          </div>

          {/* SEO Keywords */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 h-fit">
            <h4 className="font-semibold text-gray-900 text-sm mb-2">SEO Keywords</h4>
            <p className="text-gray-600 text-xs leading-relaxed">
              {seoKeywords.join(", ")}.
            </p>
          </div>
        </div>
      </div>

      {/* FOOTER BOTTOM */}
      <div className="border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row justify-between text-sm text-gray-600">
          <p>© {currentYear} PDFTools. - Your PDF Helper</p>
          
        </div>
      </div>

    </footer>
  );
};

export default Footer;
