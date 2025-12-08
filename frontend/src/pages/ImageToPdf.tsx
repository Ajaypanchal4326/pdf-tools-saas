import React, { useState } from 'react';
import { ArrowLeft, Image, Upload, X, FileText, AlertCircle } from 'lucide-react';
import SEOAuto from "../components/SEOAuto";


// ============================================
// API HELPER FUNCTION
// ============================================
const convertImageToPdf = async (files: File[]) => {
  const formData = new FormData();
  
  files.forEach((file) => {
    formData.append('files', file);
  });

  const response = await fetch(
  `${import.meta.env.VITE_API_URL}/api/convert/image-to-pdf`,
  {
    method: "POST",
    body: formData,
  }
);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Conversion failed');
  }

  return response.blob();
};

// ============================================
// IMAGE TO PDF COMPONENT
// ============================================
const ImageToPdf: React.FC = () => {

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [dragActive, setDragActive] = useState<boolean>(false);

  const handleFileSelect = (files: FileList | null): void => {
    if (!files) return;

    const imageFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/')
    );
    
    if (imageFiles.length === 0) {
      setError('Please select valid image files');
      return;
    }

    if (imageFiles.length > 20) {
      setError('Maximum 20 images allowed at once');
      return;
    }
    
    setError('');
    setSelectedFiles(prev => [...prev, ...imageFiles]);
  };

  const handleRemoveFile = (index: number): void => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleConvert = async (): Promise<void> => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one image');
      return;
    }

    setIsConverting(true);
    setError('');

    try {
      const pdfBlob = await convertImageToPdf(selectedFiles);
      
      // Create download link
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `converted-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      // Clear files after successful conversion
      setSelectedFiles([]);
      setError('');
      
    } catch (err) {
      console.error('Conversion error:', err);
      setError(err instanceof Error ? err.message : 'Failed to convert images to PDF');
    } finally {
      setIsConverting(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <SEOAuto />
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <a href="/" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </a>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Image to PDF Converter</h1>
              <p className="text-sm text-gray-600 mt-1">
                Convert multiple images into a single PDF document
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Upload Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Step 1: Select Images
            </h2>
            
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-blue-400 bg-gray-50'
              }`}
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Upload Images
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Drag and drop images here, or click to browse
              </p>
              <p className="text-xs text-gray-500 mb-4">
                Supports: JPG, PNG, WEBP, GIF, BMP, TIFF (Max 20 images, 10MB each)
              </p>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer font-medium shadow-md hover:shadow-lg"
              >
                Browse Images
              </label>
            </div>
          </div>

          {/* File Preview */}
          {selectedFiles.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Step 2: Selected Images ({selectedFiles.length})
              </h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100"
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <Image className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-700 font-medium truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="ml-3 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                    >
                      <X className="w-5 h-5" />
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
                Step 3: Convert to PDF
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
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
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
                    <FileText className="w-5 h-5" />
                    <span>Convert to PDF</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Info Section */}
          <div className="bg-blue-50 rounded-xl border border-blue-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              How it works
            </h3>
            <ol className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="font-semibold text-blue-600 mr-3 flex-shrink-0">1.</span>
                <span>Upload one or more images (JPG, PNG, WEBP, etc.)</span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold text-blue-600 mr-3 flex-shrink-0">2.</span>
                <span>Images will be arranged in the order you selected them</span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold text-blue-600 mr-3 flex-shrink-0">3.</span>
                <span>Click "Convert to PDF" and download your file instantly</span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageToPdf;