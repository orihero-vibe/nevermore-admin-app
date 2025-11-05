import React, { useState, useRef, useCallback, useEffect } from 'react';
import CloudUploadIcon from '../assets/icons/cloud-upload';
import CloseIcon from '../assets/icons/close';
import { Button } from './Button';

interface UploadFile {
  id: string;
  file: File;
  progress: number;
}

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete?: (files: File[]) => void;
}

export const FileUploadModal: React.FC<FileUploadModalProps> = ({
  isOpen,
  onClose,
  onUploadComplete,
}) => {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const supportedFormats = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'video/mp4',
    'application/pdf',
    'application/vnd.adobe.photoshop',
    'application/postscript',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ];

  const getFileExtension = (filename: string): string => {
    return filename.split('.').pop()?.toUpperCase() || '';
  };

  const handleFiles = useCallback((fileList: FileList | null) => {
    if (!fileList) return;

    const newFiles: UploadFile[] = Array.from(fileList)
      .filter((file) => {
        // Check if file type is supported
        const isSupported = supportedFormats.some((format) => {
          if (format.includes('*')) return true;
          return file.type === format || file.name.toLowerCase().endsWith(format.split('/')[1]);
        });
        
        // Also check by extension
        const ext = getFileExtension(file.name).toLowerCase();
        const extensionSupported = ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'pdf', 'psd', 'ai', 'doc', 'docx', 'ppt', 'pptx'].includes(ext);
        
        return isSupported || extensionSupported;
      })
      .map((file) => ({
        id: Math.random().toString(36).substring(7),
        file,
        progress: 0,
      }));

    if (newFiles.length > 0) {
      setFiles((prev) => [...prev, ...newFiles]);
      
      // Simulate upload progress
      newFiles.forEach((uploadFile) => {
        simulateUpload(uploadFile.id);
      });
    }
  }, []);

  const simulateUpload = (fileId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
      }
      
      setFiles((prev) =>
        prev.map((f) => (f.id === fileId ? { ...f, progress } : f))
      );
    }, 200);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const handleUploadFile = () => {
    if (files.length === 0) return;
    
    // Wait for all files to complete uploading
    const allComplete = files.every((f) => f.progress === 100);
    if (allComplete) {
      onUploadComplete?.(files.map((f) => f.file));
      setFiles([]);
      onClose();
    } else {
      // If not all files are complete, wait for them
      const interval = setInterval(() => {
        const allComplete = files.every((f) => f.progress === 100);
        if (allComplete) {
          clearInterval(interval);
          onUploadComplete?.(files.map((f) => f.file));
          setFiles([]);
          onClose();
        }
      }, 100);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setFiles([]);
      setIsDragging(false);
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Modal Content */}
      <div
        className="relative backdrop-blur-[10px] bg-[rgba(255,255,255,0.1)] rounded-[16px] p-8 w-[551px] flex flex-col gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
        <h2 className="text-white text-[24px] leading-normal font-cinzel font-normal whitespace-nowrap">
          Upload
        </h2>

        {/* Drag & Drop Area */}
        <div
          ref={dropZoneRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleBrowseClick}
          className={`bg-[rgba(150,92,223,0.1)] border border-[#965cdf] border-dashed rounded-[16px] p-6 flex flex-col gap-4 items-center justify-center cursor-pointer transition-colors ${
            isDragging ? 'bg-[rgba(150,92,223,0.2)]' : 'hover:bg-[rgba(150,92,223,0.15)]'
          }`}
        >
          <CloudUploadIcon width={48} height={48} color="#fff" />
          <div className="flex flex-col items-center text-center w-full">
            <p className="text-white text-[16px] leading-[24px] font-roboto font-medium">
              Drag & drop files or{' '}
              <span className="text-[#965cdf]">Browse</span>
            </p>
            <p className="text-[#8f8f8f] text-[12px] leading-[16px] font-roboto font-normal mt-1">
              Supported formats: JPEG, PNG, GIF, MP4, PDF, PSD, AI, Word, PPT
            </p>
          </div>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.gif,.mp4,.pdf,.psd,.ai,.doc,.docx,.ppt,.pptx"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {/* Uploading Files List */}
        {files.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-white text-[14px] leading-[20px] font-roboto font-normal">
              Uploading
            </p>
            <div className="backdrop-blur-[10px] bg-[rgba(255,255,255,0.07)] rounded-[16px] pt-4 px-4 pb-0 flex flex-col gap-3">
              {files.map((uploadFile, index) => (
                <div key={uploadFile.id} className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <p className="text-white text-[16px] leading-[24px] font-roboto font-medium truncate flex-1">
                      {uploadFile.file.name}
                    </p>
                    <button
                      onClick={() => handleRemoveFile(uploadFile.id)}
                      className="shrink-0 w-6 h-6 flex items-center justify-center ml-2 hover:opacity-80 transition"
                    >
                      <CloseIcon width={24} height={24} color="#8f8f8f" />
                    </button>
                  </div>
                  <div className="bg-[rgba(255,255,255,0.07)] h-[4px] rounded-full overflow-hidden">
                    <div
                      className="bg-[#965cdf] h-full transition-all duration-300 rounded-full"
                      style={{ width: `${uploadFile.progress}%` }}
                    />
                  </div>
                  {index < files.length - 1 && <div className="h-0" />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload File Button */}
        <Button
          onClick={handleUploadFile}
          className="w-full h-[56px] rounded-[12px]"
          disabled={files.length === 0}
        >
          Upload File
        </Button>
      </div>
    </div>
  );
};

