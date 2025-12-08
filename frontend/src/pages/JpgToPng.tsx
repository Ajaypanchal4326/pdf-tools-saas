import React, { useState } from 'react';
import { ArrowLeft, Download, Image, X, CheckCircle } from 'lucide-react';
import SEOAuto from "../components/SEOAuto";


interface ConvertedFile {
  name: string;
  url: string;
  size: number;
}

const JpgToPng: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [convertedFiles, setConvertedFiles] = useState<ConvertedFile[]>([]);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleFileSelect = (files: File[]): void => {
    const jpgFiles = files.filter(file => 
      file.type === 'image/jpeg' || file.type === 'image/jpg'
    );
    
    if (jpgFiles.length === 0) {
      showNotification('error', 'Please select JPG or JPEG files only');
      return;
    }
    
    setSelectedFiles(jpgFiles);
    setConvertedFiles([]);
  };

  const handleRemoveFile = (index: number): void => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const convertJpgToPng = async (file: File): Promise<ConvertedFile> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0);

        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Failed to convert image'));
            return;
          }

          const url = URL.createObjectURL(blob);
          const newFileName = file.name.replace(/\.(jpg|jpeg)$/i, '.png');
          
          resolve({
            name: newFileName,
            url: url,
            size: blob.size
          });
        }, 'image/png');
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsDataURL(file);
    });
  };

  const handleConvert = async (): Promise<void> => {
    if (selectedFiles.length === 0) {
      showNotification('error', 'Please select at least one JPG file');
      return;
    }

    setIsConverting(true);
    setConvertedFiles([]);

    try {
      const converted = await Promise.all(
        selectedFiles.map(file => convertJpgToPng(file))
      );
      
      setConvertedFiles(converted);
      showNotification('success', `Successfully converted ${converted.length} file(s) to PNG`);
    } catch (error) {
      showNotification('error', 'Failed to convert one or more files');
      console.error('Conversion error:', error);
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = (file: ConvertedFile): void => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAll = (): void => {
    convertedFiles.forEach((file, index) => {
      setTimeout(() => {
        handleDownload(file);
      }, index * 100);
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOAuto />
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className={`
            flex items-center space-x-3 px-4 py-3 rounded-lg shadow-lg
            ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'}
            text-white
          `}>
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <X className="w-5 h-5" />
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <a href="/" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </a>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">JPG to PNG Converter</h1>
              <p className="text-sm text-gray-600 mt-1">
                Convert JPG and JPEG images to PNG format with transparency support
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
              Step 1: Select JPG Files
            </h2>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-indigo-400 transition-colors">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Image className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload JPG/JPEG Images</h3>
              <p className="text-sm text-gray-600 mb-4">Supports JPG, JPEG formats</p>
              <input
                type="file"
                accept="image/jpeg,image/jpg"
                multiple
                onChange={(e) => e.target.files && handleFileSelect(Array.from(e.target.files))}
                className="hidden"
                id="jpg-upload"
              />
              <label
                htmlFor="jpg-upload"
                className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer font-medium"
              >
                Browse JPG Files
              </label>
            </div>
          </div>

          {/* Info Section */}
          <div className="bg-indigo-50 rounded-xl border border-indigo-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              Important Information
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="text-indigo-600 mr-2">•</span>
                <span><strong>Lossless conversion:</strong> PNG format preserves image quality without compression</span>
              </li>
              <li className="flex items-start">
                <span className="text-indigo-600 mr-2">•</span>
                <span><strong>Transparency support:</strong> PNG supports alpha channel for transparent backgrounds</span>
              </li>
              <li className="flex items-start">
                <span className="text-indigo-600 mr-2">•</span>
                <span><strong>Larger file size:</strong> PNG files are typically larger than JPG</span>
              </li>
              <li className="flex items-start">
                <span className="text-indigo-600 mr-2">•</span>
                <span><strong>Best for:</strong> Graphics, logos, text, and images requiring transparency</span>
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
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-gray-700 truncate block">{file.name}</span>
                      <span className="text-xs text-gray-500">{formatFileSize(file.size)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="ml-4 text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Convert Button */}
          {selectedFiles.length > 0 && convertedFiles.length === 0 && (
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
                    : 'bg-indigo-600 hover:bg-indigo-700'
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
                    <span>Convert to PNG</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Converted Files */}
          {convertedFiles.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Converted Files ({convertedFiles.length})
                </h2>
                <button
                  type="button"
                  onClick={handleDownloadAll}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download All</span>
                </button>
              </div>
              <div className="space-y-2">
                {convertedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm text-gray-700 truncate block">{file.name}</span>
                        <span className="text-xs text-gray-500">{formatFileSize(file.size)}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDownload(file)}
                      className="ml-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm flex items-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JpgToPng;