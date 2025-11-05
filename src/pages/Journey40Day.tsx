import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Button } from '../components/Button';
import { AudioPlayer } from '../components/AudioPlayer';
import { FileUploadModal } from '../components/FileUploadModal';
import ChevronLeftIcon from '../assets/icons/chevron-left';

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
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

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
    setIsUploadModalOpen(true);
  };

  const handleUploadComplete = (files: File[]) => {
    // TODO: Handle uploaded files
    console.log('Files uploaded:', files);
    setUploadedFiles(files);
    // Show audio player after files are uploaded
    if (files.length > 0) {
      setShowAudioPlayer(true);
      // If content title is empty, set a default from the first file
      if (!contentTitle && files[0]) {
        const fileName = files[0].name;
        const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
        setContentTitle(nameWithoutExt);
      }
    }
  };

  const handlePublish = () => {
    // TODO: Implement publish logic
    console.log('Publishing journey:', { contentTitle, tasks });
    navigate('/content-management');
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
          {isEditMode ? 'Upload New Journey' : showAudioPlayer ? 'Upload New Journey' : '40-Day Journey'}
        </h2>
      </div>

      {/* Main Content Card */}
      <div className="backdrop-blur-[10px] bg-[rgba(255,255,255,0.07)] rounded-[24px] p-8 flex flex-col gap-16 items-center">
        {/* Content Section */}
        <div className="flex gap-16 items-start w-full">
          {/* Left Section - Content Title and Audio */}
          <div className="flex-1 flex flex-col gap-10 items-end">
            {/* Content Title with Upload Button */}
            {showAudioPlayer || isEditMode ? (
              <div className="flex items-end justify-between w-full">
                <div className="flex flex-col gap-0 w-[370px]">
                  <label className="text-white text-[14px] leading-[24px] font-roboto font-normal">
                    Title
                  </label>
                  <h3 className="text-white text-[40px] leading-[40px] font-cinzel font-normal">
                    {contentTitle || 'Day 2'}
                  </h3>
                </div>
                <Button
                  onClick={handleUploadFiles}
                  className="w-[120px] h-[56px] rounded-[12px]"
                >
                  Upload Files
                </Button>
              </div>
            ) : (
              <div className="flex gap-4 items-end w-full">
                <div className="flex-1 flex flex-col gap-2">
                  <label className="text-white text-[14px] leading-[20px] font-roboto font-normal">
                    Content Title
                  </label>
                  <input
                    type="text"
                    value={contentTitle}
                    onChange={(e) => setContentTitle(e.target.value)}
                    placeholder=""
                    className="h-[56px] bg-[#131313] border border-[#965cdf] rounded-[16px] px-4 font-lato text-[16px] leading-[24px] text-white placeholder:text-white focus:outline-none focus:ring-2 focus:ring-[#965cdf]"
                  />
                </div>
                <Button
                  onClick={handleUploadFiles}
                  className="w-[184px] h-[56px] rounded-[12px]"
                >
                  Upload Files
                </Button>
              </div>
            )}

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
        <div className="flex gap-4 items-center">
          <Button
            onClick={handlePublish}
            className="w-[120px] h-[56px] rounded-[12px]"
          >
            Publish
          </Button>
          <button
            onClick={handleCancel}
            className="w-[120px] h-[56px] rounded-[12px] border border-[#965cdf] text-white font-roboto font-medium text-[16px] leading-normal hover:bg-[rgba(150,92,223,0.1)] transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* File Upload Modal */}
      <FileUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadComplete={handleUploadComplete}
      />
    </div>
  );
};

