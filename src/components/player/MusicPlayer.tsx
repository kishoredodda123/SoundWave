
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
    title: 'Select a song to play',
    artist: 'No artist',
    album: 'No album',
    cover: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=150&h=150',
    audioUrl: '',
    duration: 0
  };

  // Format time in MM:SS
  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Reset states when track changes
  useEffect(() => {
    if (currentTrack?.audioUrl) {
      console.log('🎵 MusicPlayer: Track changed to:', currentTrack.title);
      console.log('🔗 MusicPlayer: Audio URL:', currentTrack.audioUrl);
      
      setCurrentTime(0);
      setDuration(0);
      setAudioError(false);
      setAudioLoading(true);
      
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
        
        // Clear previous source
        audio.removeAttribute('src');
        audio.load();
        
        // Set new source with proper attributes
        audio.src = currentTrack.audioUrl;
        audio.crossOrigin = 'anonymous';
        audio.preload = 'auto';
        
        // Try to load the audio
        audio.load();
      }
    }
  }, [currentTrack?.id]);

  // Handle audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      if (!isNaN(audio.currentTime)) {
        setCurrentTime(audio.currentTime);
      }
    };

    const handleDurationChange = () => {
      console.log('📊 Duration changed:', audio.duration);
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleCanPlay = () => {
      console.log('✅ Audio can play');
      setAudioLoading(false);
      setAudioError(false);
    };

    const handleLoadedMetadata = () => {
      console.log('📋 Audio metadata loaded');
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
      setAudioLoading(false);
    };

    const handleEnded = () => {
      console.log('🏁 Audio ended');
      setCurrentTime(0);
      if (onNext) onNext();
    };

    const handleLoadStart = () => {
      console.log('🔄 Audio loading started');
      setAudioLoading(true);
      setAudioError(false);
    };

    const handleError = (e: Event) => {
      const target = e.target as HTMLAudioElement;
      console.error('❌ Audio error:', target.error);
      setAudioLoading(false);
      setAudioError(true);
      
      // Try to provide more specific error information
      if (target.error) {
        switch (target.error.code) {
          case MediaError.MEDIA_ERR_NETWORK:
            console.error('Network error while loading audio');
            break;
          case MediaError.MEDIA_ERR_DECODE:
            console.error('Audio decode error');
            break;
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            console.error('Audio format not supported');
            break;
          default:
            console.error('Unknown audio error');
        }
      }
    };

    const handlePlaying = () => {
      console.log('▶️ Audio playing');
      setAudioLoading(false);
      setAudioError(false);
    };

    const handleWaiting = () => {
      console.log('⏳ Audio waiting');
      setAudioLoading(true);
    };

    const handleCanPlayThrough = () => {
      console.log('🎯 Audio can play through');
      setAudioLoading(false);
      setAudioError(false);
    };

    // Add event listeners
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('canplaythrough', handleCanPlayThrough);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('error', handleError);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('waiting', handleWaiting);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('canplaythrough', handleCanPlayThrough);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('waiting', handleWaiting);
    };
  }, [onNext]);

  // Control play/pause with better error handling
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack?.audioUrl) return;

    const handlePlayback = async () => {
      try {
        if (isPlaying && !audioError) {
          console.log('🎯 MusicPlayer: Attempting to play');
          
          // Ensure audio is loaded before playing
          if (audio.readyState < 2) {
            console.log('⏳ Audio not ready, waiting...');
            setAudioLoading(true);
            return;
          }
          
          const playPromise = audio.play();
          if (playPromise !== undefined) {
            await playPromise;
            console.log('✅ MusicPlayer: Play successful');
          }
        } else if (!isPlaying) {
          console.log('⏸️ MusicPlayer: Pausing');
          audio.pause();
        }
      } catch (error) {
        console.error('❌ MusicPlayer: Playback error:', error);
        setAudioError(true);
        setAudioLoading(false);
      }
    };

    handlePlayback();
  }, [isPlaying, currentTrack?.audioUrl, audioError]);

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
    if (audio && !isNaN(values[0]) && duration > 0) {
      const newTime = Math.min(values[0], duration);
      audio.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Volume icon based on level
  const VolumeIcon = volume === 0 ? VolumeX : volume < 50 ? Volume1 : Volume2;

  // Get effective duration
  const effectiveDuration = duration > 0 ? duration : (currentTrack?.duration || 0);

  // Get status message
  const getStatusMessage = () => {
    if (!currentTrack?.audioUrl) return null;
    if (audioLoading) return "Loading audio...";
    if (audioError) return "Unable to play this track";
    return null;
  };

  const statusMessage = getStatusMessage();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-music-cardBg border-t border-gray-800 px-4 py-3">
      {currentTrack?.audioUrl && (
        <audio
          ref={audioRef}
          preload="auto"
          style={{ display: 'none' }}
        />
      )}
      
      <div className="flex flex-col md:flex-row items-center">
        {/* Track Info */}
        <div className="flex items-center w-full md:w-1/4 mb-3 md:mb-0">
          <img 
            src={displayTrack.cover}
            alt={`${displayTrack.title} album art`}
            className="h-12 w-12 object-cover rounded mr-3"
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-white truncate">{displayTrack.title}</h4>
            <p className="text-xs text-gray-400 truncate">{displayTrack.artist}</p>
            {statusMessage && (
              <p className={`text-xs ${audioError ? 'text-red-400' : 'text-blue-400'}`}>
                {statusMessage}
              </p>
            )}
          </div>
        </div>
        
        {/* Player Controls */}
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
              disabled={!currentTrack?.audioUrl}
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
                max={effectiveDuration}
                step={1}
                onValueChange={handleSeek}
                className="cursor-pointer"
                disabled={effectiveDuration === 0 || audioError}
              />
            </div>
            <span>{formatTime(effectiveDuration)}</span>
          </div>
        </div>
        
        {/* Volume Control */}
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
