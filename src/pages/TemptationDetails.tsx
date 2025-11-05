import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ChevronLeftIcon from '../assets/icons/chevron-left';
import ChevronDownIcon from '../assets/icons/chevron-down';
import CloudUploadIcon from '../assets/icons/cloud-upload';
import CloseIcon from '../assets/icons/close';
import { Select } from '../components/Select';
import type { SelectOption } from '../components/Select';
import { Button } from '../components/Button';
import { AudioPlayer } from '../components/AudioPlayer';

const categoryOptions: SelectOption[] = [
  { value: '', label: 'Select Category' },
  { value: 'physical-health', label: 'Physical Health & Medical Avoidance' },
  { value: 'emotional-psychological', label: 'Emotional & Psychological Triggers' },
  { value: 'social-relationship', label: 'Social & Relationship Dynamics' },
  { value: 'cultural-societal', label: 'Cultural & Societal Influences' },
  { value: 'financial-lifestyle', label: 'Financial & Lifestyle Impacts' },
];

const roleOptions: SelectOption[] = [
  { value: '', label: 'Select Role' },
  { value: 'support', label: 'Support' },
  { value: 'recovery', label: 'Recovery' },
  { value: 'prevention', label: 'Prevention' },
];

const categoryCards = [
  'Physical Health & Medical Avoidance',
  'Emotional & Psychological Triggers',
  'Social & Relationship Dynamics',
  'Cultural & Societal Influences',
  'Financial & Lifestyle Impacts',
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
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedAudioFiles, setUploadedAudioFiles] = useState<File[]>([]);
  const [uploadedTranscript, setUploadedTranscript] = useState<File | null>(null);
  const [transcriptProgress, setTranscriptProgress] = useState(0);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [isUploadingTranscript, setIsUploadingTranscript] = useState(false);

  // Load data when component mounts or temptationData changes
  useEffect(() => {
    if (temptationData) {
      setContentTitle(temptationData.title || '');
      if (temptationData.category) {
        // Map category name to category value
        const categoryMap: Record<string, string> = {
          'Physical Health & Medical Avoidance': 'physical-health',
          'Emotional & Psychological Triggers': 'emotional-psychological',
          'Social & Relationship Dynamics': 'social-relationship',
          'Cultural & Societal Influences': 'cultural-societal',
          'Financial & Lifestyle Impacts': 'financial-lifestyle',
        };
        setCategoryType(categoryMap[temptationData.category] || temptationData.category);
      }
      if (temptationData.role) {
        setRole(temptationData.role.toLowerCase());
      }
    }
  }, [temptationData]);

  const audioFileInputRef = useRef<HTMLInputElement>(null);
  const imageFileInputRef = useRef<HTMLInputElement>(null);
  const transcriptFileInputRef = useRef<HTMLInputElement>(null);

  const handleBack = () => {
    navigate('/content-management');
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setUploadedAudioFiles((prev) => [...prev, ...files]);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTranscriptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent, type: 'image' | 'transcript') => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files[0];
    if (file) {
      if (type === 'image') {
        const reader = new FileReader();
        reader.onloadend = () => {
          setUploadedImage(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
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
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const handlePublish = () => {
    // TODO: Implement publish logic
    console.log('Publishing content:', {
      contentTitle,
      categoryType,
      role,
      uploadedImage,
      uploadedAudioFiles,
      uploadedTranscript,
    });
    // Navigate back to content management after publish
    navigate('/content-management');
  };

  const handleCancel = () => {
    navigate('/content-management');
  };

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
                  onClick={() => audioFileInputRef.current?.click()}
                >
                  Upload Files
                </Button>
                <input
                  ref={audioFileInputRef}
                  type="file"
                  accept="audio/*"
                  multiple
                  onChange={handleAudioUpload}
                  className="hidden"
                />
              </div>

              {/* Category Type and Role */}
              <div className="flex gap-4 items-center">
                <div className="flex-1">
                  <label className="block text-white text-[14px] leading-[20px] mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Category Type
                  </label>
                  <Select
                    options={categoryOptions}
                    value={categoryType}
                    onChange={setCategoryType}
                    placeholder="Select Category"
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

            {/* Category Cards - Positioned absolutely on the left */}
            <div className="absolute left-[54px] top-[245px] flex flex-col gap-3 w-[342px]">
              {categoryCards.map((category) => (
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
              ))}
            </div>

            {/* Right Column - Image and Transcript Upload */}
            <div className="w-[464px] flex flex-col gap-6">
              {/* Image Upload Section */}
              <div className="flex flex-col gap-6">
                <div
                  className="bg-[#131313] border border-[rgba(255,255,255,0.25)] rounded-[16px] h-[364px] flex items-center justify-center overflow-hidden"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, 'image')}
                >
                  {uploadedImage ? (
                    <img
                      src={uploadedImage}
                      alt="Uploaded content"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-[#8f8f8f] text-[14px]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      No image uploaded
                    </div>
                  )}
                </div>
                <Button
                  className="w-full h-[56px]"
                  onClick={() => imageFileInputRef.current?.click()}
                >
                  Upload Image(s)
                </Button>
                <input
                  ref={imageFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
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
                    onClick={() => transcriptFileInputRef.current?.click()}
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
                <input
                  ref={transcriptFileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.psd,.ai,.ppt,.pptx"
                  onChange={handleTranscriptUpload}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 items-center justify-start">
            <Button
              className="w-[120px] h-[56px]"
              onClick={handlePublish}
            >
              Publish
            </Button>
            <Button
              variant="ghost"
              className="w-[120px] h-[56px] border border-[#965cdf] text-white"
              onClick={handleCancel}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

