import React, { useState } from 'react';
import {
  Menu,
  X,
  FileText,
  Image,
  File,
  Wand2,
  RefreshCw,
  FileImage,
} from 'lucide-react';
import { Link } from "react-router-dom";

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const pdfTools = [
    { name: 'Image to PDF', icon: <FileText className="w-4 h-4" />, href: '/image-to-pdf' },
    { name: 'PDF to Image', icon: <Image className="w-4 h-4" />, href: '/pdf-to-image' },
    { name: 'Merge PDF', icon: <Wand2 className="w-4 h-4" />, href: '/merge-pdf' },
    { name: 'PDF Compressor', icon: <File className="w-4 h-4" />, href: '/compress-pdf' },
    { name: 'PDF Page Extractor', icon: <FileText className="w-4 h-4" />, href: '/pdf-extractor' },
  ];

  const imageTools = [
    { name: 'JPG to PNG', icon: <Image className="w-4 h-4" />, href: '/jpg-to-png' },
    { name: 'PNG to JPG', icon: <RefreshCw className="w-4 h-4" />, href: '/png-to-jpg' },
    { name: 'JPG to WEBP', icon: <FileImage className="w-4 h-4" />, href: '/jpg-to-webp' },
    { name: 'WEBP to JPG', icon: <Image className="w-4 h-4" />, href: '/webp-to-jpg' },
    { name: 'PNG to WEBP', icon: <FileImage className="w-4 h-4" />, href: '/png-to-webp' },
    { name: 'WEBP to PNG', icon: <RefreshCw className="w-4 h-4" />, href: '/webp-to-png' },
    { name: 'Image Compressor', icon: <File className="w-4 h-4" />, href: '/image-compressor' },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">
                PDF<span className="text-blue-600">Tools</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 absolute left-1/2 transform -translate-x-1/2">

            {/* Tools Dropdown */}
            <div className="relative group">
              <button className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 font-medium flex items-center">
                Tools
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown */}
              <div className="absolute left-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="p-4 grid grid-cols-2 gap-4">

                  {/* PDF Tools */}
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase mb-2 px-2">PDF Tools</div>
                    <div className="space-y-1">
                      {pdfTools.map((tool, index) => (
                        <Link
                          key={index}
                          to={tool.href}
                          className="flex items-center px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-150"
                        >
                          <span className="mr-3 text-blue-600">{tool.icon}</span>
                          <span className="font-medium text-sm">{tool.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Image Tools */}
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase mb-2 px-2">Image Converters</div>
                    <div className="space-y-1">
                      {imageTools.map((tool, index) => (
                        <Link
                          key={index}
                          to={tool.href}
                          className="flex items-center px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-150"
                        >
                          <span className="mr-3 text-blue-600">{tool.icon}</span>
                          <span className="font-medium text-sm">{tool.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* FAQ & About */}
            <Link to="/faq" className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 font-medium">
              FAQ
            </Link>

            <Link to="/about" className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 font-medium">
              About
            </Link>
          </div>

          {/* Spacer */}
          <div className="hidden md:block w-10"></div>

          {/* Mobile Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="space-y-1">

              {/* PDF Tools */}
              <div className="px-3 py-2 text-sm font-semibold text-gray-500 uppercase">PDF Tools</div>
              {pdfTools.map((tool, index) => (
                <Link
                  key={index}
                  to={tool.href}
                  className="flex items-center px-3 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                >
                  <span className="mr-3 text-blue-600">{tool.icon}</span>
                  <span className="font-medium">{tool.name}</span>
                </Link>
              ))}

              {/* Image Tools */}
              <div className="px-3 py-2 text-sm font-semibold text-gray-500 uppercase mt-4">Image Converters</div>
              {imageTools.map((tool, index) => (
                <Link
                  key={index}
                  to={tool.href}
                  className="flex items-center px-3 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                >
                  <span className="mr-3 text-blue-600">{tool.icon}</span>
                  <span className="font-medium">{tool.name}</span>
                </Link>
              ))}

              <div className="pt-4 space-y-2">
                <Link
                  to="/faq"
                  className="block px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg font-medium"
                >
                  FAQ
                </Link>

                <Link
                  to="/about"
                  className="block px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg font-medium"
                >
                  About
                </Link>
              </div>

            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
