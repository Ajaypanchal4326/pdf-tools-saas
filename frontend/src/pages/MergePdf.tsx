import React, { useState } from "react";
import {
  ArrowLeft,
  Download,
  Upload,
  GripVertical,
  X,
  CheckCircle,
  FileText,
} from "lucide-react";

const MergePdf: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Toast
  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const isPdfFile = (file: File) =>
    file.type === "application/pdf" ||
    file.name.toLowerCase().endsWith(".pdf");

  const handleFileSelect = (files: File[]) => {
    const pdfs = files.filter(isPdfFile);
    if (pdfs.length === 0) {
      showNotification("error", "Please upload PDF files only.");
      return;
    }
    setSelectedFiles((prev) => [...prev, ...pdfs]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFileSelect(Array.from(e.dataTransfer.files));
    }
  };

  const handleRemove = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearAll = () => setSelectedFiles([]);

  const formatFileSize = (bytes: number) => {
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(1) + " " + sizes[i];
  };

  const handleMerge = async () => {
    if (selectedFiles.length < 2) {
      showNotification("error", "Select at least 2 PDFs to merge.");
      return;
    }

    setIsMerging(true);

    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => formData.append("files", file));

      const response = await fetch("http://localhost:5000/api/convert/merge-pdf", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Merge failed");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "merged.pdf";
      link.click();
      URL.revokeObjectURL(url);

      showNotification("success", "Merged PDF downloaded successfully.");
      setSelectedFiles([]);
    } catch {
      showNotification("error", "Failed to merge PDFs. Try again.");
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl shadow-lg text-white ${
              notification.type === "success" ? "bg-green-600" : "bg-red-600"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <X className="w-5 h-5" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <a href="/" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </a>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Merge PDF</h1>
              <p className="text-sm text-gray-600 mt-1">
                Combine multiple PDFs into a single file
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
              Step 1: Select PDF Files
            </h2>

            <div
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                isDragging
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-blue-400 bg-gray-50"
              }`}
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="text-blue-600 w-8 h-8" />
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Upload PDF Documents
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Drag and drop your PDFs here, or click to browse
              </p>

              <input
                id="pdf-input"
                type="file"
                accept="application/pdf"
                multiple
                className="hidden"
                onChange={(e) =>
                  e.target.files && handleFileSelect(Array.from(e.target.files))
                }
              />

              <label
                htmlFor="pdf-input"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer font-medium shadow-md hover:shadow-lg"
              >
                Browse PDF Files
              </label>

              <p className="text-xs text-gray-500 mt-4">
                Minimum 2 PDF files required
              </p>
            </div>
          </div>

          {/* File List */}
          {selectedFiles.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Step 2: Selected PDFs ({selectedFiles.length})
                </h2>

                <button
                  className="text-red-600 text-sm font-semibold hover:text-red-700 transition-colors"
                  onClick={handleClearAll}
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100"
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <GripVertical className="text-gray-400 w-5 h-5 flex-shrink-0" />
                      <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
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
                      onClick={() => handleRemove(index)}
                      className="ml-3 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>

              <p className="text-xs text-gray-500 text-center mt-3">
                Files will be merged in this order
              </p>
            </div>
          )}

          {/* Merge Button */}
          {selectedFiles.length >= 2 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Step 3: Merge PDFs
              </h2>

              <button
                onClick={handleMerge}
                disabled={isMerging}
                className={`w-full py-4 px-6 rounded-lg font-semibold text-white flex items-center justify-center space-x-2 transition-all duration-200 shadow-md hover:shadow-lg ${
                  isMerging
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                }`}
              >
                {isMerging ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Merging...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    <span>Merge {selectedFiles.length} PDFs</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* How it works */}
          <div className="bg-blue-50 rounded-xl border border-blue-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              How it works
            </h3>
            <ol className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="font-semibold text-blue-600 mr-3 flex-shrink-0">1.</span>
                <span>Upload multiple PDF documents (minimum 2 files)</span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold text-blue-600 mr-3 flex-shrink-0">2.</span>
                <span>PDFs will be combined in the order you select them</span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold text-blue-600 mr-3 flex-shrink-0">3.</span>
                <span>Click "Merge PDFs" and download your combined file instantly</span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MergePdf;