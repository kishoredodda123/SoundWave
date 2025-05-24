
import { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Volume1, VolumeX } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Track } from '@/services/musicService';

interface MusicPlayerProps {
  currentTrack?: Track;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
}

const MusicPlayer = ({ 
  currentTrack, 
  isPlaying, 
  onPlayPause, 
  onNext, 
  onPrevious 
}: MusicPlayerProps) => {
  const [volume, setVolume] = useState(70);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Default track for demo when no track is selected
  const displayTrack = currentTrack || {
    id: 'demo',
    title: 'Starboy',
    artist: 'The Weeknd, Daft Punk',
    album: 'Starboy',
    cover: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=150&h=150',
    audioUrl: '',
    duration: 263
  };

  // Format time in MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Handle audio element events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => {
      setDuration(audio.duration || 0);
      console.log('Audio duration loaded:', audio.duration);
    };
    const handleEnded = () => {
      setCurrentTime(0);
      if (onNext) onNext();
    };
    const handleLoadStart = () => {
      setAudioLoading(true);
      setAudioError(false);
      console.log('Audio loading started');
    };
    const handleCanPlay = () => {
      setAudioLoading(false);
      console.log('Audio can play');
    };
    const handleError = (e) => {
      setAudioLoading(false);
      setAudioError(true);
      console.error('Audio error:', e);
    };
    const handleLoadedMetadata = () => {
      console.log('Audio metadata loaded:', {
        duration: audio.duration,
        src: audio.src
      });
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [onNext]);

  // Control play/pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack?.audioUrl) return;

    if (isPlaying) {
      console.log('Attempting to play audio:', currentTrack.audioUrl);
      audio.play().catch((error) => {
        console.error('Failed to play audio:', error);
        setAudioError(true);
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, currentTrack]);

  // Update volume
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume / 100;
    }
  }, [volume]);

  // Handle seek
  const handleSeek = (values: number[]) => {
    const audio = audioRef.current;
    if (audio && !isNaN(values[0])) {
      audio.currentTime = values[0];
      setCurrentTime(values[0]);
    }
  };

  // Volume icon based on level
  const VolumeIcon = volume === 0 ? VolumeX : volume < 50 ? Volume1 : Volume2;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-music-cardBg border-t border-gray-800 px-4 py-3">
      {/* Hidden audio element for actual playback */}
      {currentTrack?.audioUrl && (
        <audio
          ref={audioRef}
          src={currentTrack.audioUrl}
          preload="metadata"
          crossOrigin="anonymous"
        />
      )}
      
      <div className="flex flex-col md:flex-row items-center">
        {/* Track Info - Mobile: Top, Desktop: Left */}
        <div className="flex items-center w-full md:w-1/4 mb-3 md:mb-0">
          <img 
            src={displayTrack.cover}
            alt={`${displayTrack.title} album art`}
            className="h-12 w-12 object-cover rounded mr-3"
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-white truncate">{displayTrack.title}</h4>
            <p className="text-xs text-gray-400 truncate">{displayTrack.artist}</p>
            {audioLoading && <p className="text-xs text-blue-400">Loading...</p>}
            {audioError && <p className="text-xs text-red-400">Audio Error</p>}
          </div>
        </div>
        
        {/* Player Controls - Mobile: Middle, Desktop: Center */}
        <div className="flex flex-col w-full md:w-1/2 md:px-4">
          <div className="flex justify-center items-center space-x-4 mb-3">
            <button 
              className="text-gray-400 hover:text-white disabled:opacity-50"
              onClick={onPrevious}
              disabled={!onPrevious}
            >
              <SkipBack className="h-5 w-5" />
            </button>
            <button 
              className={`bg-red-600 rounded-full p-2 text-white hover:scale-105 transition disabled:opacity-50 ${
                audioLoading ? 'animate-pulse' : ''
              }`}
              onClick={onPlayPause}
              disabled={!currentTrack?.audioUrl || audioLoading}
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </button>
            <button 
              className="text-gray-400 hover:text-white disabled:opacity-50"
              onClick={onNext}
              disabled={!onNext}
            >
              <SkipForward className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex items-center space-x-3 text-xs text-gray-400">
            <span>{formatTime(currentTime)}</span>
            <div className="flex-1">
              <Slider 
                value={[currentTime]} 
                max={duration || displayTrack.duration}
                step={1}
                onValueChange={handleSeek}
                className="cursor-pointer"
                disabled={!currentTrack?.audioUrl || audioLoading}
              />
            </div>
            <span>{formatTime(duration || displayTrack.duration)}</span>
          </div>
        </div>
        
        {/* Volume Control - Mobile: Bottom, Desktop: Right */}
        <div className="flex items-center justify-end w-full md:w-1/4 mt-3 md:mt-0">
          <VolumeIcon className="h-5 w-5 text-gray-400 mr-2" />
          <div className="w-24">
            <Slider 
              value={[volume]} 
              max={100}
              step={1}
              onValueChange={(values) => setVolume(values[0])}
              className="cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
