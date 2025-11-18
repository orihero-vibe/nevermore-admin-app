import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Button } from '../components/Button';
import { AudioPlayer } from '../components/AudioPlayer';
import { FileUploadPopup, type UploadFile } from '../components/FileUploadPopup';
import ChevronLeftIcon from '../assets/icons/chevron-left';
import { publishContent } from '../lib/content';
import { showAppwriteError } from '../lib/notifications';

interface JourneyData {
  id?: string;
  title: string;
  tasks?: string[];
  hasAudio?: boolean;
}

export const Journey40Day = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const journeyData = location.state?.journeyData as JourneyData | undefined;
  const isEditMode = !!params.id || !!journeyData;

  const [contentTitle, setContentTitle] = useState('');
  const [tasks, setTasks] = useState<string[]>(['', '', '', '', '']);
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const [isUploadPopupOpen, setIsUploadPopupOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishProgress, setPublishProgress] = useState(0);

  // Load data when component mounts or journeyData changes
  useEffect(() => {
    if (journeyData) {
      setContentTitle(journeyData.title || '');
      if (journeyData.tasks && journeyData.tasks.length > 0) {
        // Ensure we have exactly 5 tasks, pad with empty strings if needed
        const tasksArray = [...journeyData.tasks];
        while (tasksArray.length < 5) {
          tasksArray.push('');
        }
        setTasks(tasksArray.slice(0, 5));
      }
      // Show audio player if the journey has audio
      if (journeyData.hasAudio) {
        setShowAudioPlayer(true);
        // Create a dummy file for display purposes
        // In a real app, you'd fetch the actual audio file
        const dummyAudioFile = new File([''], 'audio.mp3', { type: 'audio/mpeg' });
        setUploadedFiles([dummyAudioFile]);
      }
    }
  }, [journeyData]);

  const handleTaskChange = (index: number, value: string) => {
    const newTasks = [...tasks];
    newTasks[index] = value;
    setTasks(newTasks);
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
      setUploadedFiles(audioFiles);
      setShowAudioPlayer(true);
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

  const handlePublish = async () => {
    // Validate required fields
    if (!contentTitle.trim()) {
      showAppwriteError(new Error('Content title is required'));
      return;
    }

    // Check if we have at least one file uploaded
    if (uploadedFiles.length === 0) {
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
        },
        [], // No images for 40-day journey
        uploadedFiles, // Audio files - uploaded to storage
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

  const handleCancel = () => {
    navigate('/content-management');
  };

  return (
    <div className="bg-neutral-950 min-h-screen p-8">
      {/* Header with Back Button and Title */}
      <div className="flex gap-8 items-center mb-6">
        <button
          onClick={() => navigate('/content-management')}
          className="flex items-center gap-1 text-[#965cdf] text-[12px] leading-[16px] font-roboto font-normal hover:opacity-80 transition"
        >
          <ChevronLeftIcon width={24} height={24} color="#965cdf" />
          <span>Back</span>
        </button>
        <h2
          className="text-white text-[24px] leading-normal font-cinzel font-normal whitespace-nowrap"
        >
          {isEditMode ? 'Edit 40-Day Journey' : 'Create 40-Day Journey'}
        </h2>
      </div>

      {/* Main Content Card */}
      <div className="backdrop-blur-[10px] bg-[rgba(255,255,255,0.07)] rounded-[24px] p-8 flex flex-col gap-16 items-center">
        {/* Content Section */}
        <div className="flex gap-16 items-start w-full">
          {/* Left Section - Content Title and Audio */}
          <div className="flex-1 flex flex-col gap-10 items-end">
            {/* Content Title with Upload Button */}
            <div className="flex gap-4 items-end w-full">
              <div className="flex-1 flex flex-col gap-2">
                <label className="text-white text-[14px] leading-[20px] font-roboto font-normal">
                  Content Title
                </label>
                <input
                  type="text"
                  value={contentTitle}
                  onChange={(e) => setContentTitle(e.target.value)}
                  placeholder="Enter journey title (e.g., Day 1, Day 2)"
                  className="h-[56px] bg-[#131313] border border-[#965cdf] rounded-[16px] px-4 font-lato text-[16px] leading-[24px] text-white placeholder:text-[#616161] focus:outline-none focus:ring-2 focus:ring-[#965cdf]"
                />
              </div>
              <Button
                onClick={handleUploadFiles}
                className="w-[184px] h-[56px] rounded-[12px]"
              >
                Upload Files
              </Button>
            </div>

            {/* Audio Player */}
            {showAudioPlayer && uploadedFiles.length > 0 && (
              <AudioPlayer
                label="Main Content"
                file={uploadedFiles[0]}
                onRemove={() => {
                  setShowAudioPlayer(false);
                  setUploadedFiles([]);
                }}
                className="w-full"
              />
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
              <div key={index} className="flex flex-col gap-2 h-20">
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
            ))}
          </div>
        </div>

        {/* Action Buttons */}
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

