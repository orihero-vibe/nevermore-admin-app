import { useState, useRef, useEffect } from 'react';
import CloudUploadIcon from '../assets/icons/cloud-upload';
import CloseIcon from '../assets/icons/close';
import { Select } from './Select';
import type { SelectOption } from './Select';
import { Button } from './Button';
import { showWarning } from '../lib/notifications';

export interface UploadFile {
  id: string;
  file: File;
  progress: number;
  contentType: string;
}

export interface FileUploadPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: UploadFile[]) => void | Promise<void>;
  accept?: string;
  contentTypes: SelectOption[];
  maxFiles?: number;
  title?: string;
  supportedFormats?: string;
}

export const FileUploadPopup: React.FC<FileUploadPopupProps> = ({
  isOpen,
  onClose,
  onUpload,
  accept = '*',
  contentTypes,
  maxFiles,
  title = 'Upload',
  supportedFormats = 'JPEG, PNG, GIF, MP4, PDF, PSD, AI, Word, PPT',
}) => {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
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

  // Reset files when modal closes
  useEffect(() => {
    if (!isOpen) {
      setUploadFiles([]);
    }
  }, [isOpen]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    addFiles(files);
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Detects the file type and returns the appropriate content type
   */
  const detectContentType = (file: File): string => {
    const fileName = file.name.toLowerCase();
    const fileType = file.type.toLowerCase();

    // Check for image files
    if (
      fileType.startsWith('image/') ||
      fileName.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg|ico)$/i)
    ) {
      return 'image';
    }

    // Check for audio files
    if (
      fileType.startsWith('audio/') ||
      fileName.match(/\.(mp3|wav|m4a|aac|ogg|flac|wma|opus)$/i)
    ) {
      return 'audio';
    }

    // Check for document/transcript files
    if (
      fileType.includes('pdf') ||
      fileType.includes('document') ||
      fileType.includes('msword') ||
      fileType.includes('wordprocessingml') ||
      fileType.includes('presentation') ||
      fileType.includes('powerpoint') ||
      fileName.match(/\.(pdf|doc|docx|txt|psd|ai|ppt|pptx|rtf|odt)$/i)
    ) {
      return 'transcript';
    }

    // Default to first content type if available, otherwise empty
    return contentTypes.length > 0 ? contentTypes[0].value : '';
  };

  const addFiles = (files: File[]) => {
    // Check if there's already a transcript file
    const hasExistingTranscript = uploadFiles.some(
      (uf) => uf.contentType === 'transcript'
    );

    // Separate files into transcript and non-transcript
    const transcriptFiles: File[] = [];
    const otherFiles: File[] = [];
    let discardedCount = 0;

    files.forEach((file) => {
      const detectedType = detectContentType(file);
      if (detectedType === 'transcript') {
        transcriptFiles.push(file);
      } else {
        otherFiles.push(file);
      }
    });

    // Handle transcript files - only allow one
    let transcriptToAdd: File | null = null;
    if (transcriptFiles.length > 0) {
      if (hasExistingTranscript) {
        // Already have a transcript, discard all new transcript files
        discardedCount = transcriptFiles.length;
      } else {
        // Take only the first transcript file
        transcriptToAdd = transcriptFiles[0];
        discardedCount = transcriptFiles.length - 1;
      }
    }

    // Show warning if files were discarded
    if (discardedCount > 0) {
      showWarning(
        `${discardedCount} transcript file(s) discarded. Only one transcript file is allowed.`
      );
    }

    // Create UploadFile objects with auto-detected content types
    const newFiles: UploadFile[] = [];

    // Add the single transcript file if allowed
    if (transcriptToAdd) {
      newFiles.push({
        id: `${Date.now()}-${Math.random()}`,
        file: transcriptToAdd,
        progress: 0,
        contentType: 'transcript',
      });
    }

    // Add other files with their detected content types
    otherFiles.forEach((file) => {
      newFiles.push({
        id: `${Date.now()}-${Math.random()}`,
        file,
        progress: 0,
        contentType: detectContentType(file),
      });
    });

    setUploadFiles((prev) => {
      const updated = [...prev, ...newFiles];
      // Limit to maxFiles if specified
      if (maxFiles && updated.length > maxFiles) {
        return updated.slice(0, maxFiles);
      }
      return updated;
    });

    // Simulate upload progress for each file
    newFiles.forEach((uploadFile) => {
      simulateUpload(uploadFile.id);
    });
  };

  const simulateUpload = (fileId: string) => {
    // Simulate progress updates
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
      }
      setUploadFiles((prev) =>
        prev.map((f) => (f.id === fileId ? { ...f, progress } : f))
      );
    }, 200);
  };

  const removeFile = (fileId: string) => {
    setUploadFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const updateContentType = (fileId: string, contentType: string) => {
    setUploadFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, contentType } : f))
    );
  };

  const handleUpload = () => {
    onUpload(uploadFiles);
    // Optionally close after upload
    // onClose();
  };

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
        className="relative backdrop-blur-[10px] bg-[rgba(255,255,255,0.1)] rounded-[16px] p-8 w-[700px] max-w-[90vw] max-h-[90vh] flex flex-col gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
        <h2
          className="text-white text-[24px] leading-[normal] whitespace-nowrap"
          style={{ fontFamily: 'Cinzel, serif', fontWeight: 400 }}
        >
          {title}
        </h2>

        {/* Drag & Drop Area */}
        <div
          className="bg-[rgba(150,92,223,0.1)] border border-[#965cdf] border-dashed rounded-[16px] p-6 flex flex-col items-center justify-center gap-4 cursor-pointer transition hover:bg-[rgba(150,92,223,0.15)]"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <CloudUploadIcon width={48} height={48} color="#fff" />
          <div className="text-center">
            <p
              className="text-white text-[16px] leading-[24px] mb-1"
              style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 500 }}
            >
              Drag & drop files or{' '}
              <span className="text-[#965cdf]">Browse</span>
            </p>
            <p
              className="text-[#8f8f8f] text-[12px] leading-[16px]"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              Supported formats: {supportedFormats}
            </p>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Uploading Files List - Scrollable */}
        {uploadFiles.length > 0 && (
          <div className="flex flex-col gap-4 overflow-y-auto overflow-x-hidden max-h-[400px] pr-2 custom-scrollbar min-h-0">
            {uploadFiles.map((uploadFile) => (
              <div key={uploadFile.id} className="flex gap-6 items-start shrink-0 min-w-0">
                {/* File Info with Progress - Fixed width */}
                <div className="w-[380px] flex flex-col gap-2 shrink-0 min-w-0">
                  <label
                    className="text-white text-[14px] leading-[20px]"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    Uploading
                  </label>
                  <div className="backdrop-blur-[10px] bg-[rgba(255,255,255,0.07)] rounded-[16px] pt-4 px-4 pb-0 flex flex-col gap-3 items-start min-w-0">
                    {/* File Name and Close Button */}
                    <div className="flex items-center justify-between w-full gap-2 min-w-0">
                      <p
                        className="text-white text-[16px] leading-[24px] truncate flex-1 min-w-0"
                        style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 500 }}
                        title={uploadFile.file.name}
                      >
                        {uploadFile.file.name}
                      </p>
                      <button
                        onClick={() => removeFile(uploadFile.id)}
                        className="shrink-0 w-6 h-6 flex items-center justify-center hover:opacity-80 transition"
                        aria-label="Remove file"
                      >
                        <CloseIcon
                          width={24}
                          height={24}
                          color="#8f8f8f"
                        />
                      </button>
                    </div>
                    {/* Progress Bar */}
                    <div className="bg-[rgba(255,255,255,0.07)] h-[4px] rounded-full overflow-hidden w-full">
                      <div
                        className="bg-[#965cdf] h-full transition-all duration-300"
                        style={{ width: `${uploadFile.progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Content Type Select - Fixed width */}
                <div className="w-[184px] flex flex-col gap-2 shrink-0">
                  <label
                    className="text-white text-[14px] leading-[20px]"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    Content Type
                  </label>
                  <Select
                    options={contentTypes}
                    value={uploadFile.contentType}
                    onChange={(value) => updateContentType(uploadFile.id, value)}
                    placeholder="Select"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upload Button */}
        {uploadFiles.length > 0 && (
          <Button
            className="w-full h-[56px]"
            onClick={handleUpload}
            disabled={uploadFiles.some((f) => f.progress < 100)}
          >
            Upload File(s)
          </Button>
        )}
      </div>
    </div>
  );
};

