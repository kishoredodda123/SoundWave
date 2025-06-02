
import { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Volume1, VolumeX } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Track } from '@/services/musicService';
import { toast } from "@/hooks/use-toast";

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
  const [retryCount, setRetryCount] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Fallback audio URLs for demonstration
  const fallbackAudioUrls = [
    'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    'https://www.soundjay.com/misc/sounds/fail-buzzer-02.wav',
    'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjmR3fLDcSYELYXN8diJNwgZaLvt559NEAxQqOXwtmAcBjiS1/LLeSsFJHfI8N2QQAoUXrTp66hVFApGnt7yv2ohBjmS3vLDcSUGK4TP8tiJOQcZaLzq559NEAxQp+Tvt2IcBjuV1/HLeysFJHfI8N2PPw=='
  ];

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

  // Auto-retry with fallback URLs
  const tryNextUrl = async () => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return false;

    // Try fallback URLs if original fails
    const urlsToTry = [
      currentTrack.audioUrl,
      ...fallbackAudioUrls
    ].filter(Boolean);

    for (let i = retryCount; i < urlsToTry.length; i++) {
      try {
        console.log(`🔄 Trying audio URL ${i + 1}/${urlsToTry.length}:`, urlsToTry[i]);
        
        // Reset audio
        audio.pause();
        audio.currentTime = 0;
        
        // Set new source
        audio.src = urlsToTry[i];
        audio.load();
        
        // Test if it can load
        const canPlay = await new Promise<boolean>((resolve) => {
          const timeout = setTimeout(() => resolve(false), 3000);
          
          const onCanPlay = () => {
            clearTimeout(timeout);
            audio.removeEventListener('canplay', onCanPlay);
            audio.removeEventListener('error', onError);
            resolve(true);
          };
          
          const onError = () => {
            clearTimeout(timeout);
            audio.removeEventListener('canplay', onCanPlay);
            audio.removeEventListener('error', onError);
            resolve(false);
          };
          
          audio.addEventListener('canplay', onCanPlay);
          audio.addEventListener('error', onError);
        });

        if (canPlay) {
          console.log('✅ Audio source working:', urlsToTry[i]);
          setRetryCount(i);
          setAudioError(false);
          setAudioLoading(false);
          
          if (i > 0) {
            toast({
              title: "Audio Recovered",
              description: "Using fallback audio source",
            });
          }
          
          return true;
        }
      } catch (error) {
        console.log(`❌ Failed URL ${i + 1}:`, error);
        continue;
      }
    }
    
    console.log('❌ All audio URLs failed');
    setAudioError(true);
    setAudioLoading(false);
    toast({
      title: "Track Unavailable",
      description: "This track cannot be played right now",
      variant: "destructive",
    });
    return false;
  };

  // Reset states when track changes
  useEffect(() => {
    if (currentTrack?.audioUrl) {
      console.log('🎵 MusicPlayer: Track changed to:', currentTrack.title);
      
      setCurrentTime(0);
      setDuration(0);
      setAudioError(false);
      setAudioLoading(true);
      setRetryCount(0);
      
      // Auto-try loading with fallbacks
      tryNextUrl();
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
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
        setAudioLoading(false);
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
      setAudioError(false);
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

    const handleError = async (e: Event) => {
      const target = e.target as HTMLAudioElement;
      console.error('❌ Audio error:', target.error);
      
      // Auto-retry with next URL
      const recovered = await tryNextUrl();
      if (!recovered) {
        setAudioLoading(false);
        setAudioError(true);
      }
    };

    const handlePlaying = () => {
      console.log('▶️ Audio playing');
      setAudioLoading(false);
      setAudioError(false);
    };

    const handleWaiting = () => {
      console.log('⏳ Audio buffering');
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
  }, [onNext, currentTrack]);

  // Control play/pause with automatic error recovery
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack?.audioUrl) return;

    const handlePlayback = async () => {
      try {
        if (isPlaying && !audioError) {
          console.log('🎯 MusicPlayer: Attempting to play');
          
          // If audio has error, try to recover first
          if (audio.error || audio.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) {
            console.log('🔄 Recovering from audio error...');
            const recovered = await tryNextUrl();
            if (!recovered) return;
          }
          
          // Ensure audio is ready
          if (audio.readyState < HTMLMediaElement.HAVE_ENOUGH_DATA) {
            console.log('⏳ Waiting for audio data...');
            setAudioLoading(true);
            
            // Wait for audio to be ready with timeout
            const waitForReady = () => {
              return new Promise<void>((resolve, reject) => {
                const timeout = setTimeout(() => {
                  reject(new Error('Audio loading timeout'));
                }, 5000);
                
                const checkReady = () => {
                  if (audio.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) {
                    clearTimeout(timeout);
                    resolve();
                  } else {
                    setTimeout(checkReady, 100);
                  }
                };
                checkReady();
              });
            };
            
            try {
              await waitForReady();
            } catch (error) {
              console.error('❌ Audio loading timeout, trying recovery...');
              const recovered = await tryNextUrl();
              if (!recovered) return;
            }
          }
          
          const playPromise = audio.play();
          if (playPromise !== undefined) {
            await playPromise;
            console.log('✅ MusicPlayer: Play successful');
            setAudioLoading(false);
          }
        } else if (!isPlaying) {
          console.log('⏸️ MusicPlayer: Pausing');
          audio.pause();
        }
      } catch (error) {
        console.error('❌ MusicPlayer: Playback error, attempting recovery...', error);
        const recovered = await tryNextUrl();
        if (recovered && isPlaying) {
          // Try to play again after recovery
          try {
            await audio.play();
            setAudioLoading(false);
          } catch (retryError) {
            console.error('❌ Retry failed:', retryError);
            setAudioError(true);
            setAudioLoading(false);
          }
        }
      }
    };

    handlePlayback();
  }, [isPlaying, currentTrack?.audioUrl]);

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
    if (audio && !isNaN(values[0]) && duration > 0 && !audioError) {
      const newTime = Math.min(values[0], duration);
      audio.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Volume icon based on level
  const VolumeIcon = volume === 0 ? VolumeX : volume < 50 ? Volume1 : Volume2;

  // Get effective duration
  const effectiveDuration = duration > 0 ? duration : (currentTrack?.duration || 0);

  // Show loading or error status
  const getTrackStatus = () => {
    if (audioError) return 'Track unavailable - using fallback';
    if (audioLoading) return 'Loading...';
    return null;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-music-cardBg border-t border-gray-800 px-4 py-3">
      {currentTrack?.audioUrl && (
        <audio
          ref={audioRef}
          preload="metadata"
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
            {getTrackStatus() && (
              <p className={`text-xs ${audioError ? 'text-yellow-400' : 'text-blue-400'}`}>
                {getTrackStatus()}
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
              {isPlaying && !audioError && !audioLoading ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
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
