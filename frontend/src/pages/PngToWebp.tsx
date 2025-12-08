import React, { useState } from 'react';
import { ArrowLeft, Download, Image, Sparkles, CheckCircle, X } from 'lucide-react';
import SEOAuto from "../components/SEOAuto";

interface UploadBoxProps {
  onFileSelect: (files: File[]) => void;
  multiple?: boolean;
  title?: string;
  description?: string;
}

const UploadBox: React.FC<UploadBoxProps> = ({ 
  onFileSelect, 
  multiple = true,
  title, 
  description 
}) => {
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files) {
      onFileSelect(Array.from(e.target.files));
    }
  };

  const handleDrop = (e: React.DragEvent): void => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      onFileSelect(Array.from(e.dataTransfer.files));
    }
  };

  return (
    <div
      onDragOver={(e): void => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={(): void => setIsDragging(false)}
      onDrop={handleDrop}
      className={`
        border-2 border-dashed rounded-xl p-8 text-center transition-all
        ${isDragging ? 'border-cyan-500 bg-cyan-50' : 'border-gray-300 bg-white hover:border-cyan-400'}
      `}
    >
      <SEOAuto />

      <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Image className="w-8 h-8 text-cyan-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title || 'Drop PNG images here'}
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        {description || 'or click to browse • PNG files'}
      </p>
      <input
        type="file"
        accept="image/png"
        multiple={multiple}
        onChange={handleFileChange}
        className="hidden"
        id="png-webp-upload"
      />
      <label
        htmlFor="png-webp-upload"
        className="inline-block px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors cursor-pointer font-medium"
      >
        Browse PNG Files
      </label>
    </div>
  );
};

interface NotificationProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, type, onClose }) => {
  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`
        rounded-lg shadow-lg p-4 pr-12 max-w-md
        ${type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}
      `}>
        <div className="flex items-start">
          <CheckCircle className={`w-5 h-5 mr-3 flex-shrink-0 mt-0.5 ${type === 'success' ? 'text-green-600' : 'text-red-600'}`} />
          <div className="flex-1">
            <p className={`text-sm font-medium ${type === 'success' ? 'text-green-900' : 'text-red-900'}`}>
              {message}
            </p>
          </div>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const PngToWebp: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [quality, setQuality] = useState<number>(90);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleFileSelect = (files: File[]): void => {
    setSelectedFiles(files);
  };

  const showNotification = (message: string, type: 'success' | 'error'): void => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const convertPngToWebp = (file: File, quality: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new window.Image();
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }
          
          // Draw the image (preserving transparency)
          ctx.drawImage(img, 0, 0);
          
          // Convert to WebP blob
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Failed to convert image'));
              }
            },
            'image/webp',
            quality / 100 // Convert percentage to decimal
          );
        };
        
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleConvert = async (): Promise<void> => {
    if (selectedFiles.length === 0) {
      showNotification('Please select at least one PNG file', 'error');
      return;
    }

    setIsConverting(true);

    try {
      for (const file of selectedFiles) {
        const webpBlob = await convertPngToWebp(file, quality);
        
        // Create download link
        const url = URL.createObjectURL(webpBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name.replace(/\.png$/i, '.webp');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Small delay between downloads to prevent browser blocking
        if (selectedFiles.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
      
      showNotification(
        `Successfully converted ${selectedFiles.length} PNG file${selectedFiles.length > 1 ? 's' : ''} to WebP!`,
        'success'
      );
    } catch (error) {
      console.error('Conversion error:', error);
      showNotification('An error occurred during conversion. Please try again.', 'error');
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <a href="/" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </a>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">PNG to WebP</h1>
              <p className="text-sm text-gray-600 mt-1">
                Convert PNG images to WebP with transparency support
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Upload Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Step 1: Upload PNG Files
            </h2>
            <UploadBox
              onFileSelect={handleFileSelect}
              multiple={true}
              title="Upload PNG Images"
              description="Select one or more PNG files"
            />
          </div>

          {/* Benefits Info */}
          <div className="bg-cyan-50 border-l-4 border-cyan-400 p-4">
            <div className="flex">
              <Sparkles className="h-5 w-5 text-cyan-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-cyan-900 mb-1">
                  WebP with Transparency Support
                </h3>
                <p className="text-sm text-cyan-800">
                  Unlike JPG, WebP maintains PNG transparency while achieving 26% smaller file sizes on average. 
                  Perfect for logos, icons, and graphics that need transparent backgrounds. WebP offers better 
                  compression than PNG without quality loss.
                </p>
              </div>
            </div>
          </div>

          {/* File Preview */}
          {selectedFiles.length > 0 && (
            <>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Step 2: Selected Files ({selectedFiles.length})
                </h2>
                <div className="space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="p-3 bg-cyan-50 rounded-lg border border-cyan-200">
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quality Selector */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Step 3: Adjust Quality (Optional)
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      Quality: {quality}%
                    </label>
                    <span className="text-xs text-gray-500">
                      {quality >= 90 ? 'Best Quality' : quality >= 75 ? 'Balanced' : 'Max Compression'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="100"
                    value={quality}
                    onChange={(e): void => setQuality(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Smaller Size</span>
                    <span>Better Quality</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Convert Button */}
          {selectedFiles.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Step 4: Convert to WebP
              </h2>
              <button
                type="button"
                onClick={handleConvert}
                disabled={isConverting}
                className={`
                  w-full py-4 px-6 rounded-lg font-semibold text-white
                  flex items-center justify-center space-x-2
                  transition-all duration-200 shadow-md hover:shadow-lg
                  ${isConverting 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-cyan-600 hover:bg-cyan-700'
                  }
                `}
              >
                {isConverting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Converting...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    <span>Convert to WebP</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* How it works */}
          <div className="bg-cyan-50 rounded-xl border border-cyan-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              How it works:
            </h3>
            <ol className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="font-semibold text-cyan-600 mr-2">1.</span>
                <span>Upload PNG images with or without transparency</span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold text-cyan-600 mr-2">2.</span>
                <span>Optionally adjust quality slider (90% recommended for best results)</span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold text-cyan-600 mr-2">3.</span>
                <span>Download WebP files with preserved transparency and smaller size</span>
              </li>
            </ol>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default PngToWebp;