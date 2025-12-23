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
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';
import { categoriesToSelectOptions, getCategoryName } from '../lib/categories';
import { updateTemptationContent, fetchContentById, getFileNameFromUrl, deleteContent, type ContentDocument, type TemptationFiles, type ExistingTemptationUrls } from '../lib/content';
import { showAppwriteError } from '../lib/notifications';
import DeleteIcon from '@/assets/icons/delete';
import { useCategoriesStore } from '../store/categoriesStore';


// Content type options for file upload (matching CreateTemptation)
const contentTypeOptions: SelectOption[] = [
  { value: 'supportTranscript', label: 'Support Transcript' },
  { value: 'recoveryTranscript', label: 'Recovery Transcript' },
  { value: 'image', label: 'Image' },
  { value: 'mainContentSupport', label: 'Main Content (Support)' },
  { value: 'mainContentRecovery', label: 'Main Content (Recovery)' },
  { value: 'question', label: 'Question' },
];

interface TemptationData {
  id?: string;
  title: string;
  category?: string;
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
  const [uploadedImages, setUploadedImages] = useState<Array<{ id: string; src: string; file?: File; url?: string }>>([]);
  
  // New file state based on content types (matching CreateTemptation)
  const [questionAudioFiles, setQuestionAudioFiles] = useState<File[]>([]);
  const [questionAudioUrls, setQuestionAudioUrls] = useState<string[]>([]);
  const [mainContentSupportFile, setMainContentSupportFile] = useState<File | null>(null);
  const [mainContentSupportUrl, setMainContentSupportUrl] = useState<string | null>(null);
  const [mainContentRecoveryFile, setMainContentRecoveryFile] = useState<File | null>(null);
  const [mainContentRecoveryUrl, setMainContentRecoveryUrl] = useState<string | null>(null);
  const [transcriptSupportFile, setTranscriptSupportFile] = useState<File | null>(null);
  const [transcriptSupportUrl, setTranscriptSupportUrl] = useState<string | null>(null);
  const [transcriptSupportFileName, setTranscriptSupportFileName] = useState<string | null>(null);
  const [transcriptRecoveryFile, setTranscriptRecoveryFile] = useState<File | null>(null);
  const [transcriptRecoveryUrl, setTranscriptRecoveryUrl] = useState<string | null>(null);
  const [transcriptRecoveryFileName, setTranscriptRecoveryFileName] = useState<string | null>(null);
  
  const [isUploadPopupOpen, setIsUploadPopupOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveProgress, setSaveProgress] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [originalContentData, setOriginalContentData] = useState<ContentDocument | null>(null);
  const [originalTitle, setOriginalTitle] = useState('');
  const [originalCategory, setOriginalCategory] = useState('');

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
            
            // Load question audio files from URLs (stored in 'files' field)
            if (contentDoc.files && contentDoc.files.length > 0) {
              setQuestionAudioUrls(contentDoc.files);
            }
            
            // Load Main Content (Support) URL
            if (contentDoc.mainContentSupportURL) {
              setMainContentSupportUrl(contentDoc.mainContentSupportURL);
            }
            
            // Load Main Content (Recovery) URL
            if (contentDoc.mainContentRecoveryURL) {
              setMainContentRecoveryUrl(contentDoc.mainContentRecoveryURL);
            }
            
            // Load Support Transcript URL and fetch file name
            if (contentDoc.transcriptSupportURL) {
              setTranscriptSupportUrl(contentDoc.transcriptSupportURL);
              // Fetch file name from Appwrite Storage
              getFileNameFromUrl(contentDoc.transcriptSupportURL).then((name) => {
                if (name) setTranscriptSupportFileName(name);
              });
            }
            
            // Load Recovery Transcript URL and fetch file name
            if (contentDoc.transcriptRecoveryURL) {
              setTranscriptRecoveryUrl(contentDoc.transcriptRecoveryURL);
              // Fetch file name from Appwrite Storage
              getFileNameFromUrl(contentDoc.transcriptRecoveryURL).then((name) => {
                if (name) setTranscriptRecoveryFileName(name);
              });
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
      } else if (temptationData && categories.length === 0 && !isLoadingCategories) {
        // If categories are loaded but not found, still set the title
        const title = temptationData.title || '';
        setContentTitle(title);
        setOriginalTitle(title);
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

  // Check if there are unsaved changes
  const hasUnsavedChanges = () => {
    if (!temptationData?.id) return false;
    
    const titleChanged = contentTitle.trim() !== originalTitle.trim();
    const categoryChanged = categoryType !== originalCategory;
    
    // Check if new files were uploaded
    const newImagesUploaded = uploadedImages.some(img => img.file);
    const newQuestionAudioUploaded = questionAudioFiles.length > 0;
    const newMainContentSupportUploaded = mainContentSupportFile !== null;
    const newMainContentRecoveryUploaded = mainContentRecoveryFile !== null;
    const newTranscriptSupportUploaded = transcriptSupportFile !== null;
    const newTranscriptRecoveryUploaded = transcriptRecoveryFile !== null;
    
    // Check if existing files were removed (compare existing image count with original)
    const originalImageCount = originalContentData?.images?.length || 0;
    const currentExistingImageCount = uploadedImages.filter(img => img.url && !img.file).length;
    const imagesRemoved = currentExistingImageCount < originalImageCount;
    const questionAudioRemoved = originalContentData?.files && originalContentData.files.length > 0 && questionAudioFiles.length === 0 && questionAudioUrls.length === 0;
    const mainContentSupportRemoved = originalContentData?.mainContentSupportURL && !mainContentSupportFile && !mainContentSupportUrl;
    const mainContentRecoveryRemoved = originalContentData?.mainContentRecoveryURL && !mainContentRecoveryFile && !mainContentRecoveryUrl;
    const transcriptSupportRemoved = originalContentData?.transcriptSupportURL && !transcriptSupportFile && !transcriptSupportUrl;
    const transcriptRecoveryRemoved = originalContentData?.transcriptRecoveryURL && !transcriptRecoveryFile && !transcriptRecoveryUrl;
    
    const filesChanged = newImagesUploaded || newQuestionAudioUploaded || 
      newMainContentSupportUploaded || newMainContentRecoveryUploaded || 
      newTranscriptSupportUploaded || newTranscriptRecoveryUploaded ||
      imagesRemoved || questionAudioRemoved || 
      mainContentSupportRemoved || mainContentRecoveryRemoved ||
      transcriptSupportRemoved || transcriptRecoveryRemoved;
    
    return titleChanged || categoryChanged || filesChanged;
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

    // Validate required fields (same as CreateTemptation)
    if (!contentTitle.trim()) {
      showAppwriteError(new Error('Content title is required'));
      return;
    }

    if (!categoryType) {
      showAppwriteError(new Error('Category is required'));
      return;
    }

    // Check for at least one image (new file or existing URL)
    const hasImages = uploadedImages.length > 0;
    if (!hasImages) {
      showAppwriteError(new Error('Please upload at least one image'));
      return;
    }

    // Check for Main Content Support (new file or existing URL)
    if (!mainContentSupportFile && !mainContentSupportUrl) {
      showAppwriteError(new Error('Main Content (Support) is required'));
      return;
    }

    // Check for Main Content Recovery (new file or existing URL)
    if (!mainContentRecoveryFile && !mainContentRecoveryUrl) {
      showAppwriteError(new Error('Main Content (Recovery) is required'));
      return;
    }

    // Check for Support Transcript (new file or existing URL)
    if (!transcriptSupportFile && !transcriptSupportUrl) {
      showAppwriteError(new Error('Support Transcript is required'));
      return;
    }

    // Check for Recovery Transcript (new file or existing URL)
    if (!transcriptRecoveryFile && !transcriptRecoveryUrl) {
      showAppwriteError(new Error('Recovery Transcript is required'));
      return;
    }

    // Check for at least one Question audio (new file or existing URL)
    const hasQuestionAudio = questionAudioFiles.length > 0 || questionAudioUrls.length > 0;
    if (!hasQuestionAudio) {
      showAppwriteError(new Error('Please upload at least one Question audio file'));
      return;
    }

    setIsSaving(true);
    setSaveProgress(0);

    try {
      // Extract File objects from newly uploaded images (only those with file property)
      const newImageFiles = uploadedImages.filter((img) => img.file).map((img) => img.file!);
      
      // Preserve existing image URLs (those without file property)
      const existingImageUrls = uploadedImages.filter((img) => img.url && !img.file).map((img) => img.url!);
      
      // Prepare temptation files
      const temptationFiles: TemptationFiles = {
        imageFiles: newImageFiles,
        questionFiles: questionAudioFiles,
        mainContentSupportFile: mainContentSupportFile,
        mainContentRecoveryFile: mainContentRecoveryFile,
        transcriptSupportFile: transcriptSupportFile,
        transcriptRecoveryFile: transcriptRecoveryFile,
      };
      
      // Prepare existing URLs
      const existingUrls: ExistingTemptationUrls = {
        imageUrls: existingImageUrls,
        questionUrls: questionAudioUrls,
        mainContentSupportURL: mainContentSupportUrl,
        mainContentRecoveryURL: mainContentRecoveryUrl,
        transcriptSupportURL: transcriptSupportUrl,
        transcriptRecoveryURL: transcriptRecoveryUrl,
      };
      
      // Update content (uploads new files and updates content document, preserving existing URLs)
      await updateTemptationContent(
        temptationData.id,
        {
          title: contentTitle,
          category: categoryType,
          type: 'forty_temptations',
        },
        temptationFiles,
        existingUrls,
        (progress) => {
          setSaveProgress(progress);
        }
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
        
        // Reload question audio URLs
        if (updatedContent.files && updatedContent.files.length > 0) {
          setQuestionAudioUrls(updatedContent.files);
        } else {
          setQuestionAudioUrls([]);
        }
        
        // Reload Main Content URLs
        setMainContentSupportUrl(updatedContent.mainContentSupportURL || null);
        setMainContentRecoveryUrl(updatedContent.mainContentRecoveryURL || null);
        
        // Reload Transcript URLs and fetch file names
        setTranscriptSupportUrl(updatedContent.transcriptSupportURL || null);
        if (updatedContent.transcriptSupportURL) {
          getFileNameFromUrl(updatedContent.transcriptSupportURL).then((name) => {
            if (name) setTranscriptSupportFileName(name);
          });
        } else {
          setTranscriptSupportFileName(null);
        }
        
        setTranscriptRecoveryUrl(updatedContent.transcriptRecoveryURL || null);
        if (updatedContent.transcriptRecoveryURL) {
          getFileNameFromUrl(updatedContent.transcriptRecoveryURL).then((name) => {
            if (name) setTranscriptRecoveryFileName(name);
          });
        } else {
          setTranscriptRecoveryFileName(null);
        }
      }

      // Update original values after successful save
      setOriginalTitle(contentTitle);
      setOriginalCategory(categoryType);
      
      // Clear newly uploaded files (keep URLs)
      setQuestionAudioFiles([]);
      setMainContentSupportFile(null);
      setMainContentRecoveryFile(null);
      setTranscriptSupportFile(null);
      setTranscriptRecoveryFile(null);
      
      // Navigate back to content management after successful save
      navigate('/content-management');
    } catch (error) {
      console.error('Error saving content:', error);
      // Error is already shown by updateTemptationContent function
      setIsSaving(false);
      setSaveProgress(0);
    }
  };


  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!temptationData?.id) {
      showAppwriteError(new Error('Content ID is required to delete'));
      return;
    }

    setIsDeleting(true);
    try {
      await deleteContent(temptationData.id);
      setIsDeleteModalOpen(false);
      navigate('/content-management');
    } catch (error) {
      console.error('Error deleting content:', error);
      setIsDeleting(false);
    }
  };

  const handleUploadButtonClick = () => {
    setIsUploadPopupOpen(true);
  };

  const handleUploadComplete = (uploadFiles: UploadFile[]) => {
    // Route files to their appropriate places based on content type (matching CreateTemptation)
    uploadFiles.forEach((uploadFile) => {
      switch (uploadFile.contentType) {
        case 'image': {
          const reader = new FileReader();
          reader.onloadend = () => {
            setUploadedImages((prev) => [
              ...prev,
              {
                id: `${Date.now()}-${Math.random()}`,
                src: reader.result as string,
                file: uploadFile.file,
              },
            ]);
          };
          reader.readAsDataURL(uploadFile.file);
          break;
        }
        case 'question':
          setQuestionAudioFiles((prev) => [...prev, uploadFile.file]);
          break;
        case 'mainContentSupport':
          setMainContentSupportFile(uploadFile.file);
          break;
        case 'mainContentRecovery':
          setMainContentRecoveryFile(uploadFile.file);
          break;
        case 'supportTranscript':
          setTranscriptSupportFile(uploadFile.file);
          setTranscriptSupportFileName(uploadFile.file.name);
          setTranscriptSupportUrl(null); // Clear existing URL when new file is uploaded
          break;
        case 'recoveryTranscript':
          setTranscriptRecoveryFile(uploadFile.file);
          setTranscriptRecoveryFileName(uploadFile.file.name);
          setTranscriptRecoveryUrl(null); // Clear existing URL when new file is uploaded
          break;
      }
    });

    setIsUploadPopupOpen(false);
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
            disabled={isSaving || isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
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
                  onClick={handleUploadButtonClick}
                >
                  Upload Files
                </Button>
              </div>

              {/* Category Type */}
              <div className="flex flex-col gap-2">
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

              {/* Main Content Audio Players */}
              {(mainContentSupportFile || mainContentSupportUrl || mainContentRecoveryFile || mainContentRecoveryUrl) && (
                <div className="flex flex-col gap-4">
                  {/* Main Content (Support) */}
                  {(mainContentSupportFile || mainContentSupportUrl) && (
                    <AudioPlayer
                      key="main-content-support"
                      label="Main Content (Support)"
                      file={mainContentSupportFile || undefined}
                      url={mainContentSupportFile ? undefined : mainContentSupportUrl || undefined}
                      onRemove={() => {
                        setMainContentSupportFile(null);
                        setMainContentSupportUrl(null);
                      }}
                    />
                  )}
                  {/* Main Content (Recovery) */}
                  {(mainContentRecoveryFile || mainContentRecoveryUrl) && (
                    <AudioPlayer
                      key="main-content-recovery"
                      label="Main Content (Recovery)"
                      file={mainContentRecoveryFile || undefined}
                      url={mainContentRecoveryFile ? undefined : mainContentRecoveryUrl || undefined}
                      onRemove={() => {
                        setMainContentRecoveryFile(null);
                        setMainContentRecoveryUrl(null);
                      }}
                    />
                  )}
                </div>
              )}

              {/* Question Audio Players */}
              {(questionAudioFiles.length > 0 || questionAudioUrls.length > 0) && (
                <div className="flex flex-col gap-4">
                  {/* Newly uploaded question audio files */}
                  {questionAudioFiles.map((file, index) => (
                    <AudioPlayer
                      key={`question-new-${file.name}-${index}`}
                      label={`Question ${index + 1}`}
                      file={file}
                      onRemove={() => {
                        setQuestionAudioFiles((prev) => {
                          const newFiles = [...prev];
                          newFiles.splice(index, 1);
                          return newFiles;
                        });
                      }}
                    />
                  ))}
                  {/* Existing question audio URLs */}
                  {questionAudioUrls.map((url, index) => (
                    <AudioPlayer
                      key={`question-existing-${index}`}
                      label={`Question ${questionAudioFiles.length + index + 1}`}
                      url={url}
                      onRemove={() => {
                        setQuestionAudioUrls((prev) => prev.filter((_, i) => i !== index));
                      }}
                    />
                  ))}
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
                      onClick={handleUploadButtonClick}
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
                      onClick={handleUploadButtonClick}
                    >
                      <div className="text-[#8f8f8f] text-[14px]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        No image uploaded
                      </div>
                    </div>
                    <Button
                      className="w-full h-[56px]"
                      onClick={handleUploadButtonClick}
                    >
                      Upload Files
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
                  Transcripts:
                </label>
                {(transcriptSupportFile || transcriptSupportUrl || transcriptRecoveryFile || transcriptRecoveryUrl) ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {/* Support Transcript */}
                      {(transcriptSupportFile || transcriptSupportUrl) && (
                        <div className="backdrop-blur-[10px] bg-[rgba(255,255,255,0.07)] rounded-[16px] pt-4 px-4 pb-4 flex flex-col gap-3 items-start">
                          <div className="flex items-center justify-between w-full">
                            <div className="flex flex-col gap-1 flex-1 min-w-0">
                              <span className="text-[#965cdf] text-[12px]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                Support Transcript
                              </span>
                              <p
                                className="text-white text-[16px] leading-[24px] truncate"
                                style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 500 }}
                                title={transcriptSupportFile?.name || transcriptSupportFileName || (transcriptSupportUrl ? 'Loading...' : 'No file')}
                              >
                                {transcriptSupportFile?.name || transcriptSupportFileName || (transcriptSupportUrl ? 'Loading...' : 'No file')}
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                setTranscriptSupportFile(null);
                                setTranscriptSupportUrl(null);
                                setTranscriptSupportFileName(null);
                              }}
                              className="shrink-0 w-6 h-6 flex items-center justify-center hover:opacity-80 transition"
                              aria-label="Remove transcript"
                            >
                              <CloseIcon width={24} height={24} color="#8f8f8f" />
                            </button>
                          </div>
                        </div>
                      )}
                      {/* Recovery Transcript */}
                      {(transcriptRecoveryFile || transcriptRecoveryUrl) && (
                        <div className="backdrop-blur-[10px] bg-[rgba(255,255,255,0.07)] rounded-[16px] pt-4 px-4 pb-4 flex flex-col gap-3 items-start">
                          <div className="flex items-center justify-between w-full">
                            <div className="flex flex-col gap-1 flex-1 min-w-0">
                              <span className="text-[#965cdf] text-[12px]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                Recovery Transcript
                              </span>
                              <p
                                className="text-white text-[16px] leading-[24px] truncate"
                                style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 500 }}
                                title={transcriptRecoveryFile?.name || transcriptRecoveryFileName || (transcriptRecoveryUrl ? 'Loading...' : 'No file')}
                              >
                                {transcriptRecoveryFile?.name || transcriptRecoveryFileName || (transcriptRecoveryUrl ? 'Loading...' : 'No file')}
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                setTranscriptRecoveryFile(null);
                                setTranscriptRecoveryUrl(null);
                                setTranscriptRecoveryFileName(null);
                              }}
                              className="shrink-0 w-6 h-6 flex items-center justify-center hover:opacity-80 transition"
                              aria-label="Remove transcript"
                            >
                              <CloseIcon width={24} height={24} color="#8f8f8f" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    {/* Show upload button if missing one or both transcripts */}
                    {(!transcriptSupportFile && !transcriptSupportUrl) || (!transcriptRecoveryFile && !transcriptRecoveryUrl) ? (
                      <Button
                        className="w-full h-[56px]"
                        onClick={handleUploadButtonClick}
                      >
                        Upload {!transcriptSupportFile && !transcriptSupportUrl ? 'Support' : 'Recovery'} Transcript
                      </Button>
                    ) : null}
                  </div>
                ) : (
                  <div
                    className="bg-[rgba(150,92,223,0.1)] border border-[#965cdf] border-dashed rounded-[16px] p-6 flex flex-col items-center justify-center gap-4 cursor-pointer transition hover:bg-[rgba(150,92,223,0.15)]"
                    onClick={handleUploadButtonClick}
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
                        Support Transcript & Recovery Transcript
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
      <FileUploadPopup
        isOpen={isUploadPopupOpen}
        onClose={() => setIsUploadPopupOpen(false)}
        onUpload={handleUploadComplete}
        accept="*"
        title="Upload Files"
        supportedFormats="Images, Audio (MP3, WAV, M4A), Documents (PDF, DOC, DOCX)"
        contentTypes={contentTypeOptions}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={contentTitle || undefined}
        isLoading={isDeleting}
      />
    </div>
  );
};

