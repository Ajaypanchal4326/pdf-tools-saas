import React from 'react';
import {
  FileText,
  Image,
  FilePlus,
  RefreshCw,
  FileImage,
  Zap,
  Shield,
  Clock,
  CheckCircle,
  FileDown,
  Scissors,
} from 'lucide-react';

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ReactElement;
  path: string;
  color: string;
  bgColor: string;
}

const Home: React.FC = () => {
  const tools: Tool[] = [
    // PDF Tools
    {
      id: 'image-to-pdf',
      name: 'Image to PDF',
      description: 'Convert multiple images into a single PDF document.',
      icon: <Image className="w-8 h-8" />,
      path: '/image-to-pdf',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 hover:bg-blue-100',
    },
    {
      id: 'pdf-to-image',
      name: 'PDF to Image',
      description: 'Extract all pages from any PDF as JPG/PNG images.',
      icon: <FileText className="w-8 h-8" />,
      path: '/pdf-to-image',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 hover:bg-purple-100',
    },
    {
      id: 'merge-pdf',
      name: 'Merge PDF',
      description: 'Combine multiple PDF files into one document.',
      icon: <FilePlus className="w-8 h-8" />,
      path: '/merge-pdf',
      color: 'text-green-600',
      bgColor: 'bg-green-50 hover:bg-green-100',
    },
   {
  id: 'pdf-compressor',
  name: 'PDF Compressor',
  description: 'Compress PDF file size (Low / Medium / High quality).',
  icon: <FileDown className="w-8 h-8" />,
  path: '/compress-pdf',   // <-- FIXED
  color: 'text-red-600',
  bgColor: 'bg-red-50 hover:bg-red-100',
},
{
  id: 'pdf-extractor',
  name: 'PDF Page Extractor',
  description: 'Extract selected pages from a PDF into a new file',
  icon: <Scissors className="w-8 h-8" />,
  path: '/pdf-extractor',
  color: 'text-orange-600',
  bgColor: 'bg-orange-50 hover:bg-orange-100',
},

    // Image Tools
    {
      id: 'image-compressor',
      name: 'Image Compressor',
      description: 'Compress JPG/PNG/WebP images without losing clarity.',
      icon: <FileDown className="w-8 h-8" />,
      path: '/image-compressor',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50 hover:bg-yellow-100',
    },
    {
      id: 'jpg-to-png',
      name: 'JPG to PNG',
      description: 'Convert JPG images to PNG format with transparency support.',
      icon: <Image className="w-8 h-8" />,
      path: '/jpg-to-png',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 hover:bg-indigo-100',
    },
    {
      id: 'png-to-jpg',
      name: 'PNG to JPG',
      description: 'Convert PNG images to JPG for smaller file sizes.',
      icon: <RefreshCw className="w-8 h-8" />,
      path: '/png-to-jpg',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50 hover:bg-pink-100',
    },
    {
      id: 'jpg-to-webp',
      name: 'JPG to WEBP',
      description: 'Convert JPG to modern, highly compressed WEBP.',
      icon: <FileImage className="w-8 h-8" />,
      path: '/jpg-to-webp',
      color: 'text-green-600',
      bgColor: 'bg-green-50 hover:bg-green-100',
    },
    {
      id: 'png-to-webp',
      name: 'PNG to WEBP',
      description: 'Convert PNG to WEBP for better web performance.',
      icon: <FileImage className="w-8 h-8" />,
      path: '/png-to-webp',
      color: 'text-teal-600',
      bgColor: 'bg-teal-50 hover:bg-teal-100',
    },
    {
      id: 'webp-to-jpg',
      name: 'WEBP to JPG',
      description: 'Convert WEBP images to universal JPG format.',
      icon: <Image className="w-8 h-8" />,
      path: '/webp-to-jpg',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 hover:bg-blue-100',
    },
    {
      id: 'webp-to-png',
      name: 'WEBP to PNG',
      description: 'Convert WEBP to PNG with lossless quality.',
      icon: <RefreshCw className="w-8 h-8" />,
      path: '/webp-to-png',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 hover:bg-purple-100',
    },
  ];

  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Lightning Fast',
      description: 'Instant file processing with optimized algorithms.',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Private & Secure',
      description: 'No data upload — everything happens in your browser.',
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'No Sign-Up Needed',
      description: 'Use all tools immediately without registration.',
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: 'High Quality Output',
      description: 'Preserve quality even during compression.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Professional PDF & Image Tools
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Convert, merge, compress, and transform files instantly.
            100% free, secure, and super fast.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Choose Your Tool
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <a
                key={tool.id}
                href={tool.path}
                className={`
                  group block p-6 rounded-xl border-2 border-gray-200
                  ${tool.bgColor} transition-all duration-200
                  hover:shadow-lg hover:scale-105 hover:border-transparent
                `}
              >
                <div
                  className={`
                    w-16 h-16 rounded-lg ${tool.bgColor.replace('hover:', '')}
                    flex items-center justify-center mb-4
                    group-hover:scale-110 transition-transform
                  `}
                >
                  <div className={tool.color}>{tool.icon}</div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {tool.name}
                </h3>

                <p className="text-sm text-gray-600">{tool.description}</p>

                <div className="mt-4 flex items-center text-sm font-medium text-blue-600 group-hover:text-blue-700">
                  Get Started
                  <svg
                    className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Why Choose Us?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                  {feature.icon}
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>

                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg mb-6 text-blue-100">
            No registration required. Start converting now!
          </p>

          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
          >
            Choose a Tool
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
