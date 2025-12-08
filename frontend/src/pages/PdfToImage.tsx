import React, { useState } from 'react';
import { ArrowLeft, Download, FileText, Upload, X, Image, AlertCircle, Check, Loader } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import SEOAuto from "../components/SEOAuto";

// FIXED: Proper worker setup for Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

// ============================================
// PDF TO IMAGE COMPONENT (CLIENT-SIDE ONLY)
// ============================================
const PdfToImage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [format, setFormat] = useState<'png' | 'jpg'>('png');
  const [quality, setQuality] = useState<number>(0.92);
  const [success, setSuccess] = useState<boolean>(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);

  const handleFileSelect = (files: FileList | null): void => {
    if (!files || files.length === 0) return;

    const file = files[0];
    
    if (file.type !== 'application/pdf') {
      setError('Please select a valid PDF file');
      return;
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB
      setError('PDF file size must be less than 50MB');
      return;
    }
    
    setError('');
    setSuccess(false);
    setSelectedFile(file);
  };

  const handleRemoveFile = (): void => {
    setSelectedFile(null);
    setError('');
    setSuccess(false);
    setProgress(null);
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

  const convertPdfToImages = async (): Promise<void> => {
    if (!selectedFile) {
      setError('Please select a PDF file');
      return;
    }

    setIsConverting(true);
    setError('');
    setSuccess(false);
    setProgress(null);

    try {
      // Read the PDF file
      const arrayBuffer = await selectedFile.arrayBuffer();
      
      // Load the PDF document
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;
      
      setProgress({ current: 0, total: numPages });

      // Create a new ZIP file
      const zip = new JSZip();

      // Convert each page to image
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        try {
          // Get the page
          const page = await pdf.getPage(pageNum);
          
          // Set scale for high quality (2x)
          const scale = 2.0;
          const viewport = page.getViewport({ scale });

          // Create canvas
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          
          if (!context) {
            throw new Error('Failed to get canvas context');
          }

          canvas.height = viewport.height;
          canvas.width = viewport.width;

          // Render PDF page to canvas
          await page.render({
            canvasContext: context,
            viewport: viewport,
            canvas: canvas
          }).promise;

          // Convert canvas to blob
          const blob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  resolve(blob);
                } else {
                  reject(new Error('Failed to convert canvas to blob'));
                }
              },
              format === 'png' ? 'image/png' : 'image/jpeg',
              quality
            );
          });

          // Add to ZIP
          const fileName = `page-${pageNum.toString().padStart(3, '0')}.${format}`;
          zip.file(fileName, blob);

          // Update progress
          setProgress({ current: pageNum, total: numPages });

        } catch (pageError) {
          console.error(`Error converting page ${pageNum}:`, pageError);
        }
      }

      // Generate ZIP file
      const zipBlob = await zip.generateAsync({ 
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 9 }
      });

      // Download ZIP file
      const fileName = selectedFile.name.replace('.pdf', '');
      saveAs(zipBlob, `${fileName}-images.zip`);

      setSuccess(true);
      setProgress(null);
      
      // Clear file after 3 seconds
      setTimeout(() => {
        setSelectedFile(null);
        setSuccess(false);
      }, 3000);

    } catch (err) {
      console.error('Conversion error:', err);
      setError(err instanceof Error ? err.message : 'Failed to convert PDF to images');
      setProgress(null);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
      <SEOAuto />

      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <a href="/" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </a>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">PDF to Image Converter</h1>
              <p className="text-sm text-gray-600 mt-1">
                Extract all pages from PDF as high-quality images
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          
          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
              <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-green-800">Success!</h3>
                <p className="text-sm text-green-700 mt-1">
                  Your PDF has been converted. The ZIP file is downloading now.
                </p>
              </div>
            </div>
          )}

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

          {/* Progress Bar */}
          {progress && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Converting pages...
                </span>
                <span className="text-sm text-gray-600">
                  {progress.current} / {progress.total}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Upload Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Step 1: Select PDF File
            </h2>
            
            {!selectedFile ? (
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  dragActive 
                    ? 'border-purple-500 bg-purple-50' 
                    : 'border-gray-300 hover:border-purple-400 bg-gray-50'
                }`}
              >
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Upload PDF Document
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Drag and drop your PDF here, or click to browse
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  Maximum file size: 50MB • Processed locally in your browser
                </p>
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="hidden"
                  id="pdf-upload"
                />
                <label
                  htmlFor="pdf-upload"
                  className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer font-medium shadow-md hover:shadow-lg"
                >
                  Browse PDF File
                </label>
              </div>
            ) : (
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <FileText className="w-8 h-8 text-purple-600 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-900 font-semibold truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-gray-600">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    disabled={isConverting}
                    className="ml-3 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Format Selection */}
          {selectedFile && !isConverting && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Step 2: Choose Output Format
              </h2>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <button
                  type="button"
                  onClick={() => setFormat('png')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    format === 'png'
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-center justify-center mb-2">
                    <Image className={`w-6 h-6 ${format === 'png' ? 'text-purple-600' : 'text-gray-400'}`} />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-center">PNG</h3>
                  <p className="text-xs text-gray-600 text-center mt-1">
                    Lossless quality, larger size
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setFormat('jpg')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    format === 'jpg'
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-center justify-center mb-2">
                    <Image className={`w-6 h-6 ${format === 'jpg' ? 'text-purple-600' : 'text-gray-400'}`} />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-center">JPG</h3>
                  <p className="text-xs text-gray-600 text-center mt-1">
                    Smaller size, adjustable quality
                  </p>
                </button>
              </div>

              {/* Quality Slider for JPG */}
              {format === 'jpg' && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quality: {Math.round(quality * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="1"
                    step="0.01"
                    value={quality}
                    onChange={(e) => setQuality(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>50% (Smaller files)</span>
                    <span>100% (Best quality)</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Convert Button */}
          {selectedFile && !isConverting && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Step 3: Convert to Images
              </h2>
              <button
                type="button"
                onClick={convertPdfToImages}
                className="w-full py-4 px-6 rounded-lg font-semibold text-white
                  flex items-center justify-center space-x-2
                  transition-all duration-200 shadow-md hover:shadow-lg
                  bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Download className="w-5 h-5" />
                <span>Convert & Download ZIP</span>
              </button>
            </div>
          )}

          {/* Info Section */}
          <div className="bg-purple-50 rounded-xl border border-purple-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <Loader className="w-5 h-5 text-purple-600 mr-2" />
              How it works
            </h3>
            <ol className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="font-semibold text-purple-600 mr-3 flex-shrink-0">1.</span>
                <span>Upload a PDF document (up to 50MB)</span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold text-purple-600 mr-3 flex-shrink-0">2.</span>
                <span>Choose your preferred output format (PNG for quality or JPG for smaller size)</span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold text-purple-600 mr-3 flex-shrink-0">3.</span>
                <span>Click convert and download a ZIP file containing all pages as images</span>
              </li>
            </ol>
            <div className="mt-4 pt-4 border-t border-purple-200">
              <p className="text-sm text-gray-600">
                <strong>🔒 Privacy:</strong> All conversion happens locally in your browser. 
                Your files are never uploaded to any server, ensuring complete privacy and security.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfToImage;