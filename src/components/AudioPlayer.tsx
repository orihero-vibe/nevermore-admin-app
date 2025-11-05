import { useState, useRef, useEffect } from 'react';
import PlayIcon from '../assets/icons/play';
import VolumeIcon from '../assets/icons/volume';
import CloseIcon from '../assets/icons/close';

export interface AudioPlayerProps {
  label: string;
  file: File;
  onRemove?: () => void;
  className?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  label,
  file,
  onRemove,
  className = '',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Create object URL for the audio file
  const [audioUrl] = useState(() => URL.createObjectURL(file));

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <p
        className="text-white text-[14px] leading-[24px]"
        style={{ fontFamily: 'Roboto, sans-serif' }}
      >
        {label}
      </p>
      <div className="flex gap-4 items-center w-full">
        <div className="backdrop-blur-[10px] bg-[rgba(255,255,255,0.07)] rounded-[16px] px-4 py-2 flex flex-1 gap-4 items-center min-w-0">
          <button
            onClick={togglePlay}
            className="shrink-0 w-8 h-8 flex items-center justify-center hover:opacity-80 transition"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            <PlayIcon width={32} height={32} color="#fff" />
          </button>
          <p
            className="text-white text-[12px] leading-[16px] shrink-0 font-roboto font-normal"
          >
            {formatTime(currentTime)} / {formatTime(duration)}
          </p>
          <div className="bg-white opacity-20 flex-1 h-[5px] min-w-0 rounded-[10px] overflow-hidden relative">
            <div
              className="bg-white h-full transition-all duration-300 rounded-[10px]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <button className="shrink-0 w-6 h-6 flex items-center justify-center hover:opacity-80 transition">
            <VolumeIcon width={24} height={24} color="#fff" />
          </button>
        </div>
        {onRemove && (
          <button
            onClick={onRemove}
            className="shrink-0 w-6 h-6 flex items-center justify-center hover:opacity-80 transition"
            aria-label="Remove audio"
          >
            <CloseIcon width={24} height={24} color="#8f8f8f" />
          </button>
        )}
      </div>
      <audio ref={audioRef} src={audioUrl} />
    </div>
  );
};
