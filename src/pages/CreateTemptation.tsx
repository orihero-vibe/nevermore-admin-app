import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ChevronLeftIcon from '../assets/icons/chevron-left';
import ChevronDownIcon from '../assets/icons/chevron-down';
import CloudUploadIcon from '../assets/icons/cloud-upload';
import CloseIcon from '../assets/icons/close';
import { Select } from '../components/Select';
import type { SelectOption } from '../components/Select';
import { Button } from '../components/Button';
import { AudioPlayer } from '../components/AudioPlayer';
import { FileUploadPopup, type UploadFile } from '../components/FileUploadPopup';
import { TranscriptUploadModal, type TranscriptFile } from '../components/TranscriptUploadModal';
import { categoriesToSelectOptions, categoriesToCategoryCards, getCategoryName } from '../lib/categories';
import { publishContent } from '../lib/content';
import { showAppwriteError } from '../lib/notifications';
import DeleteIcon from '@/assets/icons/delete';
import { useCategoriesStore } from '../store/categoriesStore';

const roleOptions: SelectOption[] = [
  { value: '', label: 'Select Role' },
  { value: 'support', label: 'Support' },
  { value: 'recovery', label: 'Recovery' },
];

export const CreateTemptation = () => {
  const navigate = useNavigate();
  const { categories, isLoading: isLoadingCategories, error: categoriesError, loadCategories } = useCategoriesStore();

  const [contentTitle, setContentTitle] = useState('');
  const [categoryType, setCategoryType] = useState('');
  const [role, setRole] = useState('');
  const [uploadedImages, setUploadedImages] = useState<Array<{ id: string; src: string; file: File }>>([]);
  const [uploadedAudioFiles, setUploadedAudioFiles] = useState<File[]>([]);
  const [uploadedTranscripts, setUploadedTranscripts] = useState<TranscriptFile[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [isTranscriptModalOpen, setIsTranscriptModalOpen] = useState(false);
  const [isUploadPopupOpen, setIsUploadPopupOpen] = useState(false);
  const [uploadType, setUploadType] = useState<'audio' | 'image' | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishProgress, setPublishProgress] = useState(0);

  // Fetch categories on mount (only once, centrally managed)
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Memoize category options and cards to avoid recalculation
  const categoryOptions = useMemo(() => categoriesToSelectOptions(categories), [categories]);
  const categoryCards = useMemo(() => categoriesToCategoryCards(categories), [categories]);

  const handleBack = () => {
    navigate('/content-management');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent, type: 'image') => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && type === 'image') {
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setUploadedImages((prev) => [
            ...prev,
            {
              id: `${Date.now()}-${Math.random()}`,
              src: reader.result as string,
              file,
            },
          ]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });

    const categoryDoc = categories.find((cat) => getCategoryName(cat) === category);
    if (categoryDoc) {
      setCategoryType(categoryDoc.$id);
    }
  };

  const handleUploadButtonClick = (type: 'audio' | 'image' | 'transcript') => {
    if (type === 'transcript') {
      setIsTranscriptModalOpen(true);
    } else {
      setUploadType(type);
      setIsUploadPopupOpen(true);
    }
  };

  const handleTranscriptUploadComplete = (transcriptFiles: TranscriptFile[]) => {
    setUploadedTranscripts(transcriptFiles);
    setIsTranscriptModalOpen(false);
  };

  const handleUploadComplete = (uploadFiles: UploadFile[]) => {
    const imageFiles: File[] = [];
    const audioFiles: File[] = [];
    const transcriptFiles: File[] = [];

    uploadFiles.forEach((uploadFile) => {
      switch (uploadFile.contentType) {
        case 'image':
          imageFiles.push(uploadFile.file);
          break;
        case 'audio':
          audioFiles.push(uploadFile.file);
          break;
        case 'transcript':
          transcriptFiles.push(uploadFile.file);
          break;
      }
    });

    if (imageFiles.length > 0) {
      imageFiles.forEach((imageFile) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setUploadedImages((prev) => [
            ...prev,
            {
              id: `${Date.now()}-${Math.random()}`,
              src: reader.result as string,
              file: imageFile,
            },
          ]);
        };
        reader.readAsDataURL(imageFile);
      });
    }

    if (audioFiles.length > 0) {
      setUploadedAudioFiles((prev) => [...prev, ...audioFiles]);
      if (!contentTitle.trim() && audioFiles[0]) {
        const fileName = audioFiles[0].name;
        const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
        setContentTitle(nameWithoutExt);
      }
    }

    // Transcript files are now handled separately via TranscriptUploadModal
    // This code path is kept for backward compatibility but shouldn't be reached

    setIsUploadPopupOpen(false);
    setUploadType(null);
  };

  const getUploadPopupConfig = () => {
    return {
      accept: '*',
      title: 'Upload',
      supportedFormats: 'JPEG, PNG, GIF, MP4, PDF, PSD, AI, Word, PPT',
      maxFiles: undefined,
    };
  };

  const handleRemoveImage = (imageId: string) => {
    setUploadedImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const handlePublish = async () => {
    if (!contentTitle.trim()) {
      showAppwriteError(new Error('Content title is required'));
      return;
    }

    if (!categoryType) {
      showAppwriteError(new Error('Category is required'));
      return;
    }

    if (!role) {
      showAppwriteError(new Error('Role is required'));
      return;
    }

    if (uploadedAudioFiles.length === 0) {
      showAppwriteError(new Error('Please upload at least one audio file'));
      return;
    }

    setIsPublishing(true);
    setPublishProgress(0);

    try {
      const imageFiles = uploadedImages.map((img) => img.file);
      const transcriptFiles = uploadedTranscripts.map((t) => t.file);
      
      await publishContent(
        {
          title: contentTitle.trim(),
          category: categoryType,
          role: role,
          type: 'forty_temptations',
        },
        imageFiles,
        uploadedAudioFiles,
        null, // Single transcript file (deprecated)
        transcriptFiles.length > 0 ? transcriptFiles : undefined, // Multiple transcript files
        undefined,
        (progress) => {
          setPublishProgress(progress);
        }
      );

      navigate('/content-management');
    } catch (error) {
      console.error('Error publishing content:', error);
      setIsPublishing(false);
      setPublishProgress(0);
    }
  };

  const handleCancel = () => {
    navigate('/content-management');
  };

  return (
    <div className="bg-neutral-950 min-h-screen">
      {/* Header with Back Button and Title */}
      <div className="flex items-center px-8 pt-9">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-[#965cdf] text-[12px] hover:opacity-80 transition cursor-pointer" 
          style={{ fontFamily: 'Roboto, sans-serif' }}
        >
          <ChevronLeftIcon width={24} height={24} color="#965cdf" />
          <span>Back</span>
        </button>
        <h1
          className="ml-8 text-white text-[24px] leading-[normal]"
          style={{ fontFamily: 'Cinzel, serif', fontWeight: 400 }}
        >
          40 TEMPTATIONS
        </h1>
      </div>

      {/* Main Content Area */}
      <div className="px-8 pt-9 pb-8">
        <div className="backdrop-blur-[10px] bg-[rgba(255,255,255,0.07)] rounded-[24px] p-8">
          <div className="flex gap-16 items-start">
            {/* Left Column - Form Fields */}
            <div className="flex-1 flex flex-col gap-10">
              {/* Content Title with Upload Audio Files Button */}
              <div className="flex items-end justify-between gap-4">
                <div className="flex-1 flex flex-col gap-2">
                  <label className="text-white text-[14px] leading-[20px]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Content Title
                  </label>
                  <input
                    value={contentTitle}
                    onChange={(e) => setContentTitle(e.target.value)}
                    placeholder=" "
                    className="w-full h-[56px] bg-transparent border border-[#965cdf] rounded-[16px] px-4 text-white focus:outline-none focus:ring-2 focus:ring-[#965cdf] placeholder-[#616161]"
                    style={{ 
                      fontFamily: 'Roboto, sans-serif',
                      fontSize: '16px',
                      lineHeight: '24px'
                    }}
                  />
                </div>
                <Button
                  className="w-[200px] h-[56px] shrink-0"
                  onClick={() => handleUploadButtonClick('audio')}
                >
                  Upload Audio Files
                </Button>
              </div>

              {/* Category Type and Role - Side by Side */}
              <div className="flex gap-4">
                <div className="flex-1 flex flex-col gap-2">
                  <label className="text-white text-[14px] leading-[20px]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Category Type
                    {isLoadingCategories && (
                      <span className="text-[#8f8f8f] text-[12px] ml-2">(Loading...)</span>
                    )}
                    {categoriesError && (
                      <span className="text-red-400 text-[12px] ml-2" title={categoriesError}>
                        (Error - check console)
                      </span>
                    )}
                  </label>
                  <Select
                    options={categoryOptions}
                    value={categoryType}
                    onChange={setCategoryType}
                    placeholder={isLoadingCategories ? 'Loading categories...' : 'Select Category'}
                  />
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <label className="text-white text-[14px] leading-[20px]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Role
                  </label>
                  <Select
                    options={roleOptions}
                    value={role}
                    onChange={setRole}
                    placeholder="Select Role"
                  />
                </div>
              </div>

              {/* Pre-defined Categories */}
              <div className="flex flex-col gap-3 px-[10%] max-h-[420px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {isLoadingCategories ? (
                  <div className="text-[#8f8f8f] text-[14px] p-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Loading categories...
                  </div>
                ) : categoriesError ? (
                  <div className="text-red-400 text-[12px] p-4 whitespace-pre-line" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    {categoriesError}
                  </div>
                ) : categoryCards.length > 0 ? (
                  categoryCards.map((category) => (
                    <button
                      key={category}
                      onClick={() => toggleCategory(category)}
                      className={`w-[400px] backdrop-blur-[20px] bg-[rgba(255,255,255,0.07)] rounded-[16px] px-3 py-6 flex items-center justify-between transition ${
                        expandedCategories.has(category) || categoryType === categories.find(cat => getCategoryName(cat) === category)?.$id ? 'bg-[rgba(255,255,255,0.1)] border border-[#965cdf]' : ''
                      }`}
                    >
                      <span
                        className="text-white text-[14px] leading-[24px] whitespace-nowrap"
                        style={{ fontFamily: 'Cinzel, serif', fontWeight: 550 }}
                      >
                        {category}
                      </span>
                      <div className="bg-[rgba(255,255,255,0.2)] rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                        <ChevronDownIcon
                          width={20}
                          height={20}
                          color="#fff"
                          className={`transition-transform ${
                            expandedCategories.has(category) ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="text-[#8f8f8f] text-[14px] p-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    No categories available
                  </div>
                )}
              </div>

              {/* Audio Players */}
              {uploadedAudioFiles.length > 0 && (
                <div className="flex flex-col gap-4">
                  {uploadedAudioFiles.map((file, index) => {
                    const audioIndex = index;
                    return (
                      <AudioPlayer
                        key={`new-${file.name}-${index}`}
                        label={audioIndex === 0 ? 'Main Content' : `Question ${audioIndex}`}
                        file={file}
                        onRemove={() => {
                          setUploadedAudioFiles((prev) => {
                            const newFiles = [...prev];
                            newFiles.splice(index, 1);
                            return newFiles;
                          });
                        }}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Column - Uploads */}
            <div className="w-[464px] flex flex-col gap-6">
              {/* Image/Video Placeholder */}
              {uploadedImages.length > 0 ? (
                <div className="flex flex-col gap-4">
                  <div className="h-[364px] overflow-y-auto pr-2 custom-scrollbar">
                    {uploadedImages.length === 1 ? (
                      <div className="relative bg-[#131313] border border-[rgba(255,255,255,0.25)] rounded-[12px] w-full h-full overflow-hidden group">
                        <img
                          src={uploadedImages[0].src}
                          alt="Uploaded content"
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => handleRemoveImage(uploadedImages[0].id)}
                          className="absolute top-1.5 right-1.5 w-8 h-8 bg-white/7 backdrop-blur-[20px] rounded-full flex items-center justify-center transition-opacity cursor-pointer"
                          aria-label="Remove image"
                        >
                          <DeleteIcon width={16} height={16} color="#fff" />
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-3">
                        {uploadedImages.map((image) => (
                          <div
                            key={image.id}
                            className="relative bg-[#131313] border border-[rgba(255,255,255,0.25)] rounded-[12px] h-[110px] overflow-hidden group"
                          >
                            <img
                              src={image.src}
                              alt="Uploaded content"
                              className="w-full h-full object-cover"
                            />
                            <button
                              onClick={() => handleRemoveImage(image.id)}
                              className="absolute top-1.5 right-1.5 w-8 h-8 bg-white/7 backdrop-blur-[20px] rounded-full flex items-center justify-center transition-opacity cursor-pointer"
                              aria-label="Remove image"
                            >
                              <DeleteIcon width={16} height={16} color="#fff" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button
                    className="w-full h-[56px]"
                    onClick={() => handleUploadButtonClick('image')}
                  >
                    Upload Image(s)
                  </Button>
                </div>
              ) : (
                <>
                  <div
                    className="bg-[#131313] border border-[rgba(255,255,255,0.25)] rounded-[16px] h-[364px] flex items-center justify-center overflow-hidden cursor-pointer hover:border-[#965cdf] transition-colors"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, 'image')}
                    onClick={() => handleUploadButtonClick('image')}
                  >
                    <div className="text-[#8f8f8f] text-[14px]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      No image uploaded
                    </div>
                  </div>
                  <Button
                    className="w-full h-[56px]"
                    onClick={() => handleUploadButtonClick('image')}
                  >
                    Upload Image(s)
                  </Button>
                </>
              )}

              {/* Transcript Upload Section */}
              <div className="flex flex-col gap-2">
                <label
                  className="text-white text-[16px] leading-[24px]"
                  style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 500 }}
                >
                  Transcripts:
                </label>
                {uploadedTranscripts.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {uploadedTranscripts.map((transcript) => (
                        <div
                          key={transcript.id}
                          className="backdrop-blur-[10px] bg-[rgba(255,255,255,0.07)] rounded-[16px] pt-4 px-4 pb-4 flex flex-col gap-3 items-start"
                        >
                          <div className="flex items-center justify-between w-full">
                            <p
                              className="text-white text-[16px] leading-[24px] truncate flex-1"
                              style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 500 }}
                              title={transcript.file.name}
                            >
                              {transcript.file.name}
                            </p>
                            <button
                              onClick={() => {
                                setUploadedTranscripts((prev) =>
                                  prev.filter((t) => t.id !== transcript.id)
                                );
                              }}
                              className="shrink-0 w-6 h-6 flex items-center justify-center hover:opacity-80 transition"
                              aria-label="Remove transcript"
                            >
                              <CloseIcon width={24} height={24} color="#8f8f8f" />
                            </button>
                          </div>
                          {transcript.progress < 100 && (
                            <div className="bg-[rgba(255,255,255,0.07)] w-full h-[4px] rounded-full overflow-hidden">
                              <div
                                className="bg-[#965cdf] h-full transition-all duration-300"
                                style={{ width: `${Math.min(transcript.progress, 100)}%` }}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <Button
                      className="w-full h-[56px]"
                      onClick={() => handleUploadButtonClick('transcript')}
                    >
                      Upload More Transcripts
                    </Button>
                  </div>
                ) : (
                  <div
                    className="bg-[rgba(150,92,223,0.1)] border border-[#965cdf] border-dashed rounded-[16px] p-6 flex flex-col items-center justify-center gap-4 cursor-pointer transition hover:bg-[rgba(150,92,223,0.15)]"
                    onClick={() => handleUploadButtonClick('transcript')}
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
                        Supported formats: PDF, DOC, DOCX, TXT, RTF, ODT
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 items-center justify-center mt-8">
            <button
              onClick={handleCancel}
              disabled={isPublishing}
              className="w-[120px] h-[56px] rounded-[12px] border border-[#965cdf] text-white font-roboto font-medium text-[16px] leading-normal hover:bg-[rgba(150,92,223,0.1)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <Button
              onClick={handlePublish}
              className="w-[120px] h-[56px] rounded-[12px]"
              disabled={isPublishing}
            >
              {isPublishing ? `Publishing... ${publishProgress}%` : 'Publish'}
            </Button>
            {isPublishing && publishProgress > 0 && publishProgress < 100 && (
              <div className="w-[200px] h-[4px] bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden">
                <div
                  className="bg-[#965cdf] h-full transition-all duration-300"
                  style={{ width: `${publishProgress}%` }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* File Upload Popup */}
      {uploadType && (
        <FileUploadPopup
          isOpen={isUploadPopupOpen}
          onClose={() => {
            setIsUploadPopupOpen(false);
            setUploadType(null);
          }}
          onUpload={handleUploadComplete}
          accept={getUploadPopupConfig().accept}
          maxFiles={getUploadPopupConfig().maxFiles}
          title={getUploadPopupConfig().title}
          supportedFormats={getUploadPopupConfig().supportedFormats}
          contentTypes={[
            { value: 'image', label: 'Image' },
            { value: 'transcript', label: 'Transcript' },
            { value: 'audio', label: 'Audio' },
          ]}
        />
      )}

      {/* Transcript Upload Modal */}
      <TranscriptUploadModal
        isOpen={isTranscriptModalOpen}
        onClose={() => setIsTranscriptModalOpen(false)}
        onUpload={handleTranscriptUploadComplete}
        accept=".pdf,.doc,.docx,.txt,.rtf,.odt"
        supportedFormats="PDF, DOC, DOCX, TXT, RTF, ODT"
      />
    </div>
  );
};

