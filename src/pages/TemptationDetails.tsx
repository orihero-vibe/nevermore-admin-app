import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ChevronLeftIcon from '../assets/icons/chevron-left';
import CloudUploadIcon from '../assets/icons/cloud-upload';
import CloseIcon from '../assets/icons/close';
import { Select } from '../components/Select';
import type { SelectOption } from '../components/Select';
import { Button } from '../components/Button';
import { AudioPlayer } from '../components/AudioPlayer';
import { FileUploadPopup, type UploadFile } from '../components/FileUploadPopup';
import { categoriesToSelectOptions, getCategoryName } from '../lib/categories';
import { updateContentWithFiles, fetchContentById, type ContentDocument } from '../lib/content';
import { showAppwriteError } from '../lib/notifications';
import DeleteIcon from '@/assets/icons/delete';
import { useCategoriesStore } from '../store/categoriesStore';

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
  const { categories, isLoading: isLoadingCategories, error: categoriesError, loadCategories } = useCategoriesStore();

  // Redirect to create page if no ID is provided
  useEffect(() => {
    if (!temptationData?.id) {
      navigate('/content-management/create-40-temptations');
    }
  }, [temptationData, navigate]);

  const [contentTitle, setContentTitle] = useState('');
  const [categoryType, setCategoryType] = useState('');
  const [role, setRole] = useState('');
  const [uploadedImages, setUploadedImages] = useState<Array<{ id: string; src: string; file?: File; url?: string }>>([]);
  const [uploadedAudioFiles, setUploadedAudioFiles] = useState<File[]>([]);
  const [uploadedAudioUrls, setUploadedAudioUrls] = useState<string[]>([]);
  const [uploadedTranscript, setUploadedTranscript] = useState<File | null>(null);
  const [uploadedTranscriptUrl, setUploadedTranscriptUrl] = useState<string | null>(null);
  const [transcriptProgress, setTranscriptProgress] = useState(0);
  const [isUploadingTranscript, setIsUploadingTranscript] = useState(false);
  const [isUploadPopupOpen, setIsUploadPopupOpen] = useState(false);
  const [uploadType, setUploadType] = useState<'audio' | 'image' | 'transcript' | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveProgress, setSaveProgress] = useState(0);
  const [originalContentData, setOriginalContentData] = useState<ContentDocument | null>(null);
  const [originalTitle, setOriginalTitle] = useState('');
  const [originalCategory, setOriginalCategory] = useState('');
  const [originalRole, setOriginalRole] = useState('');

  // Fetch categories on mount (only once, centrally managed)
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Memoize category options to avoid recalculation
  const categoryOptions = useMemo(() => categoriesToSelectOptions(categories), [categories]);

  // Load data when component mounts or temptationData changes
  useEffect(() => {
    const loadContentData = async () => {
      if (temptationData?.id && !originalContentData) {
        try {
          const contentDoc = await fetchContentById(temptationData.id);
          if (contentDoc) {
            setOriginalContentData(contentDoc);
            
            // Load images from URLs
            if (contentDoc.images && contentDoc.images.length > 0) {
              const loadedImages = contentDoc.images.map((url, index) => ({
                id: `existing-${index}-${Date.now()}`,
                src: url,
                url: url,
              }));
              setUploadedImages(loadedImages);
            }
            
            // Load audio files from URLs
            if (contentDoc.files && contentDoc.files.length > 0) {
              setUploadedAudioUrls(contentDoc.files);
            }
            
            // Load transcript from URL
            if (contentDoc.transcript) {
              setUploadedTranscriptUrl(contentDoc.transcript);
            }
          }
        } catch (error) {
          console.error('Error loading content data:', error);
        }
      }

      if (temptationData && categories.length > 0) {
        const title = temptationData.title || '';
        setContentTitle(title);
        setOriginalTitle(title);
        
        if (temptationData.category) {
          // Find category by name or ID (for backward compatibility)
          const category = categories.find(
            (cat) => getCategoryName(cat) === temptationData.category || cat.$id === temptationData.category
          );
          if (category) {
            setCategoryType(category.$id);
            setOriginalCategory(category.$id);
          } else {
            // If category is already an ID, use it directly
            setCategoryType(temptationData.category);
            setOriginalCategory(temptationData.category);
          }
        }
        if (temptationData.role) {
          const roleValue = temptationData.role.toLowerCase();
          setRole(roleValue);
          setOriginalRole(roleValue);
        }
      } else if (temptationData && categories.length === 0 && !isLoadingCategories) {
        // If categories are loaded but not found, still set the title and role
        const title = temptationData.title || '';
        setContentTitle(title);
        setOriginalTitle(title);
        if (temptationData.role) {
          const roleValue = temptationData.role.toLowerCase();
          setRole(roleValue);
          setOriginalRole(roleValue);
        }
      }
    };

    loadContentData();
  }, [temptationData, categories, isLoadingCategories, originalContentData]);

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

  // Check if there are unsaved changes
  const hasUnsavedChanges = () => {
    if (!temptationData?.id) return false;
    
    const titleChanged = contentTitle.trim() !== originalTitle.trim();
    const categoryChanged = categoryType !== originalCategory;
    const roleChanged = role !== originalRole;
    
    // Check if new files were uploaded (files with File objects)
    const newImagesUploaded = uploadedImages.some(img => img.file);
    const newAudioUploaded = uploadedAudioFiles.length > 0;
    const newTranscriptUploaded = uploadedTranscript !== null;
    
    // Check if existing files were removed
    const imagesRemoved = originalContentData?.images && originalContentData.images.length > 0 && uploadedImages.length === 0;
    const audioRemoved = originalContentData?.files && originalContentData.files.length > 0 && uploadedAudioFiles.length === 0 && uploadedAudioUrls.length === 0;
    const transcriptRemoved = originalContentData?.transcript && !uploadedTranscript && !uploadedTranscriptUrl;
    
    const filesChanged = newImagesUploaded || newAudioUploaded || newTranscriptUploaded || imagesRemoved || audioRemoved || transcriptRemoved;
    
    return titleChanged || categoryChanged || roleChanged || filesChanged;
  };

  const handleSave = async () => {
    if (!temptationData?.id) {
      showAppwriteError(new Error('Content ID is required to save changes'));
      return;
    }

    // If there are no changes, don't do anything
    if (!hasUnsavedChanges()) {
      return;
    }

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

    setIsSaving(true);
    setSaveProgress(0);

    try {
      // Extract File objects from newly uploaded images (only those with file property)
      const newImageFiles = uploadedImages.filter((img) => img.file).map((img) => img.file!);
      
      // Preserve existing image URLs (those without file property)
      const existingImageUrls = uploadedImages.filter((img) => img.url && !img.file).map((img) => img.url!);
      
      // Update content (uploads new files and updates content document, preserving existing URLs)
      await updateContentWithFiles(
        temptationData.id,
        {
          title: contentTitle,
          category: categoryType,
          role: role,
          type: 'forty_temptations', // Must be one of: forty_day_journey, forty_temptations
        },
        newImageFiles,
        uploadedAudioFiles,
        uploadedTranscript,
        undefined, // tasks (not used for temptations)
        (progress) => {
          setSaveProgress(progress);
        },
        existingImageUrls, // Pass existing image URLs
        uploadedAudioUrls, // Pass existing audio URLs
        uploadedTranscriptUrl // Pass existing transcript URL
      );

      // Reload content to get updated URLs
      const updatedContent = await fetchContentById(temptationData.id);
      if (updatedContent) {
        setOriginalContentData(updatedContent);
        
        // Reload images
        if (updatedContent.images && updatedContent.images.length > 0) {
          const reloadedImages = updatedContent.images.map((url, index) => ({
            id: `existing-${index}-${Date.now()}`,
            src: url,
            url: url,
          }));
          setUploadedImages(reloadedImages);
        } else {
          setUploadedImages([]);
        }
        
        // Reload audio URLs
        if (updatedContent.files && updatedContent.files.length > 0) {
          setUploadedAudioUrls(updatedContent.files);
        } else {
          setUploadedAudioUrls([]);
        }
        
        // Reload transcript URL
        if (updatedContent.transcript) {
          setUploadedTranscriptUrl(updatedContent.transcript);
        } else {
          setUploadedTranscriptUrl(null);
        }
      }

      // Update original values after successful save
      setOriginalTitle(contentTitle);
      setOriginalCategory(categoryType);
      setOriginalRole(role);
      // Clear newly uploaded files (keep URLs)
      setUploadedAudioFiles([]);
      setUploadedTranscript(null);
      
      // Navigate back to content management after successful save
      navigate('/content-management');
    } catch (error) {
      console.error('Error saving content:', error);
      // Error is already shown by updateContentWithFiles function
      setIsSaving(false);
      setSaveProgress(0);
    }
  };


  const handleDelete = () => {
    // TODO: Implement delete functionality
    console.log('Delete clicked');
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

  return (
    <div className="bg-neutral-950 min-h-screen">
      {/* Header with Back Button, Title, and Action Buttons */}
      <div className="flex items-center justify-between px-8 pt-9">
        <div className="flex items-center gap-8">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-[#965cdf] text-[12px] hover:opacity-80 transition cursor-pointer" 
            style={{ fontFamily: 'Roboto, sans-serif' }}
          >
            <ChevronLeftIcon width={24} height={24} color="#965cdf" />
            <span>Back</span>
          </button>
          <h1
            className="text-white text-[24px] leading-[normal]"
            style={{ fontFamily: 'Cinzel, serif', fontWeight: 400 }}
          >
            Content Details
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <Button
            className="w-[120px] h-[56px]"
            onClick={handleSave}
            disabled={isSaving || !temptationData?.id}
          >
            {isSaving ? `Saving... ${saveProgress}%` : hasUnsavedChanges() ? 'Save' : 'Edit'}
          </Button>
          {isSaving && saveProgress > 0 && saveProgress < 100 && (
            <div className="w-[200px] h-[4px] bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden">
              <div
                className="bg-[#965cdf] h-full transition-all duration-300"
                style={{ width: `${saveProgress}%` }}
              />
            </div>
          )}
          <Button
            variant="outline"
            className="w-[120px] h-[56px]"
            onClick={handleDelete}
            disabled={isSaving}
          >
            Delete
          </Button>
        </div>
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
                  <div className="flex flex-col gap-2">
                    <label className="text-white text-[14px] leading-[20px]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Title
                    </label>
                    <input
                      value={contentTitle}
                      onChange={(e) => setContentTitle(e.target.value)}
                      placeholder=" "
                      className="w-full bg-transparent border-none text-white focus:outline-none placeholder-[#616161]"
                      style={{ 
                        fontFamily: 'Cinzel, serif', 
                        fontWeight: 400,
                        fontSize: '40px',
                        lineHeight: 'normal'
                      }}
                    />
                  </div>
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

              {/* Audio Players */}
              {(uploadedAudioFiles.length > 0 || uploadedAudioUrls.length > 0) && (
                <div className="flex flex-col gap-4">
                  {/* Newly uploaded audio files */}
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
                  {/* Existing audio URLs - display as AudioPlayer components */}
                  {uploadedAudioUrls.map((url, index) => {
                    const audioIndex = uploadedAudioFiles.length + index;
                    return (
                      <AudioPlayer
                        key={`existing-audio-${index}`}
                        label={audioIndex === 0 ? 'Main Content' : `Question ${audioIndex}`}
                        url={url}
                        onRemove={() => {
                          setUploadedAudioUrls((prev) => prev.filter((_, i) => i !== index));
                        }}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Column - Image and Transcript Upload */}
            <div className="w-[464px] flex flex-col gap-6">
              {/* Image Upload Section */}
              <div className="flex flex-col gap-6">
                {uploadedImages.length > 0 ? (
                  <div className="flex flex-col gap-4">
                    {/* Image Grid - Scrollable container with fixed height */}
                    <div className="h-[364px] overflow-y-auto pr-2 custom-scrollbar">
                      {uploadedImages.length === 1 ? (
                        // Single image - display larger
                        <div className="relative bg-[#131313] border border-[rgba(255,255,255,0.25)] rounded-[12px] w-full h-full overflow-hidden group">
                          <img
                            src={uploadedImages[0].src}
                            alt="Uploaded content"
                            className="w-full h-full object-cover"
                          />
                          {/* Remove Button */}
                          <button
                            onClick={() => handleRemoveImage(uploadedImages[0].id)}
                            className="absolute top-1.5 right-1.5 w-8 h-8 bg-white/7 backdrop-blur-[20px] rounded-full flex items-center justify-center transition-opacity cursor-pointer"
                            aria-label="Remove image"
                          >
                            <DeleteIcon width={16} height={16} color="#fff" />
                          </button>
                        </div>
                      ) : (
                        // Multiple images - grid layout
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
                {(uploadedTranscript || uploadedTranscriptUrl) ? (
                  <div className="backdrop-blur-[10px] bg-[rgba(255,255,255,0.07)] rounded-[16px] pt-4 px-4 pb-0 flex flex-col gap-3 items-start">
                    <div className="flex items-center justify-between w-full">
                      <p
                        className="text-white text-[16px] leading-[24px] truncate"
                        style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 500 }}
                        title={uploadedTranscript?.name || 'Existing transcript'}
                      >
                        {uploadedTranscript?.name || 'Existing transcript'}
                      </p>
                      <button
                        onClick={() => {
                          setUploadedTranscript(null);
                          setUploadedTranscriptUrl(null);
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

