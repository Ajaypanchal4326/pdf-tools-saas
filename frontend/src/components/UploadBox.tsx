import React, { useState, useRef, type DragEvent,} from "react";
import { Upload, FileText, Image, CheckCircle } from "lucide-react";

type AcceptedTypes = "images" | "pdf" | "all";

interface UploadBoxProps {
  onFileSelect: (files: File[]) => void;
  acceptedTypes?: AcceptedTypes;
  multiple?: boolean;
  maxFiles?: number;
  title?: string;
  description?: string;
}

const UploadBox: React.FC<UploadBoxProps> = ({
  onFileSelect,
  acceptedTypes = "all",
  multiple = true,
  maxFiles = 20,
  title,
  description,
}) => {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [selectedCount, setSelectedCount] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // -----------------------------------
  // ACCEPTED FILE TYPES
  // -----------------------------------
  const getAcceptedFiles = (): string => {
    switch (acceptedTypes) {
      case "images":
        return "image/jpeg,image/png,image/jpg,image/webp,image/gif";
      case "pdf":
        return "application/pdf";
      case "all":
        return "image/*,application/pdf";
      default:
        return "*";
    }
  };

  const getFileTypeLabel = (): string => {
    switch (acceptedTypes) {
      case "images":
        return "Images (JPG, PNG, WEBP, GIF)";
      case "pdf":
        return "PDF files";
      case "all":
        return "Images or PDF files";
      default:
        return "Files";
    }
  };

  // -----------------------------------
  // VALIDATE FILES
  // -----------------------------------
  const isValidFileType = (file: File): boolean => {
    const type = file.type.toLowerCase();
    if (acceptedTypes === "images") return type.startsWith("image/");
    if (acceptedTypes === "pdf") return type === "application/pdf";
    return type.startsWith("image/") || type === "application/pdf";
  };

  const handleFiles = (files: FileList | null): void => {
    if (!files) return;

    const validFiles = Array.from(files).filter(isValidFileType);

    if (validFiles.length === 0) {
      alert(`Please upload valid ${getFileTypeLabel()}`);
      return;
    }

    if (validFiles.length > maxFiles) {
      alert(`You can upload up to ${maxFiles} files only`);
      return;
    }

    setSelectedCount(validFiles.length);
    onFileSelect(validFiles);
  };

  // -----------------------------------
  // DRAG EVENTS (FIXED)
  // -----------------------------------
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    // Prevent dragleave from firing when moving inside children
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const withinX = e.clientX >= rect.left && e.clientX <= rect.right;
    const withinY = e.clientY >= rect.top && e.clientY <= rect.bottom;
    if (!withinX || !withinY) setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  // -----------------------------------
  // BROWSE FILES
  // -----------------------------------
  const handleBrowseClick = () => fileInputRef.current?.click();

  // -----------------------------------
  // UI
  // -----------------------------------
  return (
    <div className="w-full">
      <div
        onClick={handleBrowseClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all duration-200
          ${
            isDragging
              ? "border-blue-500 bg-blue-50 scale-[1.02]"
              : "border-gray-300 bg-white hover:border-blue-400 hover:bg-gray-50"
          }
        `}
      >
        {/* Hidden input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={getAcceptedFiles()}
          multiple={multiple}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {/* Content */}
        <div className="flex flex-col items-center justify-center space-y-4 pointer-events-none">

          {/* Icon */}
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-200
              ${isDragging ? "bg-blue-100" : "bg-gray-100"}
            `}
          >
            {selectedCount > 0 ? (
              <CheckCircle className="w-8 h-8 text-green-600" />
            ) : acceptedTypes === "pdf" ? (
              <FileText className="w-8 h-8 text-gray-600" />
            ) : acceptedTypes === "images" ? (
              <Image className="w-8 h-8 text-gray-600" />
            ) : (
              <Upload className="w-8 h-8 text-gray-600" />
            )}
          </div>

          {/* Text */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {title ||
                (selectedCount > 0
                  ? `${selectedCount} file${selectedCount > 1 ? "s" : ""} selected`
                  : "Drop your files here")}
            </h3>

            <p className="text-sm text-gray-600 mb-4">
              {description ||
                (isDragging
                  ? "Release to upload"
                  : `or click to browse • ${getFileTypeLabel()}`)}
            </p>
          </div>

          {/* File Info */}
          <div className="text-xs text-gray-500 text-center space-y-1">
            {multiple && <p>You can upload up to {maxFiles} files</p>}
            <p>Maximum file size: 50MB per file</p>
          </div>
        </div>

        {/* Drag Overlay */}
        {isDragging && (
          <div className="absolute inset-0 bg-blue-50 bg-opacity-80 rounded-xl flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <Upload className="w-12 h-12 text-blue-600 mx-auto mb-2 animate-bounce" />
              <p className="text-lg font-semibold text-blue-600">Drop files here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadBox;
