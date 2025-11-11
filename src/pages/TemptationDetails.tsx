import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ChevronLeftIcon from '../assets/icons/chevron-left';
import ChevronDownIcon from '../assets/icons/chevron-down';
import CloudUploadIcon from '../assets/icons/cloud-upload';
import CloseIcon from '../assets/icons/close';
import { Select } from '../components/Select';
import type { SelectOption } from '../components/Select';
import { Button } from '../components/Button';
import { AudioPlayer } from '../components/AudioPlayer';
import { FileUploadPopup, type UploadFile } from '../components/FileUploadPopup';
import { fetchCategories, categoriesToSelectOptions, categoriesToCategoryCards, getCategoryName, type Category } from '../lib/categories';
import { publishContent } from '../lib/content';
import { showAppwriteError } from '../lib/notifications';

const roleOptions: SelectOption[] = [
  { value: '', label: 'Select Role' },
  { value: 'support', label: 'Support' },
  { value: 'recovery', label: 'Recovery' },
];

interface TemptationData {
  id?: string;
  title: string;
  category?: string;
  role?: string;
}

export const TemptationDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const temptationData = location.state?.temptationData as TemptationData | undefined;

  const [contentTitle, setContentTitle] = useState('');
  const [categoryType, setCategoryType] = useState('');
  const [role, setRole] = useState('');
  const [uploadedImages, setUploadedImages] = useState<Array<{ id: string; src: string; file: File }>>([]);
  const [uploadedAudioFiles, setUploadedAudioFiles] = useState<File[]>([]);
  const [uploadedTranscript, setUploadedTranscript] = useState<File | null>(null);
  const [transcriptProgress, setTranscriptProgress] = useState(0);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [isUploadingTranscript, setIsUploadingTranscript] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<SelectOption[]>([
    { value: '', label: 'Select Category' },
  ]);
  const [categoryCards, setCategoryCards] = useState<string[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [isUploadPopupOpen, setIsUploadPopupOpen] = useState(false);
  const [uploadType, setUploadType] = useState<'audio' | 'image' | 'transcript' | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishProgress, setPublishProgress] = useState(0);

  // Fetch categories from AppWrite on component mount
  useEffect(() => {
    const loadCategories = async () => {
      setIsLoadingCategories(true);
      setCategoriesError(null);
      try {
        const fetchedCategories = await fetchCategories();
        setCategories(fetchedCategories);
        setCategoryOptions(categoriesToSelectOptions(fetchedCategories));
        setCategoryCards(categoriesToCategoryCards(fetchedCategories));
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        // Get detailed error message
        const errorMessage = error instanceof Error 
          ? error.message 
          : 'Failed to load categories. Please check your AppWrite configuration.';
        setCategoriesError(errorMessage);
        // Keep default empty options on error
      } finally {
        setIsLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  // Load data when component mounts or temptationData changes
  useEffect(() => {
    if (temptationData && categories.length > 0) {
      setContentTitle(temptationData.title || '');
      if (temptationData.category) {
        // Find category by name or ID (for backward compatibility)
        const category = categories.find(
          (cat) => getCategoryName(cat) === temptationData.category || cat.$id === temptationData.category
        );
        if (category) {
          setCategoryType(category.$id);
        } else {
          // If category is already an ID, use it directly
          setCategoryType(temptationData.category);
        }
      }
      if (temptationData.role) {
        setRole(temptationData.role.toLowerCase());
      }
    } else if (temptationData && categories.length === 0 && !isLoadingCategories) {
      // If categories are loaded but not found, still set the title and role
      setContentTitle(temptationData.title || '');
      if (temptationData.role) {
        setRole(temptationData.role.toLowerCase());
      }
    }
  }, [temptationData, categories, isLoadingCategories]);

  const handleBack = () => {
    navigate('/content-management');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent, type: 'image' | 'transcript') => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      if (type === 'image') {
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
      } else {
        const file = files[0];
        setUploadedTranscript(file);
        setIsUploadingTranscript(true);
        setTranscriptProgress(0);
        // Simulate upload progress
        const interval = setInterval(() => {
          setTranscriptProgress((prev) => {
            if (prev >= 100) {
              clearInterval(interval);
              setIsUploadingTranscript(false);
              return 100;
            }
            return prev + Math.random() * 30;
          });
        }, 200);
      }
    }
  };

  const toggleCategory = (category: string) => {
    // Toggle expansion
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });

    // Also select the category in the dropdown
    const categoryDoc = categories.find((cat) => getCategoryName(cat) === category);
    if (categoryDoc) {
      setCategoryType(categoryDoc.$id);
    }
  };

  const handlePublish = async () => {
    // Validate required fields
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

    // Check if we have at least one file uploaded
    if (uploadedImages.length === 0 && uploadedAudioFiles.length === 0 && !uploadedTranscript) {
      showAppwriteError(new Error('Please upload at least one file (image, audio, or transcript)'));
      return;
    }

    setIsPublishing(true);
    setPublishProgress(0);

    try {
      // Extract File objects from uploaded images
      const imageFiles = uploadedImages.map((img) => img.file);
      
      // Publish content (uploads files and creates content document)
      await publishContent(
        {
          title: contentTitle,
          category: categoryType,
          role: role,
          type: 'forty_temptations', // Must be one of: forty_day_journey, forty_temptations
        },
        imageFiles,
        uploadedAudioFiles,
        uploadedTranscript,
        undefined, // tasks (not used for temptations)
        (progress) => {
          setPublishProgress(progress);
        }
      );

      // Navigate back to content management after successful publish
      navigate('/content-management');
    } catch (error) {
      console.error('Error publishing content:', error);
      // Error is already shown by publishContent function
      setIsPublishing(false);
      setPublishProgress(0);
    }
  };

  const handleCancel = () => {
    navigate('/content-management');
  };

  const handleUploadButtonClick = (type: 'audio' | 'image' | 'transcript') => {
    setUploadType(type);
    setIsUploadPopupOpen(true);
  };

  const handleUploadComplete = (uploadFiles: UploadFile[]) => {
    // Route files to their appropriate places based on content type
    const imageFiles: File[] = [];
    const audioFiles: File[] = [];
    const transcriptFiles: File[] = [];

    // Separate files by their content type
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

    // Handle image files - add all to the images array
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

    // Handle audio files - add all to the audio files list
    if (audioFiles.length > 0) {
      setUploadedAudioFiles((prev) => [...prev, ...audioFiles]);
    }

    // Handle transcript files - take the first one (only one is allowed)
    if (transcriptFiles.length > 0) {
      const transcriptFile = transcriptFiles[0];
      setUploadedTranscript(transcriptFile);
      setIsUploadingTranscript(true);
      setTranscriptProgress(0);
      // Simulate upload progress
      const interval = setInterval(() => {
        setTranscriptProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsUploadingTranscript(false);
            return 100;
          }
          return prev + Math.random() * 30;
        });
      }, 200);
    }

    setIsUploadPopupOpen(false);
    setUploadType(null);
  };

  const getUploadPopupConfig = () => {
    // All upload types now accept any file type
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

  // Check if any files have been uploaded
  const hasUploadedFiles = uploadedImages.length > 0 || uploadedAudioFiles.length > 0 || uploadedTranscript !== null;

  return (
    <div className="bg-neutral-950 min-h-screen">
      {/* Header with Back Button and Title */}
      <div className="flex items-center gap-8 px-8 pt-9">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-[#965cdf] text-[12px] hover:opacity-80 transition"
          style={{ fontFamily: 'Roboto, sans-serif' }}
        >
          <ChevronLeftIcon width={24} height={24} color="#965cdf" />
          <span>Back</span>
        </button>
        <h1
          className="text-white text-[24px] leading-[normal]"
          style={{ fontFamily: 'Cinzel, serif', fontWeight: 400 }}
        >
          {uploadedAudioFiles.length > 0 || uploadedTranscript ? 'Content Details' : '40 Temptations'}
        </h1>
      </div>

      {/* Main Content Area */}
      <div className="px-8 pt-9 pb-8">
        <div className="backdrop-blur-[10px] bg-[rgba(255,255,255,0.07)] rounded-[24px] p-8">
          <div className="flex gap-16 items-start mb-16 relative">
            {/* Left Column - Form Fields */}
            <div className="flex-1 flex flex-col gap-10">
              {/* Content Title and Upload Files Button */}
              <div className="flex items-end justify-between gap-4">
                <div className="flex-1">
                  {uploadedAudioFiles.length > 0 || uploadedTranscript ? (
                    <div className="flex flex-col">
                      <label
                        className="text-white text-[14px] leading-[24px] mb-2"
                        style={{ fontFamily: 'Roboto, sans-serif' }}
                      >
                        Title
                      </label>
                      <p
                        className="text-white text-[40px] leading-[40px]"
                        style={{ fontFamily: 'Cinzel, serif', fontWeight: 400 }}
                      >
                        {contentTitle || 'Avoiding the Doctor'}
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <label className="text-white text-[14px] leading-[20px]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        Content Title
                      </label>
                      <input
                        value={contentTitle}
                        onChange={(e) => setContentTitle(e.target.value)}
                        placeholder=" "
                        className="w-full h-[56px] px-4 bg-[#131313] border border-[#965cdf] rounded-[16px] text-white placeholder-[#616161] font-lato text-[16px] leading-[24px] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                      />
                    </div>
                  )}
                </div>
                <Button
                  className="w-[120px] h-[56px]"
                  onClick={() => handleUploadButtonClick('audio')}
                >
                  Upload Files
                </Button>
              </div>

              {/* Category Type and Role */}
              <div className="flex gap-4 items-center">
                <div className="flex-1">
                  <label className="block text-white text-[14px] leading-[20px] mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
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
                <div className="w-[184px]">
                  <label className="block text-white text-[14px] leading-[20px] mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    {uploadedAudioFiles.length > 0 || uploadedTranscript ? 'Role Type' : 'Role'}
                  </label>
                  <Select
                    options={roleOptions}
                    value={role}
                    onChange={setRole}
                    placeholder="Select Role"
                  />
                </div>
              </div>

              {/* Audio Players */}
              {uploadedAudioFiles.length > 0 && (
                <div className="flex flex-col gap-4">
                  {/* Main Content Audio */}
                  {uploadedAudioFiles[0] && (
                    <AudioPlayer
                      label="Main Content"
                      file={uploadedAudioFiles[0]}
                      onRemove={() => setUploadedAudioFiles((prev) => prev.slice(1))}
                    />
                  )}
                  {/* Question Audios */}
                  {uploadedAudioFiles.slice(1).map((file, index) => (
                    <AudioPlayer
                      key={`${file.name}-${index}`}
                      label={`Question ${index + 1}`}
                      file={file}
                      onRemove={() => {
                        setUploadedAudioFiles((prev) => {
                          const newFiles = [...prev];
                          newFiles.splice(index + 1, 1);
                          return newFiles;
                        });
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Category Cards - Positioned absolutely on the left - Hide after file upload */}
            {!hasUploadedFiles && (
              <div className="absolute left-[54px] top-[245px] flex flex-col gap-3 w-[342px]">
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
                      className={`backdrop-blur-[10px] bg-[rgba(255,255,255,0.07)] rounded-[16px] px-3 py-6 flex items-center justify-between transition ${
                        expandedCategories.has(category) ? 'bg-[rgba(255,255,255,0.1)]' : ''
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
            )}

            {/* Right Column - Image and Transcript Upload */}
            <div className="w-[464px] flex flex-col gap-6">
              {/* Image Upload Section */}
              <div className="flex flex-col gap-6">
                {uploadedImages.length > 0 ? (
                  <div className="flex flex-col gap-4">
                    {/* Image Grid - Scrollable container with fixed height */}
                    <div className="h-[364px] overflow-y-auto pr-2 custom-scrollbar">
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
                            {/* Remove Button */}
                            <button
                              onClick={() => handleRemoveImage(image.id)}
                              className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              aria-label="Remove image"
                            >
                              <CloseIcon width={16} height={16} color="#fff" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Button
                      className="w-full h-[56px]"
                      onClick={() => handleUploadButtonClick('image')}
                    >
                      Upload More Images
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
              </div>

              {/* Transcript Upload Section */}
              <div className="flex flex-col gap-2">
                <label
                  className="text-white text-[16px] leading-[24px]"
                  style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 500 }}
                >
                  Transcript:
                </label>
                {uploadedTranscript ? (
                  <div className="backdrop-blur-[10px] bg-[rgba(255,255,255,0.07)] rounded-[16px] pt-4 px-4 pb-0 flex flex-col gap-3 items-start">
                    <div className="flex items-center justify-between w-full">
                      <p
                        className="text-white text-[16px] leading-[24px] truncate"
                        style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 500 }}
                        title={uploadedTranscript.name}
                      >
                        {uploadedTranscript.name}
                      </p>
                      <button
                        onClick={() => {
                          setUploadedTranscript(null);
                          setTranscriptProgress(0);
                          setIsUploadingTranscript(false);
                        }}
                        className="shrink-0 w-6 h-6 flex items-center justify-center hover:opacity-80 transition"
                        aria-label="Remove transcript"
                      >
                        <CloseIcon width={24} height={24} color="#8f8f8f" />
                      </button>
                    </div>
                    {isUploadingTranscript && (
                      <div className="bg-[rgba(255,255,255,0.07)] w-full h-[4px] rounded-full overflow-hidden">
                        <div
                          className="bg-[#965cdf] h-full transition-all duration-300"
                          style={{ width: `${Math.min(transcriptProgress, 100)}%` }}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    className="bg-[rgba(150,92,223,0.1)] border border-[#965cdf] border-dashed rounded-[16px] p-6 flex flex-col items-center justify-center gap-4 cursor-pointer transition hover:bg-[rgba(150,92,223,0.15)]"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, 'transcript')}
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
                        Supported formats: JPEG, PNG, GIF, MP4, PDF, PSD, AI, Word, PPT
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 items-center justify-end">
            <Button
              variant="ghost"
              className="w-[120px] h-[56px] border border-[#965cdf] text-white"
              onClick={handleCancel}
              disabled={isPublishing}
            >
              Cancel
            </Button>
            <Button
              className="w-[120px] h-[56px]"
              onClick={handlePublish}
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
    </div>
  );
};

