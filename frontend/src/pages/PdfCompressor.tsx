import React, { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { ArrowLeft, Upload, Download, CheckCircle, X} from "lucide-react";
import { GlobalWorkerOptions } from "pdfjs-dist";
import * as pdfjsLib from "pdfjs-dist";
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";

GlobalWorkerOptions.workerSrc = workerSrc;

type Level = "low" | "medium" | "high";

const qualityForLevel = (level: Level) => {
  if (level === "high") return 0.3; // More aggressive compression
  if (level === "medium") return 0.5; // Balanced compression
  return 0.8; // Low compression
};

const scaleForLevel = (level: Level) => {
  if (level === "high") return 1.2; // Lower resolution for high compression
  if (level === "medium") return 1.5; // Medium resolution
  return 2; // Higher resolution for low compression
};

const PdfCompressor: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [level, setLevel] = useState<Level>("medium");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [beforeSize, setBeforeSize] = useState<number | null>(null);
  const [afterSize, setAfterSize] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const reset = () => {
    setFile(null);
    setBeforeSize(null);
    setAfterSize(null);
    setProgress(0);
  };

  const handleFileSelect = (selectedFile: File) => {
    if (
      selectedFile.type !== "application/pdf" &&
      !selectedFile.name.toLowerCase().endsWith(".pdf")
    ) {
      showNotification("error", "Please upload a PDF file only");
      return;
    }
    setFile(selectedFile);
    setBeforeSize(selectedFile.size);
    setAfterSize(null);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFileSelect(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFileSelect(f);
  };

  const formatBytes = (bytes: number | null) => {
    if (!bytes) return "-";
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(2) + " " + sizes[i];
  };

  const compressLow = async (arrayBuffer: ArrayBuffer) => {
    const srcPdf = await PDFDocument.load(arrayBuffer);
    const outPdf = await PDFDocument.create();
    const srcPages = await outPdf.copyPages(srcPdf, srcPdf.getPageIndices());
    srcPages.forEach((p) => outPdf.addPage(p));
    const outBytes = await outPdf.save({ useObjectStreams: false });
    return outBytes;
  };

  const compressRasterize = async (
    arrayBuffer: ArrayBuffer,
    quality: number,
    scale: number
  ) => {
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;
    const outPdf = await PDFDocument.create();
    let processed = 0;

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context error");

      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);

      await page.render({ canvasContext: ctx, viewport, canvas }).promise;

      const mime = "image/jpeg";
      const dataUrl = canvas.toDataURL(mime, quality);
      const res = await fetch(dataUrl);
      const imageBytes = await res.arrayBuffer();

      const img = await outPdf.embedJpg(imageBytes);
      const pageObj = outPdf.addPage([img.width, img.height]);
      pageObj.drawImage(img, {
        x: 0,
        y: 0,
        width: img.width,
        height: img.height,
      });

      processed++;
      setProgress(Math.round((processed / numPages) * 100));
      await new Promise((r) => setTimeout(r, 20));
    }

    const outBytes = await outPdf.save({ useObjectStreams: false });
    return outBytes;
  };

  const handleCompress = async () => {
    if (!file) {
      showNotification("error", "Please select a PDF file first");
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setAfterSize(null);

    try {
      const ab = await file.arrayBuffer();
      let outBytes: Uint8Array;

      if (level === "low") {
        outBytes = await compressLow(ab);
        setProgress(100);
      } else {
        const quality = qualityForLevel(level);
        const scale = scaleForLevel(level);
        outBytes = await compressRasterize(ab, quality, scale);
      }

      const blob = new Blob([new Uint8Array(outBytes)], { type: "application/pdf" });
      setAfterSize(blob.size);

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download =
        file.name.replace(/\.pdf$/i, "") + `-compressed-${level}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      const savings = beforeSize
        ? Math.round(((beforeSize - blob.size) / beforeSize) * 100)
        : 0;
      showNotification(
        "success",
        `PDF compressed successfully! Reduced by ${savings}% (${formatBytes(blob.size)})`
      );
    } catch (err: any) {
      console.error(err);
      showNotification("error", err?.message || "Compression failed");
    } finally {
      setIsProcessing(false);
      setProgress(100);
    }
  };

  const getSavingsPercent = () => {
    if (!beforeSize || !afterSize) return null;
    return Math.round(((beforeSize - afterSize) / beforeSize) * 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg shadow-lg text-white ${
              notification.type === "success" ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {notification.type === "success" ? (
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
            <a
              href="/"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </a>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Compress PDF
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Reduce PDF file size while maintaining quality
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
              Step 1: Select PDF File
            </h2>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`
                border-2 border-dashed rounded-xl p-8 text-center transition-all
                ${
                  isDragging
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-blue-400"
                }
              `}
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {file ? file.name : "Upload PDF File"}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {file
                  ? `Size: ${formatBytes(beforeSize)}`
                  : "Drag and drop or click to browse"}
              </p>
              <input
                type="file"
                accept="application/pdf"
                onChange={onFileChange}
                className="hidden"
                id="pdf-compress-upload"
              />
              <label
                htmlFor="pdf-compress-upload"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer font-medium"
              >
                {file ? "Choose Different PDF" : "Browse PDF"}
              </label>
              {file && (
                <button
                  onClick={reset}
                  className="ml-3 inline-block px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Compression Level */}
          {file && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Step 2: Choose Compression Level
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <button
                  onClick={() => setLevel("low")}
                  disabled={isProcessing}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    level === "low"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                  } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div className="font-semibold text-gray-900">Low</div>
                  <div className="text-xs text-gray-600 mt-1">
                    Best quality, moderate compression
                  </div>
                </button>
                <button
                  onClick={() => setLevel("medium")}
                  disabled={isProcessing}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    level === "medium"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                  } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div className="font-semibold text-gray-900">Medium</div>
                  <div className="text-xs text-gray-600 mt-1">
                    Balanced quality and size
                  </div>
                </button>
                <button
                  onClick={() => setLevel("high")}
                  disabled={isProcessing}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    level === "high"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                  } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div className="font-semibold text-gray-900">High</div>
                  <div className="text-xs text-gray-600 mt-1">
                    Maximum compression, smaller files
                  </div>
                </button>
              </div>
              <div className="bg-blue-50 rounded-lg border border-blue-100 p-4">
                <p className="text-sm text-gray-700">
                  <strong>Note:</strong> Medium and High compression convert
                  pages to images for better compression. Text will not be
                  selectable. Use Low if you need to preserve text selection.
                </p>
              </div>
            </div>
          )}

          {/* File Size Comparison */}
          {file && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                File Size Information
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs text-gray-500 mb-1">
                    Original Size
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatBytes(beforeSize)}
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-xs text-gray-500 mb-1">
                    Compressed Size
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {afterSize ? formatBytes(afterSize) : "-"}
                  </div>
                  {getSavingsPercent() && (
                    <div className="text-sm text-green-600 mt-1">
                      ↓ {getSavingsPercent()}% smaller
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              {isProcessing && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">
                      Compressing...
                    </span>
                    <span className="text-sm font-semibold text-blue-600">
                      {progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      style={{ width: `${progress}%` }}
                      className="h-2 bg-blue-600 rounded-full transition-all duration-300"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Compress Button */}
          {file && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Step 3: Compress & Download
              </h2>
              <button
                onClick={handleCompress}
                disabled={isProcessing}
                className={`
                  w-full py-4 px-6 rounded-lg font-semibold text-white
                  flex items-center justify-center space-x-2
                  transition-all duration-200 shadow-md hover:shadow-lg
                  ${
                    isProcessing
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }
                `}
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Compressing...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    <span>Compress PDF ({level})</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Info Section */}
          <div className="bg-blue-50 rounded-xl border border-blue-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              
              How it works
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>
                  <strong>Low compression:</strong> Removes metadata and
                  optimizes structure while keeping text selectable
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>
                  <strong>Medium compression:</strong> Converts pages to
                  optimized images with balanced quality (50% JPEG quality)
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>
                  <strong>High compression:</strong> Aggressive image
                  compression for maximum file size reduction (30% JPEG quality)
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>
                  <strong>Privacy:</strong> All processing happens in your
                  browser - files never leave your device
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfCompressor;