import React, { useState, useEffect, type JSX } from 'react';
import { X, FileText, Image, File } from 'lucide-react';

interface FileItem {
  file: File;
  id: string;
  preview?: string;
}

interface FilePreviewProps {
  files: File[];
  onRemove: (index: number) => void;
  showThumbnails?: boolean;
}

const FilePreview: React.FC<FilePreviewProps> = ({ 
  files, 
  onRemove,
  showThumbnails = true 
}) => {
  const [fileItems, setFileItems] = useState<FileItem[]>([]);

  // Generate previews for image files
  useEffect(() => {
    const items: FileItem[] = files.map((file, index) => ({
      file,
      id: `${file.name}-${index}-${Date.now()}`,
    }));

    setFileItems(items);

    // Generate image previews
    if (showThumbnails) {
      items.forEach((item) => {
        if (item.file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onloadend = (): void => {
            setFileItems((prev) =>
              prev.map((prevItem) =>
                prevItem.id === item.id
                  ? { ...prevItem, preview: reader.result as string }
                  : prevItem
              )
            );
          };
          reader.readAsDataURL(item.file);
        }
      });
    }
  }, [files, showThumbnails]);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes: string[] = ['Bytes', 'KB', 'MB', 'GB'];
    const i: number = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  // Get file icon
  const getFileIcon = (fileType: string): JSX.Element => {
    if (fileType.startsWith('image/')) {
      return <Image className="w-8 h-8 text-blue-600" />;
    } else if (fileType === 'application/pdf') {
      return <FileText className="w-8 h-8 text-red-600" />;
    } else {
      return <File className="w-8 h-8 text-gray-600" />;
    }
  };

  // Truncate filename
  const truncateFileName = (name: string, maxLength: number = 25): string => {
    if (name.length <= maxLength) return name;
    const extension: string = name.split('.').pop() || '';
    const nameWithoutExt: string = name.substring(0, name.lastIndexOf('.'));
    const truncated: string = nameWithoutExt.substring(0, maxLength - extension.length - 4);
    return `${truncated}...${extension}`;
  };

  // Handle clear all
  const handleClearAll = (): void => {
    for (let i = files.length - 1; i >= 0; i--) {
      onRemove(i);
    }
  };

  if (files.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Selected Files ({files.length})
        </h3>
        {files.length > 1 && (
          <button
            type="button"
            onClick={handleClearAll}
            className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
        <div className="divide-y divide-gray-100">
          {fileItems.map((item, index) => (
            <div
              key={item.id}
              className="p-4 hover:bg-gray-50 transition-colors duration-150"
            >
              <div className="flex items-center space-x-4">
                {/* Thumbnail or Icon */}
                <div className="shrink-0">
                  {item.preview ? (
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                      <img
                        src={item.preview}
                        alt={item.file.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                      {getFileIcon(item.file.type)}
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate" title={item.file.name}>
                    {truncateFileName(item.file.name)}
                  </p>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className="text-xs text-gray-500">
                      {formatFileSize(item.file.size)}
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500 uppercase">
                      {item.file.type.split('/')[1] || 'Unknown'}
                    </span>
                  </div>
                </div>

                {/* Index Badge */}
                <div className="shrink-0">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </div>
                </div>

                {/* Remove Button */}
                <div className="shrink-0">
                  <button
                    type="button"
                    onClick={(): void => onRemove(index)}
                    className="w-8 h-8 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors duration-150 flex items-center justify-center"
                    aria-label={`Remove ${item.file.name}`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-700">
            Total: <span className="font-semibold text-gray-900">{files.length} file{files.length > 1 ? 's' : ''}</span>
          </span>
          <span className="text-gray-700">
            Size: <span className="font-semibold text-gray-900">
              {formatFileSize(files.reduce((acc: number, file: File) => acc + file.size, 0))}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default FilePreview;