import React, { useState } from 'react';
import { ArrowLeft, Download, FileText, CheckCircle, X, AlertCircle } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import SEOAuto from "../components/SEOAuto";


interface NotificationProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, type, onClose }) => {
  const colors = {
    success: 'bg-green-50 border-green-200 text-green-900',
    error: 'bg-red-50 border-red-200 text-red-900',
    info: 'bg-blue-50 border-blue-200 text-blue-900'
  };

  const iconColors = {
    success: 'text-green-600',
    error: 'text-red-600',
    info: 'text-blue-600'
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <SEOAuto />

      <div className={`rounded-lg shadow-lg p-4 pr-12 max-w-md border ${colors[type]}`}>
        <div className="flex items-start">
          <CheckCircle className={`w-5 h-5 mr-3 flex-shrink-0 mt-0.5 ${iconColors[type]}`} />
          <div className="flex-1">
            <p className="text-sm font-medium">{message}</p>
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

const PDFPageExtractor: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [pageRange, setPageRange] = useState<string>('');
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' | 'info'): void => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleFileSelect = async (file: File): Promise<void> => {
    if (file.type !== 'application/pdf') {
      showNotification('Please select a PDF file', 'error');
      return;
    }

    setSelectedFile(file);
    setSelectedPages(new Set());
    setPageRange('');
    try {
      // Load PDF to count pages
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pageCount = pdfDoc.getPageCount();
      setTotalPages(pageCount);
      showNotification(`PDF loaded successfully! Total pages: ${pageCount}`, 'success');
    } catch (error) {
      console.error('Error loading PDF:', error);
      showNotification('Error loading PDF. Please try another file.', 'error');
      setSelectedFile(null);
    }
  };

  const togglePage = (pageNum: number): void => {
    const newSelected = new Set(selectedPages);
    if (newSelected.has(pageNum)) {
      newSelected.delete(pageNum);
    } else {
      newSelected.add(pageNum);
    }
    setSelectedPages(newSelected);
  };

  const selectAll = (): void => {
    const all = new Set<number>();
    for (let i = 1; i <= totalPages; i++) {
      all.add(i);
    }
    setSelectedPages(all);
  };

  const clearSelection = (): void => {
    setSelectedPages(new Set());
  };

  const applyRange = (): void => {
    if (!pageRange.trim()) {
      showNotification('Please enter a page range', 'error');
      return;
    }

    const newSelected = new Set<number>();
    const parts = pageRange.split(',');

    try {
      for (const part of parts) {
        const trimmed = part.trim();
        if (trimmed.includes('-')) {
          const [start, end] = trimmed.split('-').map(s => parseInt(s.trim()));
          if (isNaN(start) || isNaN(end) || start < 1 || end > totalPages || start > end) {
            throw new Error('Invalid range');
          }
          for (let i = start; i <= end; i++) {
            newSelected.add(i);
          }
        } else {
          const pageNum = parseInt(trimmed);
          if (isNaN(pageNum) || pageNum < 1 || pageNum > totalPages) {
            throw new Error('Invalid page number');
          }
          newSelected.add(pageNum);
        }
      }
      setSelectedPages(newSelected);
      showNotification(`Selected ${newSelected.size} page(s)`, 'success');
    } catch (error) {
      showNotification('Invalid range format. Use format like: 1,3,5-7', 'error');
    }
  };

  const extractPages = async (): Promise<void> => {
    if (!selectedFile || selectedPages.size === 0) {
      showNotification('Please select at least one page to extract', 'error');
      return;
    }

    setIsExtracting(true);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      
      const sourcePdf = await PDFDocument.load(arrayBuffer);
      const newPdf = await PDFDocument.create();

      const sortedPages = Array.from(selectedPages).sort((a, b) => a - b);

      for (const pageNum of sortedPages) {
        const [copiedPage] = await newPdf.copyPages(sourcePdf, [pageNum - 1]);
        newPdf.addPage(copiedPage);
      }

      const pdfBytes = await newPdf.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `extracted_pages_${selectedFile.name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showNotification(`Successfully extracted ${selectedPages.size} page(s)!`, 'success');
    } catch (error) {
      console.error('Extraction error:', error);
      showNotification('Error extracting pages. Please try again.', 'error');
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <a href="/" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </a>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">PDF Page Extractor</h1>
              <p className="text-sm text-gray-600 mt-1">
                Extract specific pages from PDF into a new PDF
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Upload Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Step 1: Upload PDF File
            </h2>
            <div className="border-2 border-dashed border-orange-300 rounded-xl p-8 text-center hover:border-orange-500 transition-colors bg-orange-50">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload PDF Document</h3>
              <p className="text-sm text-gray-600 mb-4">Select a PDF file to extract pages from</p>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                className="hidden"
                id="pdf-upload"
              />
              <label
                htmlFor="pdf-upload"
                className="inline-block px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors cursor-pointer font-medium shadow-md hover:shadow-lg"
              >
                Browse PDF File
              </label>
              {selectedFile && (
                <div className="mt-4 p-3 bg-white rounded-lg border border-orange-200">
                  <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500 mt-1">Total pages: {totalPages}</p>
                </div>
              )}
            </div>
          </div>

          
          {selectedFile && totalPages > 0 && (
            <>
              {/* Page Selection Controls */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Step 2: Select Pages ({selectedPages.size} selected)
                </h2>
                
                {/* Quick Actions */}
                <div className="flex flex-wrap gap-3 mb-4">
                  <button
                    type="button"
                    onClick={selectAll}
                    className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors font-medium text-sm"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={clearSelection}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
                  >
                    Clear Selection
                  </button>
                </div>

                {/* Range Input */}
                <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Quick Select by Range
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={pageRange}
                      onChange={(e) => setPageRange(e.target.value)}
                      placeholder="e.g., 1,3,5-7,10-15"
                      className="flex-1 px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={applyRange}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Apply
                    </button>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    Format: Individual pages (1,3,5) or ranges (5-10) or both (1,3,5-7)
                  </p>
                </div>

                {/* Page Grid */}
                <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => togglePage(pageNum)}
                      className={`
                        aspect-square flex items-center justify-center rounded-lg font-medium text-sm
                        transition-all duration-200 border-2
                        ${selectedPages.has(pageNum)
                          ? 'bg-orange-600 text-white border-orange-600 shadow-md'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-orange-400 hover:bg-orange-50'
                        }
                      `}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>
              </div>

              {/* Extract Button */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Step 3: Extract Selected Pages
                </h2>
                <button
                  type="button"
                  onClick={extractPages}
                  disabled={isExtracting || selectedPages.size === 0}
                  className={`
                    w-full py-4 px-6 rounded-lg font-semibold text-white
                    flex items-center justify-center space-x-2
                    transition-all duration-200 shadow-md hover:shadow-lg
                    ${isExtracting || selectedPages.size === 0
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700'
                    }
                  `}
                >
                  {isExtracting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Extracting Pages...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      <span>Extract {selectedPages.size} Page{selectedPages.size !== 1 ? 's' : ''}</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}

          {/* How it Works */}
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              How it works:
            </h3>
            <ol className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="font-semibold text-orange-600 mr-2">1.</span>
                <span>Upload your PDF document (any size, any number of pages)</span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold text-orange-600 mr-2">2.</span>
                <span>Select individual pages by clicking or use range format (e.g., 1,3,5-7)</span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold text-orange-600 mr-2">3.</span>
                <span>Click extract to create a new PDF with only your selected pages</span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold text-orange-600 mr-2">4.</span>
                <span>Download your new PDF instantly - 100% browser-based, no upload needed</span>
              </li>
            </ol>
          </div>

          {/* Privacy Notice */}
          <div className="bg-green-50 border-l-4 border-green-400 p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-green-900 mb-1">
                  100% Private & Secure
                </h3>
                <p className="text-sm text-green-800">
                  Your PDF is processed entirely in your browser. No files are uploaded to any server. 
                  Your documents remain completely private and secure on your device.
                </p>
              </div>
            </div>
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

export default PDFPageExtractor;