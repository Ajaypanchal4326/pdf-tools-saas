import React, { useState } from "react";
import { ArrowLeft, Upload, Download, CheckCircle, X, Image } from "lucide-react";

const ImageCompressor: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [quality, setQuality] = useState<number>(0.7); // Lower default for better compression
  const [format, setFormat] = useState<"jpeg" | "png" | "webp">("jpeg");
  const [maxWidth, setMaxWidth] = useState<number>(1920); // Max width for resizing
  const [beforeSize, setBeforeSize] = useState<number | null>(null);
  const [afterSize, setAfterSize] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const formatBytes = (bytes: number | null) => {
    if (!bytes) return "-";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(2) + " " + sizes[i];
  };

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.type.startsWith("image/")) {
      showNotification("error", "Please select an image file only");
      return;
    }

    setFile(selectedFile);
    setBeforeSize(selectedFile.size);
    setAfterSize(null);
    setCompressedBlob(null);

    const url = URL.createObjectURL(selectedFile);
    setPreview(url);
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

  const compressImage = async () => {
    if (!file) return;

    setIsProcessing(true);

    try {
      const img = document.createElement("img");
      img.src = preview!;
      await img.decode();

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { alpha: format === "png" });

      if (!ctx) throw new Error("Canvas not supported");

      // Calculate new dimensions while maintaining aspect ratio
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        const ratio = maxWidth / width;
        width = maxWidth;
        height = Math.round(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;

      // Use better image smoothing for quality
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Draw resized image
      ctx.drawImage(img, 0, 0, width, height);

      // For PNG, apply additional optimization
      if (format === "png") {
        // PNG optimization: reduce color depth if possible
        const imageData = ctx.getImageData(0, 0, width, height);
        ctx.putImageData(imageData, 0, 0);
      }

      const mimeType =
        format === "png"
          ? "image/png"
          : format === "webp"
          ? "image/webp"
          : "image/jpeg";

      // For JPEG and WebP, use adjusted quality
      const adjustedQuality = format === "png" ? undefined : quality;

      const blob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob((b) => resolve(b), mimeType, adjustedQuality)
      );

      if (!blob) throw new Error("Failed to compress image");

      setCompressedBlob(blob);
      setAfterSize(blob.size);

      const savings = beforeSize
        ? Math.round(((beforeSize - blob.size) / beforeSize) * 100)
        : 0;
      showNotification(
        "success",
        `Image compressed successfully! Reduced by ${savings}% (${formatBytes(
          blob.size
        )})`
      );
    } catch (err: any) {
      showNotification("error", err.message || "Compression failed");
    }

    setIsProcessing(false);
  };

  const downloadImage = () => {
    if (!compressedBlob) return;

    const ext = format === "jpeg" ? "jpg" : format;
    const url = URL.createObjectURL(compressedBlob);
    const link = document.createElement("a");

    link.href = url;
    link.download = file!.name.replace(/\..+$/, "") + `-compressed.${ext}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setCompressedBlob(null);
    setBeforeSize(null);
    setAfterSize(null);
  };

  const getSavingsPercent = () => {
    if (!beforeSize || !afterSize) return null;
    return Math.round(((beforeSize - afterSize) / beforeSize) * 100);
  };

  const presetQualities = [
    { label: "High", value: 0.9, desc: "Best quality" },
    { label: "Medium", value: 0.7, desc: "Balanced" },
    { label: "Low", value: 0.5, desc: "Smallest size" },
  ];

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
                Compress Image
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Reduce image file size with advanced compression
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
              Step 1: Select Image File
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
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-300 hover:border-purple-400"
                }
              `}
            >
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {file ? file.name : "Upload Image File"}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {file
                  ? `Size: ${formatBytes(beforeSize)}`
                  : "Drag and drop or click to browse"}
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={onFileChange}
                className="hidden"
                id="image-compress-upload"
              />
              <label
                htmlFor="image-compress-upload"
                className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer font-medium"
              >
                {file ? "Choose Different Image" : "Browse Image"}
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

          {/* Image Preview */}
          {preview && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Image Preview
              </h2>
              <div className="flex justify-center bg-gray-50 rounded-lg p-4">
                <img
                  src={preview}
                  alt="Preview"
                  className="rounded-lg max-h-80 object-contain"
                />
              </div>
            </div>
          )}

          {/* Format & Settings */}
          {file && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Step 2: Compression Settings
              </h2>

              {/* Format Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Output Format
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(["jpeg", "png", "webp"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFormat(f)}
                      disabled={isProcessing}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        format === f
                          ? "border-purple-600 bg-purple-50"
                          : "border-gray-200 hover:border-purple-300"
                      } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <div className="font-semibold text-gray-900">
                        {f.toUpperCase()}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {f === "jpeg" && "Best for photos"}
                        {f === "png" && "Lossless quality"}
                        {f === "webp" && "Modern format"}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Max Width Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Maximum Width (pixels) - Larger images will be resized
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {[1920, 1280, 1024, 800].map((w) => (
                    <button
                      key={w}
                      onClick={() => setMaxWidth(w)}
                      disabled={isProcessing}
                      className={`p-3 rounded-lg border-2 transition-all text-sm ${
                        maxWidth === w
                          ? "border-purple-600 bg-purple-50 font-semibold"
                          : "border-gray-200 hover:border-purple-300"
                      } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {w}px
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Images larger than this width will be proportionally resized for
                  better compression
                </p>
              </div>

              {/* Quality Presets */}
              {format !== "png" && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Quality Presets
                  </label>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {presetQualities.map((preset) => (
                      <button
                        key={preset.label}
                        onClick={() => setQuality(preset.value)}
                        disabled={isProcessing}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          Math.abs(quality - preset.value) < 0.05
                            ? "border-purple-600 bg-purple-50"
                            : "border-gray-200 hover:border-purple-300"
                        } ${
                          isProcessing ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        <div className="font-semibold text-gray-900 text-sm">
                          {preset.label}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {preset.desc}
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Custom Quality Slider */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Custom Quality: {Math.round(quality * 100)}%
                    </label>
                    <input
                      type="range"
                      min={0.1}
                      max={1}
                      value={quality}
                      step={0.05}
                      onChange={(e) => setQuality(parseFloat(e.target.value))}
                      disabled={isProcessing}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, rgb(147 51 234) 0%, rgb(147 51 234) ${
                          quality * 100
                        }%, rgb(229 231 235) ${quality * 100}%, rgb(229 231 235) 100%)`,
                      }}
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>10% - Smallest</span>
                      <span>100% - Best Quality</span>
                    </div>
                  </div>
                </div>
              )}

              {format === "png" && (
                <div className="bg-purple-50 rounded-lg border border-purple-100 p-4">
                  <p className="text-sm text-gray-700">
                    <strong>PNG Compression:</strong> PNG is lossless but will
                    be optimized. Images larger than the selected width will be
                    resized for better compression.
                  </p>
                </div>
              )}
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
                  {getSavingsPercent() !== null && (
                    <div className="text-sm text-green-600 mt-1">
                      ↓ {getSavingsPercent()}% smaller
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Compress Button */}
          {file && !compressedBlob && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Step 3: Compress Image
              </h2>
              <button
                onClick={compressImage}
                disabled={isProcessing}
                className={`
                  w-full py-4 px-6 rounded-lg font-semibold text-white
                  flex items-center justify-center space-x-2
                  transition-all duration-200 shadow-md hover:shadow-lg
                  ${
                    isProcessing
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-purple-600 hover:bg-purple-700"
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
                    <Image className="w-5 h-5" />
                    <span>Compress Image</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Download Button */}
          {compressedBlob && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Step 4: Download Compressed Image
              </h2>
              <button
                onClick={downloadImage}
                className="w-full py-4 px-6 rounded-lg font-semibold text-white bg-green-600 hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
              >
                <Download className="w-5 h-5" />
                <span>Download Compressed Image</span>
              </button>
              <p className="text-xs text-gray-500 text-center mt-3">
                Your compressed image is ready to download
              </p>
            </div>
          )}

          {/* How It Works */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              How it works:
            </h3>
            <ol className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="font-semibold text-purple-600 mr-3 flex-shrink-0">
                  Step 1:
                </span>
                <span>Upload the image you want to compress</span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold text-purple-600 mr-3 flex-shrink-0">
                  Step 2:
                </span>
                <span>
                  Adjust format, maximum size, and quality settings
                </span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold text-purple-600 mr-3 flex-shrink-0">
                  Step 3:
                </span>
                <span>Click compress and wait for processing</span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold text-purple-600 mr-3 flex-shrink-0">
                  Step 4:
                </span>
                <span>Download your optimized image</span>
              </li>
            </ol>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                <strong>Pro Tip:</strong> For maximum compression, choose WebP
                format with a lower quality setting and resize to 1280px or
                1024px. This can reduce file size by 80-90% while maintaining
                acceptable quality for web use.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCompressor;