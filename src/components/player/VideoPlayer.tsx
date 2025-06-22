import { useEffect, useRef, useState } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  Subtitles,
  MonitorPlay,
  Loader2,
  AlertTriangle,
  ChevronDown,
  Circle,
  CheckCircle2,
  Film,
  SlidersHorizontal,
  Expand,
  Shrink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import React from 'react';

interface VideoPlayerProps {
  url: string;
  title?: string;
  onError?: (error: any) => void;
}

interface AudioTrack {
  id: string;
  language: string;
  label: string;
}

interface TextTrack {
  id: string;
  language: string;
  label: string;
}

interface VideoQuality {
  label: string;
  value: string;
}

const aspectRatios = [
  { label: 'Auto', value: 'auto' },
  { label: '16:9', value: '16:9' },
  { label: '4:3', value: '4:3' },
  { label: 'Fill', value: 'fill' },
  { label: 'Zoom', value: 'zoom' },
];

const playbackSpeeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export function VideoPlayer({ url, title, onError }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const mouseIdleTimerRef = useRef<any>(null);

  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [duration, setDuration] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([]);
  const [textTracks, setTextTracks] = useState<TextTrack[]>([]);
  const [currentAudioTrack, setCurrentAudioTrack] = useState<string>('');
  const [currentTextTrack, setCurrentTextTrack] = useState<string>('');
  const [buffering, setBuffering] = useState(false);
  const [error, setError] = useState<any>(null);
  const [showControls, setShowControls] = useState(true);
  const [mouseIdle, setMouseIdle] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAspectRatio, setShowAspectRatio] = useState(false);
  const [currentAspectRatio, setCurrentAspectRatio] = useState('auto');
  const [playbackRate, setPlaybackRate] = useState(1);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [isPiP, setIsPiP] = useState(false);
  const [volumeBoost, setVolumeBoost] = useState(false);
  const [internalVolume, setInternalVolume] = useState(1);
  const [displayVolume, setDisplayVolume] = useState(1);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (playerRef.current) {
      if (playing) {
        playerRef.current.pause();
      } else {
        playerRef.current.play();
      }
      setPlaying(!playing);
      setShowControls(true);
    }
  };

  const handleSkipBackward = () => {
    if (playerRef.current) {
      const newTime = Math.max(0, playerRef.current.currentTime() - 10);
      playerRef.current.currentTime(newTime);
      setPlayed(newTime / duration);
    }
  };

  const handleSkipForward = () => {
    if (playerRef.current) {
      const newTime = Math.min(duration, playerRef.current.currentTime() + 10);
      playerRef.current.currentTime(newTime);
      setPlayed(newTime / duration);
    }
  };

  const applyVolumeBoost = (baseVolume: number, boost: boolean) => {
    if (!videoRef.current) return;

    let boostedVolume;
    if (boost) {
      // Proportional boost: more boost at higher volumes
      if (baseVolume <= 0.2) { // Low volume (0-20%)
        boostedVolume = baseVolume * 2; // Double the volume
      } else if (baseVolume <= 0.5) { // Medium volume (20-50%)
        boostedVolume = baseVolume * 2.5; // 2.5x boost
      } else { // High volume (50-100%)
        boostedVolume = baseVolume * 5.5; // Increased from 3x to 5.5x for stronger boost
      }
    } else {
      boostedVolume = baseVolume;
    }

    // Set the actual volume
    videoRef.current.volume = Math.min(boostedVolume, 1);
    // Store the internal volume value for boost calculations
    setInternalVolume(baseVolume);
    // Update the display volume for the slider
    setDisplayVolume(baseVolume);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    applyVolumeBoost(newVolume, volumeBoost);
    setMuted(newVolume === 0);
  };

  // Effect to handle volume boost toggle
  useEffect(() => {
    applyVolumeBoost(internalVolume, volumeBoost);
  }, [volumeBoost]);

  // Handle mute toggle
  const handleMuteToggle = () => {
    if (videoRef.current) {
      const newMuted = !muted;
      videoRef.current.muted = newMuted;
      setMuted(newMuted);
      if (!newMuted) {
        // Restore volume when unmuting
        applyVolumeBoost(internalVolume, volumeBoost);
      }
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  };

  const togglePiP = async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsPiP(false);
      } else if (document.pictureInPictureEnabled && videoRef.current) {
        const video = videoRef.current;
        // Set a smaller size before entering PiP
        const originalWidth = video.videoWidth;
        const originalHeight = video.videoHeight;
        video.width = Math.min(320, originalWidth);
        video.height = (video.width * originalHeight) / originalWidth;
        await video.requestPictureInPicture();
        setIsPiP(true);
        // Reset size after entering PiP
        video.width = originalWidth;
        video.height = originalHeight;
      }
    } catch (err) {
      console.error('PiP failed:', err);
    }
  };

  const handlePlaybackRateChange = (rate: number) => {
    if (playerRef.current) {
      playerRef.current.playbackRate(rate);
      setPlaybackRate(rate);
      setShowSettings(false);
    }
  };

  const handleTextTrackChange = (trackId: string) => {
    if (playerRef.current) {
      const tracks = playerRef.current.textTracks();
      if (tracks) {
        Array.from(tracks).forEach((track: any) => {
          track.mode = track.language === trackId ? 'showing' : 'hidden';
        });
        setCurrentTextTrack(trackId);
      }
    }
  };

  const handleAudioTrackChange = (trackId: string) => {
    if (playerRef.current) {
      const tracks = playerRef.current.audioTracks();
      if (tracks) {
        Object.keys(tracks)
          .filter(key => !isNaN(Number(key)))
          .forEach(key => {
            const track = tracks[key as any];
            track.enabled = track.id === trackId;
          });
        setCurrentAudioTrack(trackId);
      }
    }
  };

  const handleAspectRatioChange = (ratio: string) => {
    if (!videoRef.current || !containerRef.current) return;

    setCurrentAspectRatio(ratio);
    const video = videoRef.current;
    const container = containerRef.current;

    // Reset all styles first
    container.style.cssText = '';
    video.style.cssText = '';

    // Set base container styles
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.position = 'relative';

    switch (ratio) {
      case 'auto':
        video.style.width = '100%';
        video.style.height = '100%';
        video.style.objectFit = 'contain';
        break;
      case '16:9':
        container.style.padding = '10% 0';
        video.style.width = '100%';
        video.style.height = '100%';
        video.style.objectFit = 'contain';
        break;
      case '4:3':
        // Centered 4:3 box
        container.style.display = 'flex';
        container.style.alignItems = 'center';
        container.style.justifyContent = 'center';
        video.style.width = '100%';
        video.style.height = 'auto';
        video.style.maxWidth = '75vh';
        video.style.maxHeight = '75vw';
        video.style.aspectRatio = '4 / 3';
        video.style.objectFit = 'contain';
        break;
      case 'fill':
        // Always stretch to fill container
        video.style.width = '100%';
        video.style.height = '100%';
        video.style.objectFit = 'cover';
        break;
      case 'zoom':
        video.style.width = '100vw';
        video.style.height = '100vh';
        video.style.objectFit = 'cover';
        video.style.position = 'absolute';
        video.style.top = '50%';
        video.style.left = '50%';
        video.style.transform = 'translate(-50%, -50%)';
        break;
    }

    setShowAspectRatio(false);
  };

  // Add resize observer to handle aspect ratio on container size changes
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver(() => {
      // Re-apply current aspect ratio when container size changes
      handleAspectRatioChange(currentAspectRatio);
    });

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [currentAspectRatio]);

  // Now we can use the useEffect hooks with the defined functions
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (showSettings) return;
      
      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          handlePlayPause();
          break;
        case 'arrowleft':
        case 'j':
          handleSkipBackward();
          break;
        case 'arrowright':
        case 'l':
          handleSkipForward();
          break;
        case 'f':
          toggleFullscreen();
          break;
        case 'm':
          handleMuteToggle();
          break;
        case 'p':
          togglePiP();
          break;
        case 'c':
          handleTextTrackChange(currentTextTrack ? '' : (textTracks[0]?.id || ''));
          break;
        case 'escape':
          if (showSettings) setShowSettings(false);
          break;
        case '0':
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
          e.preventDefault();
          if (playerRef.current) {
            const percent = parseInt(e.key) * 10;
            const time = (duration * percent) / 100;
            playerRef.current.currentTime(time);
            setPlayed(percent / 100);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [
    handlePlayPause,
    handleSkipBackward,
    handleSkipForward,
    toggleFullscreen,
    handleMuteToggle,
    togglePiP,
    handleTextTrackChange,
    currentTextTrack,
    textTracks,
    showSettings,
    duration
  ]);

  // Mouse idle detection with smoother transitions
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      setMouseIdle(false);
      if (mouseIdleTimerRef.current) {
        clearTimeout(mouseIdleTimerRef.current);
      }
      mouseIdleTimerRef.current = setTimeout(() => {
        if (playing) {
          setMouseIdle(true);
          setShowControls(false);
        }
      }, 2500);
    };
    const handleMouseLeave = () => {
      if (playing) setShowControls(false);
    };
    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseleave', handleMouseLeave);
    }
    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseleave', handleMouseLeave);
      }
      if (mouseIdleTimerRef.current) clearTimeout(mouseIdleTimerRef.current);
    };
  }, [playing]);

  // Progress bar hover time preview
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!progressBarRef.current || !duration) return;
      const rect = progressBarRef.current.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      setHoverTime(Math.max(0, Math.min(1, pos)) * duration);
    };

    const handleMouseLeave = () => {
      setHoverTime(null);
    };

    const progressBar = progressBarRef.current;
    if (progressBar) {
      progressBar.addEventListener('mousemove', handleMouseMove);
      progressBar.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (progressBar) {
        progressBar.removeEventListener('mousemove', handleMouseMove);
        progressBar.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [duration]);

  // Initialize video.js player
  useEffect(() => {
    if (!playerRef.current && videoRef.current) {
      const videoElement = videoRef.current;

      const player = videojs(videoElement, {
        controls: false,
        autoplay: false,
        preload: 'auto',
        fluid: true,
        sources: [{
          src: url,
          type: 'video/mp4'
        }],
        html5: {
          vhs: { overrideNative: true },
          nativeAudioTracks: false,
          nativeVideoTracks: false,
          nativeTextTracks: false
        }
      });

      player.ready(() => {
      player.src({ src: url, type: 'video/mp4' });
      });

      player.on('loadedmetadata', () => {
        setDuration(player.duration());
        
        // Load audio tracks
        const audioTracks = player.audioTracks();
        if (audioTracks) {
          const tracksList = [];
          for (let i = 0; i < Object.keys(audioTracks).length; i++) {
            const track = audioTracks[i];
            if (track) {
              tracksList.push({
                id: track.id,
                language: track.language || 'unknown',
                label: track.label || `Audio Track ${track.id}`
            });
            }
          }
          setAudioTracks(tracksList);
          if (tracksList.length > 0) setCurrentAudioTrack(tracksList[0].id);
        }

        // Load text tracks
        const textTracks = player.textTracks();
        if (textTracks) {
          const tracksList = [];
          for (let i = 0; i < Object.keys(textTracks).length; i++) {
            const track = textTracks[i];
            if (track) {
            tracksList.push({
              id: track.language || String(i),
              language: track.language || 'unknown',
                label: track.label || `Subtitles (${track.language || 'unknown'})`
            });
            }
          }
            setTextTracks(tracksList);
        }
      });

      player.on('timeupdate', () => {
        if (!seeking) {
          setPlayed(player.currentTime() / player.duration());
        }
      });

      player.on('waiting', () => setBuffering(true));
      player.on('canplay', () => setBuffering(false));
      player.on('error', (e) => {
        setError(e);
        if (onError) onError(e);
      });

      playerRef.current = player;
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [url, onError, seeking]);

  // Add CSS variables for aspect ratio control
  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const aspectRatioMap = {
      'auto': '16/9',
      '16:9': '16/9',
      '4:3': '4/3',
      'fill': '16/9',
      'zoom': '16/9'
    };
    
    container.style.setProperty('--video-aspect-ratio', aspectRatioMap[currentAspectRatio]);
  }, [currentAspectRatio]);

  // Helper to get wrapper styles based on aspect ratio
  const getWrapperStyle = () => ({
    position: 'relative' as const,
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
    overflow: 'hidden',
  });

  // Returns the style for the aspect-ratio box
  const getAspectBoxStyle = () => {
    if (currentAspectRatio === '16:9') {
      return {
        aspectRatio: '16/9',
        width: 'min(90vw, 90vh * 16 / 9)',
        height: 'min(90vh, 90vw * 9 / 16)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'black',
        margin: 'auto',
      };
    }
    if (currentAspectRatio === '4:3') {
      return {
        aspectRatio: '4/3',
        width: 'min(80vw, 80vh * 4 / 3)',
        height: 'min(80vh, 80vw * 3 / 4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'black',
        margin: 'auto',
      };
    }
    return {
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    };
  };

  // Returns the style for the video element
  const getVideoStyle = () => {
    switch (currentAspectRatio) {
      case 'fill':
        return {
          width: '100%',
          height: '100%',
          objectFit: 'fill' as const,
        };
      case 'zoom':
        return {
          width: '100%',
          height: '100%',
          objectFit: 'cover' as const,
        };
      case '16:9':
      case '4:3':
        return {
          width: '100%',
          height: '100%',
          objectFit: 'contain' as const,
        };
      default: // auto
        return {
          width: '100%',
          height: '100%',
          objectFit: 'contain' as const,
        };
      }
  };

  // Add this with the other event handlers
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    if (videoRef.current) {
      const time = pos * duration;
      videoRef.current.currentTime = time;
      setPlayed(pos);
    }
  };

  const handleContainerMouseMove = () => {
    setShowControls(true);
    setMouseIdle(false);
    if (mouseIdleTimerRef.current) {
      clearTimeout(mouseIdleTimerRef.current);
      }
    mouseIdleTimerRef.current = setTimeout(() => {
      if (playing) {
        setMouseIdle(true);
        setShowControls(false);
    }
    }, 3000);
  };

  const handleContainerMouseLeave = () => {
    setShowControls(false);
    setMouseIdle(true);
    if (mouseIdleTimerRef.current) {
      clearTimeout(mouseIdleTimerRef.current);
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative bg-black',
        'group/video touch-none select-none overflow-hidden',
        'w-full h-full',
        'max-w-full',
        'md:rounded-xl',
        'md:my-4',
        'md:shadow-lg',
        'md:max-w-4xl',
        'md:mx-auto',
        'md:h-[60vh]',
        'sm:h-[40vh]',
        'h-[30vh]', // mobile height
        'min-h-[180px]',
        'flex flex-col justify-center items-center'
      )}
      onMouseMove={handleContainerMouseMove}
      onMouseLeave={handleContainerMouseLeave}
      style={getWrapperStyle()}
    >
      <div 
        className={cn(
          'absolute inset-0 flex items-center justify-center',
          'w-full h-full',
          'md:static',
          'md:rounded-xl',
          'overflow-hidden'
        )}
        style={{ ...getAspectBoxStyle(), maxWidth: '100vw', maxHeight: '100vh' }}
      >
          <video
            ref={videoRef}
            className={cn(
              'video-js vjs-default-skin',
              'transition-all duration-300 ease-in-out',
              'w-full h-full',
              'object-contain',
              'rounded-none',
              'md:rounded-xl',
              'bg-black',
              'max-h-full',
              'max-w-full'
            )}
            style={{ ...getVideoStyle(), maxWidth: '100vw', maxHeight: '100vh' }}
            playsInline
          >
            <source src={url} type="video/mp4" />
          </video>
      </div>

      {/* Overlay Controls */}
      <div
        className={cn(
          'absolute inset-0 flex flex-col items-center justify-center',
          'transition-opacity duration-200',
          !showControls && 'opacity-0 pointer-events-none'
        )}
      >
        {/* Center Play/Pause Button */}
        <button
          onClick={handlePlayPause}
          className={cn(
            'absolute z-20',
            'bg-black/60 rounded-full p-6',
            'hover:bg-black/80 transition-all duration-200',
            'transform translate-y-0',
            !showControls && 'opacity-0 pointer-events-none'
          )}
          aria-label={playing ? 'Pause' : 'Play'}
      >
          {playing ? (
            <Pause className="w-12 h-12 text-white" />
          ) : (
            <Play className="w-12 h-12 text-white" />
          )}
        </button>

        {/* Bottom Controls */}
        <div 
          className={cn(
            'absolute bottom-0 left-0 right-0',
            'bg-gradient-to-t from-black/90 via-black/60 to-transparent',
            'transition-opacity duration-200',
            !showControls && 'opacity-0 pointer-events-none',
            'px-1 py-1', // mobile padding
            'md:px-4 md:py-0' // desktop padding
          )}
        >
          {/* Progress Bar */}
          <div className="px-1 md:px-4 py-0">
            <div
              ref={progressBarRef}
              className="relative w-full h-2 md:h-1 bg-white/30 cursor-pointer group/progress rounded-full"
              onClick={handleProgressClick}
            >
              <div
                className="absolute left-0 top-0 h-full bg-red-600 rounded-full"
              style={{ width: `${played * 100}%` }}
            />
            {hoverTime !== null && (
              <div 
                  className="absolute bottom-6 -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded"
                  style={{ left: `${(hoverTime / duration) * 100}%` }}
              >
                {formatTime(hoverTime)}
              </div>
            )}
          </div>
        </div>

          {/* Control Bar */}
          <div className="px-1 md:px-4 py-2 flex flex-col md:flex-row items-center gap-2 md:gap-4">
            {/* Left Controls */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-start">
              <button
                onClick={handlePlayPause}
                className="p-2 hover:bg-white/10 rounded-full transition"
              >
                {playing ? (
                  <Pause className="w-6 h-6 text-white" />
                ) : (
                  <Play className="w-6 h-6 text-white" />
                )}
              </button>

              <div className="flex items-center gap-2 group/volume">
                <button
                  onClick={handleMuteToggle}
                  className="p-2 hover:bg-white/10 rounded-full transition"
                >
                  {muted || volume === 0 ? (
                    <VolumeX className="w-5 h-5 text-white" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-white" />
                  )}
                </button>
                    <input
                      type="range"
                      min={0}
                      max={1}
                  step={0.01}
                  value={displayVolume}
                      onChange={handleVolumeChange}
                  className="w-16 md:w-20 accent-white opacity-100 md:opacity-0 group-hover/volume:opacity-100 transition-opacity"
                />
                <button
                  onClick={() => setVolumeBoost(prev => !prev)}
                  className={cn(
                    'p-2 rounded transition',
                    volumeBoost ? 'bg-yellow-400 text-black' : 'bg-white/10 text-white',
                    'hover:bg-yellow-300 hover:text-black'
                  )}
                  title={volumeBoost ? 'Volume Boost Active' : 'Volume Boost'}
                >
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                    <path 
                      d="M5 9v6h4l5 5V4l-5 5H5zm13.5 3a6.5 6.5 0 01-6.5 6.5" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>

              <div className="text-white text-xs md:text-sm font-medium">
                {formatTime(played * duration)} / {formatTime(duration)}
              </div>
            </div>

            {/* Title */}
            <div className="flex-1 text-white text-xs md:text-sm font-medium truncate text-center md:text-left">
              {title}
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end mt-1 md:mt-0">
              <button
                onClick={() => setCurrentTextTrack(currentTextTrack ? '' : (textTracks[0]?.id || ''))}
                className={cn(
                  'p-2 hover:bg-white/10 rounded-full transition',
                  currentTextTrack && 'text-blue-400'
                )}
              >
                <Subtitles className="w-5 h-5 text-white" />
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowAspectRatio(!showAspectRatio)}
                  className="p-2 hover:bg-white/10 rounded-full transition"
                >
                  <Expand className="w-5 h-5 text-white" />
                </button>
                {showAspectRatio && (
                  <div className="absolute bottom-full right-0 mb-2 w-40 md:w-48 bg-black/90 rounded-lg overflow-hidden z-30">
                    <div className="p-2">
                      <div className="text-white text-xs md:text-sm font-medium mb-2">Aspect Ratio</div>
                      {aspectRatios.map((ratio) => (
                        <button
                          key={ratio.value}
                          onClick={() => handleAspectRatioChange(ratio.value)}
                          className={cn(
                            'w-full text-left px-3 py-1 text-xs md:text-sm rounded',
                            currentAspectRatio === ratio.value ? 'bg-white/20 text-white' : 'text-white/80 hover:bg-white/10'
                          )}
                        >
                          {ratio.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 hover:bg-white/10 rounded-full transition"
                >
                  <Settings className="w-5 h-5 text-white" />
                </button>
                {showSettings && (
                  <div className="absolute bottom-full right-0 mb-2 w-40 md:w-48 bg-black/90 rounded-lg overflow-hidden z-30">
                    <div className="p-2">
                      <div className="text-white text-xs md:text-sm font-medium mb-2">Playback Speed</div>
                      {playbackSpeeds.map((speed) => (
                          <button
                            key={speed}
                          onClick={() => handlePlaybackRateChange(speed)}
                            className={cn(
                            'w-full text-left px-3 py-1 text-xs md:text-sm rounded',
                            playbackRate === speed ? 'bg-white/20 text-white' : 'text-white/80 hover:bg-white/10'
                          )}
                          >
                            {speed}x
                          </button>
                        ))}
                      </div>
                      </div>
                    )}
              </div>

              <button
                onClick={toggleFullscreen}
                className="p-2 hover:bg-white/10 rounded-full transition"
              >
                {fullscreen ? (
                  <Minimize className="w-5 h-5 text-white" />
                ) : (
                  <Maximize className="w-5 h-5 text-white" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Buffering Indicator */}
      {buffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Loader2 className="w-12 h-12 animate-spin text-white" />
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-white text-center p-4">
            <AlertTriangle className="w-12 h-12 mx-auto mb-2" />
            <p>An error occurred while playing the video.</p>
          </div>
        </div>
      )}
    </div>
  );
}