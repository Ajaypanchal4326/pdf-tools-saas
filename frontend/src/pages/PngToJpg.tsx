import React, { useState } from 'react';
import { ArrowLeft, Download, Image, AlertCircle } from 'lucide-react';
import SEOAuto from "../components/SEOAuto";


interface UploadBoxProps {
  onFileSelect: (files: File[]) => void;
  acceptedTypes?: 'images' | 'pdf' | 'all';
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
        ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 bg-white hover:border-indigo-400'}
      `}
    >
      <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Image className="w-8 h-8 text-indigo-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title || 'Drop PNG images here'}
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        {description || 'or click to browse • PNG files only'}
      </p>
      <input
        type="file"
        accept="image/png"
        multiple={multiple}
        onChange={handleFileChange}
        className="hidden"
        id="png-upload"
      />
      <label
        htmlFor="png-upload"
        className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer font-medium"
      >
        Browse PNG Files
      </label>
    </div>
  );
};

const PngToJpg: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isConverting, setIsConverting] = useState<boolean>(false);

  const handleFileSelect = (files: File[]): void => {
    setSelectedFiles(files);
  };

  const convertPngToJpg = (file: File): Promise<Blob> => {
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
          
          // Fill with white background (PNG transparency becomes white)
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Draw the image
          ctx.drawImage(img, 0, 0);
          
          // Convert to JPG blob
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Failed to convert image'));
              }
            },
            'image/jpeg',
            0.9 // Quality: 0.9 = 90% quality
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
      alert('Please select at least one PNG file');
      return;
    }

    setIsConverting(true);

    try {
      for (const file of selectedFiles) {
        const jpgBlob = await convertPngToJpg(file);
        
        // Create download link
        const url = URL.createObjectURL(jpgBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name.replace(/\.png$/i, '.jpg');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Small delay between downloads to prevent browser blocking
        if (selectedFiles.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
      
      alert(`Successfully converted ${selectedFiles.length} PNG file(s) to JPG!`);
    } catch (error) {
      console.error('Conversion error:', error);
      alert('An error occurred during conversion. Please try again.');
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOAuto />

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <a href="/" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </a>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">PNG to JPG</h1>
              <p className="text-sm text-gray-600 mt-1">
                Convert PNG images to JPG format
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

          {/* Important Info Alert */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-yellow-400 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-yellow-800 mb-1">
                  Important: Lossy Compression
                </h3>
                <p className="text-sm text-yellow-700">
                  Converting PNG to JPG uses lossy compression, which means some image quality will be lost. 
                  PNG transparency will be replaced with a white background. This format is ideal for photographs 
                  but not recommended for images with text or graphics requiring transparency.
                </p>
              </div>
            </div>
          </div>

          {/* File Preview */}
          {selectedFiles.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Step 2: Selected Files ({selectedFiles.length})
              </h2>
              <div className="space-y-2">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Convert Button */}
          {selectedFiles.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Step 3: Convert to JPG
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
                    <span>Convert to JPG</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* How it works */}
          <div className="bg-indigo-50 rounded-xl border border-indigo-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              How it works:
            </h3>
            <ol className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="font-semibold text-indigo-600 mr-2">1.</span>
                <span>Upload one or more PNG images from your device</span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold text-indigo-600 mr-2">2.</span>
                <span>Our tool converts your PNG files to JPG format with optimized compression</span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold text-indigo-600 mr-2">3.</span>
                <span>Download your converted JPG files instantly</span>
              </li>
            </ol>
          </div>

         
        </div>
      </div>
    </div>
  );
};

export default PngToJpg