import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Button } from '../components/Button';
import { AudioPlayer } from '../components/AudioPlayer';
import { FileUploadPopup, type UploadFile } from '../components/FileUploadPopup';
import ChevronLeftIcon from '../assets/icons/chevron-left';
import PlusIcon from '../assets/icons/plus';
import CloseIcon from '../assets/icons/close';
import { publishContent, updateContentWithFiles, fetchContentById, type ContentDocument } from '../lib/content';
import { showAppwriteError } from '../lib/notifications';

interface JourneyData {
  id?: string;
  title: string;
  tasks?: string[];
  hasAudio?: boolean;
  day?: number;
}

export const Journey40Day = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const journeyData = location.state?.journeyData as JourneyData | undefined;
  const isEditMode = !!params.id || !!journeyData;

  const [contentTitle, setContentTitle] = useState('');
  const [day, setDay] = useState<number | ''>('');
  const [tasks, setTasks] = useState<string[]>(['']);
  const [isUploadPopupOpen, setIsUploadPopupOpen] = useState(false);
  const [uploadedAudioFiles, setUploadedAudioFiles] = useState<File[]>([]);
  const [uploadedAudioUrls, setUploadedAudioUrls] = useState<string[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [publishProgress, setPublishProgress] = useState(0);
  const [saveProgress, setSaveProgress] = useState(0);
  const [originalContentData, setOriginalContentData] = useState<ContentDocument | null>(null);
  const [originalTitle, setOriginalTitle] = useState('');
  const [originalDay, setOriginalDay] = useState<number | ''>('');
  const [originalTasks, setOriginalTasks] = useState<string[]>([]);

  // Load data when component mounts or journeyData changes
  useEffect(() => {
    const loadContentData = async () => {
      if (journeyData?.id && !originalContentData) {
        try {
          const contentDoc = await fetchContentById(journeyData.id);
          if (contentDoc) {
            setOriginalContentData(contentDoc);
            
            // Load audio files from URLs
            if (contentDoc.files && contentDoc.files.length > 0) {
              setUploadedAudioUrls(contentDoc.files);
            }
          }
        } catch (error) {
          console.error('Error loading content data:', error);
        }
      }

      if (journeyData) {
        const title = journeyData.title || '';
        setContentTitle(title);
        setOriginalTitle(title);
        
        const dayValue = journeyData.day !== undefined ? journeyData.day : '';
        setDay(dayValue);
        setOriginalDay(dayValue);
        
        if (journeyData.tasks && journeyData.tasks.length > 0) {
          setTasks(journeyData.tasks);
          setOriginalTasks([...journeyData.tasks]);
        } else {
          setTasks(['']);
          setOriginalTasks([]);
        }
      }
    };

    loadContentData();
  }, [journeyData, originalContentData]);

  const handleTaskChange = (index: number, value: string) => {
    const newTasks = [...tasks];
    newTasks[index] = value;
    setTasks(newTasks);
  };

  const handleAddTask = () => {
    setTasks([...tasks, '']);
  };

  const handleRemoveTask = (index: number) => {
    if (tasks.length > 1) {
      const newTasks = tasks.filter((_, i) => i !== index);
      setTasks(newTasks);
    }
  };

  const handleUploadFiles = () => {
    setIsUploadPopupOpen(true);
  };

  const handleUploadComplete = (uploadFiles: UploadFile[]) => {
    // Filter for audio files only
    const audioFiles = uploadFiles
      .filter((uf) => uf.contentType === 'audio')
      .map((uf) => uf.file);
    
    if (audioFiles.length > 0) {
      setUploadedAudioFiles((prev) => [...prev, ...audioFiles]);
      // If content title is empty, suggest a title from the first file
      if (!contentTitle.trim() && audioFiles[0]) {
        const fileName = audioFiles[0].name;
        const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
        setContentTitle(nameWithoutExt);
      }
    }
    
    // Close the upload popup after handling files
    setIsUploadPopupOpen(false);
  };

  // Check if there are unsaved changes
  const hasUnsavedChanges = () => {
    if (!journeyData?.id) return false;
    
    const titleChanged = contentTitle.trim() !== originalTitle.trim();
    const dayChanged = day !== originalDay;
    const tasksChanged = JSON.stringify(tasks.filter(t => t.trim())) !== JSON.stringify(originalTasks.filter(t => t.trim()));
    
    // Check if new files were uploaded
    const newAudioUploaded = uploadedAudioFiles.length > 0;
    
    // Check if existing files were removed
    const audioRemoved = originalContentData?.files && originalContentData.files.length > 0 && uploadedAudioFiles.length === 0 && uploadedAudioUrls.length === 0;
    
    const filesChanged = newAudioUploaded || audioRemoved;
    
    return titleChanged || dayChanged || tasksChanged || filesChanged;
  };

  const handleSave = async () => {
    if (!journeyData?.id) {
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

    // Check if we have at least one file uploaded (new or existing)
    if (uploadedAudioFiles.length === 0 && uploadedAudioUrls.length === 0) {
      showAppwriteError(new Error('Please upload at least one audio file'));
      return;
    }

    // Filter out empty tasks
    const validTasks = tasks.filter((task) => task.trim().length > 0);

    setIsSaving(true);
    setSaveProgress(0);

    try {
      // Update content (uploads new files and updates content document, preserving existing URLs)
      await updateContentWithFiles(
        journeyData.id,
        {
          title: contentTitle.trim(),
          type: 'forty_day_journey',
          day: day !== '' ? Number(day) : undefined,
        },
        [], // No images for 40-day journey
        uploadedAudioFiles,
        null, // No transcript for journey
        validTasks.length > 0 ? validTasks : undefined,
        (progress) => {
          setSaveProgress(progress);
        },
        [], // No existing image URLs
        uploadedAudioUrls, // Pass existing audio URLs
        null // No transcript URL
      );

      // Reload content to get updated URLs
      const updatedContent = await fetchContentById(journeyData.id);
      if (updatedContent) {
        setOriginalContentData(updatedContent);
        
        // Reload audio URLs
        if (updatedContent.files && updatedContent.files.length > 0) {
          setUploadedAudioUrls(updatedContent.files);
        } else {
          setUploadedAudioUrls([]);
        }
      }

      // Update original values after successful save
      setOriginalTitle(contentTitle);
      setOriginalDay(day);
      setOriginalTasks([...tasks]);
      // Clear newly uploaded files (keep URLs)
      setUploadedAudioFiles([]);
      
      // Navigate back to content management after successful save
      navigate('/content-management');
    } catch (error) {
      console.error('Error saving content:', error);
      // Error is already shown by updateContentWithFiles function
      setIsSaving(false);
      setSaveProgress(0);
    }
  };

  const handlePublish = async () => {
    // Validate required fields
    if (!contentTitle.trim()) {
      showAppwriteError(new Error('Content title is required'));
      return;
    }

    // Check if we have at least one file uploaded
    if (uploadedAudioFiles.length === 0) {
      showAppwriteError(new Error('Please upload at least one audio file'));
      return;
    }

    // Filter out empty tasks
    const validTasks = tasks.filter((task) => task.trim().length > 0);

    // Warn if no tasks are provided (but allow publishing)
    if (validTasks.length === 0) {
      console.warn('No tasks provided for the journey');
    }

    setIsPublishing(true);
    setPublishProgress(0);

    try {
      // Publish content (uploads files and creates content document)
      // Files are uploaded to the same storage bucket
      // Content is saved to the same content table with type 'forty_day_journey'
      await publishContent(
        {
          title: contentTitle.trim(),
          type: 'forty_day_journey', // Content type: forty_day_journey
          day: day !== '' ? Number(day) : undefined, // Day number for 40-day journey
        },
        [], // No images for 40-day journey
        uploadedAudioFiles, // Audio files - uploaded to storage
        null, // No transcript for journey
        validTasks.length > 0 ? validTasks : undefined, // Tasks array - stored in content document
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

  const handleDelete = () => {
    // TODO: Implement delete functionality
    console.log('Delete clicked');
  };

  const handleCancel = () => {
    navigate('/content-management');
  };

  return (
    <div className="bg-neutral-950 min-h-screen">
      {/* Header with Back Button, Title, and Action Buttons */}
      <div className="flex items-center justify-between px-8 pt-9">
        <div className="flex items-center gap-8">
          <button
            onClick={() => navigate('/content-management')}
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
            {isEditMode ? 'Content Details' : 'Upload New Journey'}
          </h1>
        </div>
        {isEditMode && (
          <div className="flex items-center gap-4">
            <Button
              className="w-[120px] h-[56px]"
              onClick={handleSave}
              disabled={isSaving || !journeyData?.id}
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
        )}
      </div>

      {/* Main Content Area */}
      <div className="px-8 pt-9 pb-8">
        <div className="backdrop-blur-[10px] bg-[rgba(255,255,255,0.07)] rounded-[24px] p-8 flex flex-col gap-16 items-center">
        {/* Content Section */}
        <div className="flex gap-16 items-start w-full">
          {/* Left Section - Content Title and Audio */}
          <div className="flex-1 flex flex-col gap-10 items-end">
            {/* Content Title with Upload Button */}
            <div className="flex items-end justify-between gap-4 w-full">
              <div className="flex-1">
                <div className="flex flex-col gap-2">
                  <label className="text-white text-[14px] leading-[20px]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Title
                  </label>
                  <input
                    value={contentTitle}
                    onChange={(e) => setContentTitle(e.target.value)}
                    placeholder=" "
                    className={`w-full ${isEditMode ? 'bg-transparent border-none' : 'h-[56px] bg-[#131313] border border-[#965cdf] rounded-[16px] px-4 focus:ring-2 focus:ring-[#965cdf]'} text-white focus:outline-none placeholder-[#616161]`}
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
                onClick={handleUploadFiles}
                className="w-[120px] h-[56px]"
              >
                Upload Files
              </Button>
            </div>

            {/* Day Field */}
            <div className="w-full flex flex-col gap-2">
              <label className="text-white text-[14px] leading-[20px] font-roboto font-normal">
                Day
              </label>
              <input
                type="number"
                value={day}
                onChange={(e) => setDay(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Enter day number (e.g., 1, 2, 3)"
                min="1"
                max="40"
                className="h-[56px] bg-[#131313] border border-[rgba(255,255,255,0.25)] rounded-[16px] px-4 font-lato text-[16px] leading-[24px] text-white placeholder:text-[#616161] focus:outline-none focus:ring-2 focus:ring-[#965cdf]"
              />
            </div>

            {/* Audio Players */}
            {(uploadedAudioFiles.length > 0 || uploadedAudioUrls.length > 0) && (
              <div className="flex flex-col gap-4 w-full">
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
                      className="w-full"
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
                      className="w-full"
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Section - Tasks */}
          <div className="flex flex-col gap-4 w-[464px]">
            <h3
              className="text-white text-[16px] leading-[24px] font-cinzel font-bold whitespace-nowrap"
              style={{ fontWeight: 550 }}
            >
              Input user tasks below:
            </h3>

            {/* Task Inputs */}
            {tasks.map((task, index) => (
              <div key={index} className="flex gap-2 items-end">
                <div className="flex-1 flex flex-col gap-2">
                  <label className="text-white text-[14px] leading-[20px] font-roboto font-normal">
                    Task {index + 1}
                  </label>
                  <input
                    type="text"
                    value={task}
                    onChange={(e) => handleTaskChange(index, e.target.value)}
                    placeholder={
                      index === 0
                        ? 'Day 2 Check-in'
                        : index === 1
                        ? 'Read a Book'
                        : index === 2
                        ? 'You should listen to this'
                        : 'Exercise'
                    }
                    className="h-[56px] bg-[#131313] border border-[rgba(255,255,255,0.25)] rounded-[16px] px-4 font-lato text-[16px] leading-[24px] text-white placeholder:text-[#616161] focus:outline-none focus:ring-2 focus:ring-[#965cdf]"
                  />
                </div>
                {tasks.length > 1 && (
                  <button
                    onClick={() => handleRemoveTask(index)}
                    className="mb-2 p-2 hover:opacity-80 transition"
                    type="button"
                    aria-label="Remove task"
                  >
                    <CloseIcon width={20} height={20} color="#8f8f8f" />
                  </button>
                )}
              </div>
            ))}

            {/* Add Task Button */}
            <button
              onClick={handleAddTask}
              className="flex items-center gap-2 h-[56px] bg-[#131313] border border-[#965cdf] rounded-[16px] px-4 text-[#965cdf] font-roboto font-medium text-[16px] leading-[24px] hover:bg-[rgba(150,92,223,0.1)] transition-colors"
              type="button"
            >
              <PlusIcon width={20} height={20} color="#965cdf" />
              <span>Add Task</span>
            </button>
          </div>
        </div>

        {/* Action Buttons - Only show for create mode */}
        {!isEditMode && (
          <div className="flex gap-4 items-center justify-end w-full">
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
        )}
      </div>
      </div>

      {/* File Upload Popup */}
      <FileUploadPopup
        isOpen={isUploadPopupOpen}
        onClose={() => setIsUploadPopupOpen(false)}
        onUpload={handleUploadComplete}
        accept="audio/*"
        title="Upload Audio"
        supportedFormats="MP3, WAV, M4A, AAC, OGG, FLAC"
        contentTypes={[
          { value: 'audio', label: 'Audio' },
        ]}
      />
    </div>
  );
};

