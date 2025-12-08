import React, { useState } from 'react';
import SEOAuto from "../components/SEOAuto";
import { ArrowLeft, Download, Image, Sparkles, FileImage, CheckCircle, X } from 'lucide-react';

interface NotificationProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, type, onClose }) => {
  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <SEOAuto />

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

const WebpToPng: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error'): void => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleFileSelect = (files: File[]): void => {
    const webpFiles = files.filter(file => 
      file.type === 'image/webp'
    );
    
    if (webpFiles.length === 0) {
      showNotification('Please select WEBP files only', 'error');
      return;
    }
    
    setSelectedFiles(webpFiles);
  };

  const handleRemoveFile = (index: number): void => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const convertWebpToPng = (file: File): Promise<Blob> => {
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
          
          // Convert to PNG blob
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Failed to convert image'));
              }
            },
            'image/png'
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
      showNotification('Please select at least one WEBP file', 'error');
      return;
    }

    setIsConverting(true);

    try {
      for (const file of selectedFiles) {
        const pngBlob = await convertWebpToPng(file);
        
        // Create download link
        const url = URL.createObjectURL(pngBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name.replace(/\.webp$/i, '.png');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Small delay between downloads
        if (selectedFiles.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
      
      showNotification(
        `Successfully converted ${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''} to PNG!`,
        'success'
      );
    } catch (error) {
      console.error('Conversion error:', error);
      showNotification('Error converting files. Please try again.', 'error');
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
      {/* Notification */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <a href="/" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </a>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">WEBP to PNG Converter</h1>
              <p className="text-sm text-gray-600 mt-1">
                Convert WEBP images to PNG format with transparency preservation and lossless quality
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
              Step 1: Select WEBP Files
            </h2>
            <div className="border-2 border-dashed border-purple-300 rounded-xl p-8 text-center hover:border-purple-500 transition-colors bg-purple-50">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileImage className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload WEBP Images</h3>
              <p className="text-sm text-gray-600 mb-4">Drag and drop or browse to select WEBP files</p>
              <input
                type="file"
                accept="image/webp"
                multiple
                onChange={(e) => e.target.files && handleFileSelect(Array.from(e.target.files))}
                className="hidden"
                id="webp-png-upload"
              />
              <label
                htmlFor="webp-png-upload"
                className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer font-medium shadow-md hover:shadow-lg"
              >
                Browse WEBP Files
              </label>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <Sparkles className="w-6 h-6 text-purple-600 mr-2" />
              Why Convert WEBP to PNG?
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="text-purple-600 mr-2">✓</span>
                <span><strong>Lossless quality:</strong> PNG preserves every pixel without any compression artifacts</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-600 mr-2">✓</span>
                <span><strong>Full transparency support:</strong> Perfect for logos, icons, and graphics with transparent backgrounds</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-600 mr-2">✓</span>
                <span><strong>Universal editing compatibility:</strong> PNG works seamlessly with all image editing software</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-600 mr-2">✓</span>
                <span><strong>Professional design workflows:</strong> Preferred format for graphic designers and print work</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-600 mr-2">✓</span>
                <span><strong>Wide compatibility:</strong> Supported by all devices, browsers, and design tools</span>
              </li>
            </ul>
          </div>

          {/* File Preview */}
          {selectedFiles.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Step 2: Selected Files ({selectedFiles.length})
              </h2>
              <div className="space-y-2">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                    <div className="flex items-center space-x-3">
                      <Image className="w-5 h-5 text-purple-600" />
                      <span className="text-sm text-gray-700 font-medium truncate">{file.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="text-sm text-red-600 hover:text-red-700 font-medium px-3 py-1 rounded hover:bg-red-50 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Convert Button */}
          {selectedFiles.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Step 3: Convert to PNG
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
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
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
                    <span>Convert to PNG Format</span>
                  </>
                )}
              </button>
            </div>
          )}
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

export default WebpToPng;