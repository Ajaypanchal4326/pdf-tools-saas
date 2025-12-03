import React, { useState } from 'react';
import { ArrowLeft, Download, Image, Zap, FileImage} from 'lucide-react';

const JpgToWebp: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isConverting, setIsConverting] = useState<boolean>(false);

  const handleFileSelect = (files: File[]): void => {
    const jpgFiles = files.filter(file => 
      file.type === 'image/jpeg' || file.type === 'image/jpg'
    );
    
    if (jpgFiles.length === 0) {
      alert('Please select JPG or JPEG files only');
      return;
    }
    
    setSelectedFiles(jpgFiles);
  };

  const handleRemoveFile = (index: number): void => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const convertJpgToWebp = async (): Promise<void> => {
    if (selectedFiles.length === 0) {
      alert('Please select at least one JPG file');
      return;
    }

    setIsConverting(true);

    try {
      for (const file of selectedFiles) {
        const img = document.createElement('img');
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        await new Promise((resolve, reject) => {
          img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            
            if (ctx) {
              ctx.drawImage(img, 0, 0);
              
              canvas.toBlob((blob) => {
                if (blob) {
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = file.name.replace(/\.(jpg|jpeg)$/i, '.webp');
                  a.click();
                  URL.revokeObjectURL(url);
                  resolve(null);
                } else {
                  reject(new Error('Conversion failed'));
                }
              }, 'image/webp', 0.90);
            }
          };
          
          img.onerror = reject;
          img.src = URL.createObjectURL(file);
        });
      }
      
      setIsConverting(false);
      alert(`Successfully converted ${selectedFiles.length} file(s) to WEBP!`);
    } catch (error) {
      setIsConverting(false);
      alert('Error converting files. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <a href="/" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </a>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">JPG to WEBP Converter</h1>
              <p className="text-sm text-gray-600 mt-1">
                Convert JPG images to modern WEBP format for faster websites and smaller file sizes
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
            <div className="border-2 border-dashed border-green-300 rounded-xl p-8 text-center hover:border-green-500 transition-colors bg-green-50">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileImage className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload JPG/JPEG Images</h3>
              <p className="text-sm text-gray-600 mb-4">Drag and drop or browse to select JPG files</p>
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
                className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer font-medium shadow-md hover:shadow-lg"
              >
                Browse JPG Files
              </label>
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
                  <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                    <div className="flex items-center space-x-3">
                      <Image className="w-5 h-5 text-green-600" />
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
                Step 3: Convert to WEBP
              </h2>
              <button
                type="button"
                onClick={convertJpgToWebp}
                disabled={isConverting}
                className={`
                  w-full py-4 px-6 rounded-lg font-semibold text-white
                  flex items-center justify-center space-x-2
                  transition-all duration-200 shadow-md hover:shadow-lg
                  ${isConverting 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
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
                    <span>Convert to WEBP Format</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Performance Comparison */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Zap className="w-6 h-6 text-yellow-500 mr-2" />
              Performance Comparison: JPG vs WEBP
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">JPG Format</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Standard file size</li>
                  <li>• Universal compatibility</li>
                  <li>• Lossy compression</li>
                  <li>• No transparency support</li>
                </ul>
              </div>
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <h4 className="font-semibold text-gray-900 mb-2">WEBP Format</h4>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>• <strong>30% smaller files</strong></li>
                  <li>• Modern browser support</li>
                  <li>• Better compression</li>
                  <li>• <strong>Transparency support</strong></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JpgToWebp;