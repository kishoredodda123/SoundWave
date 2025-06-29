import { useEffect, useRef, useState, forwardRef, ForwardedRef } from 'react';
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
  Monitor,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
  src: string;
  onError?: (error: any) => void;
  title?: string;
  autoPlay?: boolean;
  autoFullscreen?: boolean;
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

const playbackSpeeds = [0.5, 1, 1.25, 1.5, 2];

export const VideoPlayer = forwardRef(({ src, onError, title, autoPlay, autoFullscreen }: VideoPlayerProps, ref: ForwardedRef<any>) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [volumeBoost, setVolumeBoost] = useState(false);
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
  const [showTheater, setShowTheater] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const mouseIdleTimerRef = useRef<any>(null);
  const [aspectRatio, setAspectRatio] = useState<'auto' | '16:9' | '4:3' | 'fill' | 'zoom'>('auto');
  const [showAspectRatioMenu, setShowAspectRatioMenu] = useState(false);
  const [showPiP, setShowPiP] = useState(false);

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

  // Video.js initialization with captions support
  // Function to handle mobile orientation
  const handleMobileOrientation = async () => {
    try {
      // Check if running on mobile
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      if (isMobile) {
        // Request fullscreen first
        const videoContainer = containerRef.current;
        if (videoContainer) {
          if (videoContainer.requestFullscreen) {
            await videoContainer.requestFullscreen();
          } else if ((videoContainer as any).webkitRequestFullscreen) {
            await (videoContainer as any).webkitRequestFullscreen();
          }
        }
        
        // Then try to lock orientation to landscape
        if ('orientation' in screen) {
          const screenOrientation = (screen as any).orientation;
          if (screenOrientation && typeof screenOrientation.lock === 'function') {
            await screenOrientation.lock('landscape');
          }
        }
        setFullscreen(true);
      }
    } catch (err) {
      console.log('Orientation/Fullscreen lock failed:', err);
    }
  };

  // Function to unlock orientation
  const unlockOrientation = () => {
    try {
      if ('orientation' in screen) {
        const screenOrientation = (screen as any).orientation;
        if (screenOrientation && typeof screenOrientation.unlock === 'function') {
          screenOrientation.unlock();
        }
      }
    } catch (err) {
      console.log('Orientation unlock failed:', err);
    }
  };

  useEffect(() => {
    if (!playerRef.current && videoRef.current) {
      const videoElement = videoRef.current;
      const player = videojs(videoElement, {
        controls: false,
        autoplay: true,
        preload: 'auto',
        fluid: true,
        playbackRates: playbackSpeeds,
        html5: {
          vhs: { overrideNative: true },
          nativeAudioTracks: true,
          nativeVideoTracks: true,
          nativeTextTracks: true,
        },
        controlBar: {
          playbackRateMenuButton: false,
        },
      });

      // Expose player instance through ref
      if (typeof ref === 'function') {
        ref({ player });
      } else if (ref) {
        ref.current = { player };
      }

      // Handle orientation and fullscreen when video starts playing
      player.on('play', () => {
        if (autoFullscreen) {
          handleMobileOrientation();
        }
      });
      
      // Handle orientation when video ends or is disposed
      player.on('ended', unlockOrientation);
      player.on('dispose', unlockOrientation);
        
      // Add custom CSS to hide video.js overlays
      const style = document.createElement('style');
      style.textContent = `
        .vjs-text-track-display,
        .vjs-playback-rate-value,
        .vjs-playback-rate,
        .vjs-control-text {
          display: none !important;
        }
      `;
      document.head.appendChild(style);

      // Add sample captions (replace with your actual captions)
      player.addRemoteTextTrack({
        kind: 'captions',
        srclang: 'en',
        label: 'English',
        src: 'path/to/captions.vtt', // Replace with actual captions file
      }, false);

      player.src({ src, type: 'video/mp4' });

      player.on('loadedmetadata', () => {
        setDuration(player.duration());
        
        // Load audio tracks
        const audioTracks = player.audioTracks();
        if (audioTracks && typeof audioTracks === 'object') {
          const tracksList = Object.keys(audioTracks)
            .filter(key => !isNaN(Number(key)))
            .map(key => {
              const track = audioTracks[key as any];
              return {
                id: track.id,
                language: track.language || 'unknown',
                label: track.label || `Audio Track ${track.id}`,
              };
            });
          setAudioTracks(tracksList);
          if (tracksList.length > 0) setCurrentAudioTrack(tracksList[0].id);
        }

        // Load text tracks (captions/subtitles)
        const textTracks = player.textTracks();
        if (textTracks) {
          const tracksList = [];
          let i = 0;
          while (textTracks[i]) {
            const track = textTracks[i];
            tracksList.push({
              id: track.language || String(i),
              language: track.language || 'unknown',
              label: track.label || `Subtitles (${track.language || 'unknown'})`,
            });
            i++;
            }
          if (tracksList.length > 0) {
            setTextTracks(tracksList);
          }
        }
      });

      player.on('timeupdate', () => {
        if (!seeking) setPlayed(player.currentTime() / player.duration());
      });

      player.on('waiting', () => setBuffering(true));
      player.on('canplay', () => setBuffering(false));
      player.on('error', (e: any) => {
        setError(e);
        if (onError) onError(e);
      });

      playerRef.current = player;
    }

    return () => {
      if (playerRef.current) {
        unlockOrientation();
        playerRef.current.dispose();
        playerRef.current = null;
        
        // Clean up ref
        if (typeof ref === 'function') {
          ref(null);
        } else if (ref) {
          ref.current = null;
        }
      }
    };
  }, [src, onError, autoFullscreen, ref]);

  // Handle text track (captions) changes
  const handleTextTrackChange = (trackId: string) => {
    if (playerRef.current) {
      const tracks = playerRef.current.textTracks();
      Array.from(tracks).forEach((track: any) => {
        track.mode = track.language === trackId ? 'showing' : 'hidden';
      });
      setCurrentTextTrack(trackId);
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only handle keyboard shortcuts if the video player is focused or if no input element is focused
      if (document.activeElement?.tagName === 'INPUT' || 
          document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          handlePlayPause();
          break;
        case 'arrowleft':
          e.preventDefault();
          if (e.shiftKey) {
            handleSkip(-30); // Shift + Left Arrow = Skip back 30 seconds
          } else {
            handleSkip(-10); // Left Arrow = Skip back 10 seconds
          }
          setShowControls(true);
          break;
        case 'arrowright':
          e.preventDefault();
          if (e.shiftKey) {
            handleSkip(30); // Shift + Right Arrow = Skip forward 30 seconds
          } else {
            handleSkip(10); // Right Arrow = Skip forward 10 seconds
          }
          setShowControls(true);
          break;
        case 'j':
          e.preventDefault();
          handleSkip(-10); // Alternative backward skip
          setShowControls(true);
          break;
        case 'l':
          e.preventDefault();
          handleSkip(10); // Alternative forward skip
          setShowControls(true);
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          handleMuteToggle();
          break;
        case 't':
          e.preventDefault();
          setShowTheater(v => !v);
          break;
        case 'k':
          e.preventDefault();
          handlePlayPause(); // Alternative play/pause key
          break;
      }
    };
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused || video.ended) {
      video.play();
    } else {
      video.pause();
    }
    setShowControls(true);
  };
  const handleSkipBackward = () => {
    if (playerRef.current) {
      const newTime = Math.max(playerRef.current.currentTime() - 10, 0);
      playerRef.current.currentTime(newTime);
      setShowControls(true);
    }
  };
  const handleSkipForward = () => {
    if (playerRef.current) {
      const newTime = Math.min(playerRef.current.currentTime() + 10, duration);
      playerRef.current.currentTime(newTime);
      setShowControls(true);
    }
  };
  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (playerRef.current) {
      const value = parseFloat(e.target.value);
      const newTime = value * duration;
      playerRef.current.currentTime(newTime);
      setPlayed(value);
    }
  };
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (playerRef.current) {
      const newVolume = parseFloat(e.target.value);
      const actualVolume = volumeBoost ? newVolume * 2 : newVolume;
      playerRef.current.volume(actualVolume);
      setVolume(newVolume);
      if (newVolume === 0) {
        setMuted(true);
        playerRef.current.muted(true);
      } else if (muted) {
        setMuted(false);
        playerRef.current.muted(false);
      }
    }
  };
  const handleMuteToggle = () => {
    if (playerRef.current) {
      const newMuted = !muted;
      playerRef.current.muted(newMuted);
      setMuted(newMuted);
    }
  };

  const handleVolumeBoost = () => {
    if (playerRef.current) {
      const newBoostState = !volumeBoost;
      setVolumeBoost(newBoostState);
      // Apply a 2x multiplier when boosted
      const baseVolume = volume;
      const boostedVolume = newBoostState ? baseVolume * 2 : baseVolume;
      playerRef.current.volume(boostedVolume);
    }
  };
  const toggleFullscreen = () => {
    const videoContainer = containerRef.current;
    if (!videoContainer) return;
    if (!fullscreen) {
      if (videoContainer.requestFullscreen) {
        videoContainer.requestFullscreen();
      } else if ((videoContainer as any).webkitRequestFullscreen) {
        (videoContainer as any).webkitRequestFullscreen();
      }
      // Mobile: try to lock orientation to landscape
      const orientation: any = window.screen.orientation;
      if (orientation && typeof orientation.lock === 'function') {
        if (window.innerWidth < 768) {
          orientation.lock('landscape').catch(() => {});
        }
      }
      setFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      }
      // Unlock orientation if possible
      const orientation: any = window.screen.orientation;
      if (orientation && typeof orientation.unlock === 'function') {
        orientation.unlock();
      }
      setFullscreen(false);
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
  const handlePlaybackRateChange = (rate: number) => {
    if (playerRef.current) {
      playerRef.current.playbackRate(rate);
      setPlaybackRate(rate);
    }
  };
  const formatTime = (seconds: number) => {
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = date.getUTCSeconds().toString().padStart(2, '0');
    if (hh) return `${hh}:${mm.toString().padStart(2, '0')}:${ss}`;
    return `${mm}:${ss}`;
  };

  const toggleAspectRatioMenu = () => {
    setShowAspectRatioMenu(prev => !prev);
  };

  const handleAspectRatioChange = (ratio: typeof aspectRatio) => {
    setAspectRatio(ratio);
    setShowAspectRatioMenu(false);
    if (playerRef.current) {
      const player = playerRef.current;
      player.trigger('resize');
    }
  };

  // Add this function to handle video playback
  const togglePlayPause = () => {
    if (playerRef.current) {
      if (playing) {
        playerRef.current.pause();
      } else {
        playerRef.current.play();
      }
      setPlaying(!playing);
    }
  };

  // Add this function to handle skip
  const handleSkip = (seconds: number) => {
    if (playerRef.current) {
      const newTime = playerRef.current.currentTime() + seconds;
      playerRef.current.currentTime(Math.max(0, Math.min(newTime, duration)));
    }
  };

  // Add PiP functionality
  const togglePiP = async () => {
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
      setShowPiP(false);
    } else if (videoRef.current) {
      try {
        await videoRef.current.requestPictureInPicture();
        setShowPiP(true);
      } catch (err) {
        console.error("PiP failed:", err);
      }
    }
  };

  // Add: Helper to get wrapper styles based on aspect ratio
  const getAspectBoxStyle = () => {
    switch (aspectRatio) {
      case '16:9':
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
      case '4:3':
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
      case 'fill':
    return {
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
          background: 'black',
        };
      case 'zoom':
        return {
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'black',
          overflow: 'hidden',
          position: 'relative' as const,
        };
      default:
        return {
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'black',
        };
      }
  };

  // Add this useEffect after playerRef is set up
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setPlaying(true);
    const handlePause = () => setPlaying(false);

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, []);

  // Update mouse idle detection for auto-hide
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let timer: any;

    const show = () => {
    setShowControls(true);
      if (timer) clearTimeout(timer);
      if (playing) {
        timer = setTimeout(() => setShowControls(false), 2500);
      }
  };

    container.addEventListener('mousemove', show);
    container.addEventListener('touchstart', show);

    // Hide controls after timeout if playing
    if (playing) {
      timer = setTimeout(() => setShowControls(false), 2500);
    }

    return () => {
      container.removeEventListener('mousemove', show);
      container.removeEventListener('touchstart', show);
      if (timer) clearTimeout(timer);
    };
  }, [playing]);

  // Ensure controls are visible on pause or ended
  useEffect(() => {
    if (!playing) setShowControls(true);
  }, [playing]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full',
        showTheater ? 'aspect-[21/9] max-w-6xl mx-auto my-8' : 'aspect-video',
        'overflow-hidden bg-black rounded-lg',
        fullscreen && 'z-50',
        'group/video-player',
        'sm:rounded-lg',
        'h-[220px] xs:h-[240px] sm:h-auto',
      )}
      style={{ touchAction: 'manipulation' }}
    >
      {/* Video container with proper centering */}
      <div 
        className={cn(
          "absolute inset-0 flex items-center justify-center bg-black",
          aspectRatio === 'zoom' && 'overflow-hidden'
        )}
        style={getAspectBoxStyle()}
      >
        <div 
          data-vjs-player 
          className={cn(
            "w-full h-full",
            aspectRatio === 'zoom' && 'overflow-hidden'
          )}
      >
        <video
          ref={videoRef}
          className={cn(
              "video-js vjs-big-play-centered w-full h-full",
              "vjs-no-flex",
              aspectRatio === 'zoom' && 'object-cover'
          )}
          playsInline
          autoPlay
          style={{
            maxHeight: aspectRatio === 'zoom' ? 'none' : '100vh',
            objectFit:
              aspectRatio === 'fill' ? 'fill' :
              aspectRatio === 'zoom' ? 'cover' :
              'contain',
            width: aspectRatio === 'zoom' ? '100%' : undefined,
            height: aspectRatio === 'zoom' ? '100%' : undefined,
            transform: aspectRatio === 'zoom' ? 'scale(1.01)' : undefined,
          }}
        />
        </div>
      </div>

      {/* Center play/pause button */}
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center",
          "transition-all duration-300",
          "opacity-0",
          showControls ? "opacity-100" : "opacity-0",
          "pointer-events-none"
        )}
      >
        <div className="flex items-center gap-4 pointer-events-auto">
          <button
            onClick={() => handleSkip(-10)}
          className={cn(
              "p-3 rounded-full bg-black/40 hover:bg-black/60",
              "transition-all duration-300 transform",
              "hover:scale-110 active:scale-95",
              !showControls && "opacity-0 scale-75",
              showControls && "opacity-100 scale-100"
            )}
            aria-label="Skip backward 10 seconds"
          >
            <SkipBack className="w-8 h-8 text-white" />
          </button>

          <button
            onClick={togglePlayPause}
            className={cn(
              "p-4 rounded-full bg-black/40 hover:bg-black/60",
              "transition-all duration-300 transform",
              "hover:scale-110 active:scale-95",
              !showControls && "opacity-0 scale-75",
              showControls && "opacity-100 scale-100",
              buffering && "animate-pulse"
            )}
            aria-label={playing ? "Pause" : "Play"}
          >
            {buffering ? (
              <Loader2 className="w-12 h-12 text-white animate-spin" />
            ) : playing ? (
              <Pause className="w-12 h-12 text-white" />
            ) : (
              <Play className="w-12 h-12 text-white" />
            )}
          </button>

          <button
            onClick={() => handleSkip(10)}
            className={cn(
              "p-3 rounded-full bg-black/40 hover:bg-black/60",
              "transition-all duration-300 transform",
              "hover:scale-110 active:scale-95",
              !showControls && "opacity-0 scale-75",
              showControls && "opacity-100 scale-100"
            )}
            aria-label="Skip forward 10 seconds"
          >
            <SkipForward className="w-8 h-8 text-white" />
          </button>
        </div>
        </div>

      {/* Bottom controls bar */}
        <div 
          className={cn(
          'absolute inset-x-0 bottom-0 z-20',
          'transition-all duration-500 ease-in-out transform',
          showControls ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
          'pointer-events-none bg-black/90',
          )}
        >
        {/* Progress bar */}
            <div
              ref={progressBarRef}
              className="relative w-full h-[6px] group/progress pointer-events-auto hover:h-[8px] transition-all"
            >
              <div className="absolute inset-0 cursor-pointer bg-white/20 rounded-full overflow-hidden">
              <div
                  className="absolute inset-y-0 left-0 bg-[#E50914] transition-all duration-200"
              style={{ width: `${played * 100}%` }}
            />
              </div>
              <div 
                className="absolute inset-y-0 left-0 bg-white/40 rounded-full transition-all duration-200 opacity-0 group-hover/progress:opacity-100"
                style={{ 
                  width: `${played * 100}%`,
                  transform: 'scaleX(1.02)',
                  transformOrigin: 'left'
                }}
              />
              <div 
                className="absolute h-4 w-4 bg-[#E50914] rounded-full -mt-[4px] transition-all duration-200 opacity-0 group-hover/progress:opacity-100 hover:scale-110"
                style={{ 
                  left: `${played * 100}%`,
                  transform: 'translateX(-50%)'
                }}
              />
              <input
                type="range"
                min={0}
                max={1}
                step={0.001}
                value={played}
                onChange={handleSeekChange}
                onMouseDown={() => setSeeking(true)}
                onMouseUp={() => setSeeking(false)}
                className="absolute inset-0 w-full opacity-0 cursor-pointer"
                aria-label="Seek"
              />
        </div>

        {/* Controls bar */}
        <div className="w-full px-2 sm:px-4 py-2 sm:py-1 pointer-events-auto flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 sm:gap-0">
          {/* Left controls */}
                              <div className="flex items-center gap-4">
            <div className="flex items-center group/volume gap-1 sm:gap-2">
                <button
                className="p-1 sm:p-2 hover:bg-white/10 rounded-l-md transition-colors"
                  onClick={handleMuteToggle}
                aria-label={muted ? 'Unmute' : 'Mute'}
                >
                {muted ? (
                    <VolumeX className="w-5 h-5 text-white" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-white" />
                  )}
                </button>
              
                            <div className="relative w-16 sm:w-24 px-1 sm:px-3 py-1 sm:py-2 group/volume-slider">
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={volume}
                      onChange={handleVolumeChange}
                      className={cn(
                        "w-[0px] sm:w-[60px] group-hover/volume:w-[60px]",
                        "h-[4px] appearance-none cursor-pointer",
                        "opacity-0 group-hover/volume:opacity-100 transition-all duration-200",
                        "[&::-webkit-slider-runnable-track]:h-[4px] [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-white/20",
                        "[&::-moz-range-track]:h-[4px] [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-white/20",
                        "[&::-ms-track]:h-[4px] [&::-ms-track]:rounded-full [&::-ms-track]:bg-white/20",
                        "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:active:scale-95 [&::-webkit-slider-thumb]:-mt-[4px]",
                        "[&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:shadow-sm [&::-moz-range-thumb]:transition-all [&::-moz-range-thumb]:hover:scale-110 [&::-moz-range-thumb]:active:scale-95",
                        "[&::-ms-thumb]:appearance-none [&::-ms-thumb]:w-3 [&::-ms-thumb]:h-3 [&::-ms-thumb]:rounded-full [&::-ms-thumb]:bg-white [&::-ms-thumb]:border-none [&::-ms-thumb]:shadow-sm [&::-ms-thumb]:transition-all [&::-ms-thumb]:hover:scale-110 [&::-ms-thumb]:active:scale-95",
                        "focus:outline-none active:outline-none"
                      )}
                      aria-label="Volume"
                      style={{
                        background: `linear-gradient(to right, white ${volume * 100}%, rgba(255,255,255,0.2) ${volume * 100}%)`,
                        width: '60px',
                        transition: 'width 0.2s ease-in-out'
                      }}
                />
              </div>

                <button
                  className={cn(
                  "p-1 sm:p-2 hover:bg-white/10 rounded-r-md transition-colors border-l border-white/10",
                  volumeBoost && "bg-yellow-400/90 hover:bg-yellow-400"
                  )}
                onClick={handleVolumeBoost}
                aria-label="Volume Boost"
                title="Volume Boost (2x)"
                >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={volumeBoost ? "black" : "currentColor"}
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                  className="w-5 h-5"
                >
                  <path d="M15.5 8.5c.82.82 1.5 2.07 1.5 3.5s-.68 2.68-1.5 3.5" />
                  <path d="M18.5 5.5c2.12 2.12 3.5 5.07 3.5 8.5s-1.38 6.38-3.5 8.5" />
                  <path d="M11 3 6 8H3c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h3l5 5z" />
                  </svg>
                </button>
              </div>
            <div className="text-white text-xs sm:text-sm font-medium space-x-1">
              <span>{formatTime(duration * played)}</span>
              <span>/</span>
              <span>{formatTime(duration)}</span>
            </div>

            {title && (
              <span className="text-white text-xs sm:text-sm font-medium ml-2">{title}</span>
            )}
            </div>

          {/* Right controls */}
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
            {/* Subtitles button */}
              <button
                className={cn(
                "p-1 sm:p-2 hover:bg-white/10 rounded-full transition-colors",
                currentTextTrack && "text-blue-400"
                )}
              onClick={() => handleTextTrackChange(currentTextTrack ? '' : (textTracks[0]?.id || ''))}
              aria-label="Toggle Subtitles"
              >
                <Subtitles className="w-5 h-5 text-white" />
              </button>

            {/* Aspect Ratio button and menu */}
              <div className="relative">
                <button
                className={cn(
                  "p-1 sm:p-2 hover:bg-white/10 rounded-full transition-colors",
                  showAspectRatioMenu && "bg-white/10"
                )}
                onClick={toggleAspectRatioMenu}
                aria-label="Aspect Ratio"
                >
                <SlidersHorizontal className="w-5 h-5 text-white" />
                </button>
              {showAspectRatioMenu && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-auto min-w-[160px]">
                  <div className="bg-black/90 backdrop-blur-sm rounded-lg p-2">
                    <div className="text-white/60 text-xs font-medium px-3 py-1">
                      Aspect Ratio
                    </div>
                    {(['auto', '16:9', '4:3', 'fill', 'zoom'] as const).map(ratio => (
                        <button
                        key={ratio}
                          className={cn(
                          "w-full px-3 py-2 text-left text-xs hover:bg-white/10 transition-colors flex items-center justify-between",
                          aspectRatio === ratio ? "text-[#E50914]" : "text-white"
                        )}
                        onClick={() => { handleAspectRatioChange(ratio); setShowAspectRatioMenu(false); }}
                      >
                        <span>{
                          ratio === 'auto' ? 'Auto' :
                          ratio === 'fill' ? 'Fill Screen' :
                          ratio === 'zoom' ? 'Zoom' :
                          ratio
                        }</span>
                        {aspectRatio === ratio && <CheckCircle2 className="w-4 h-4" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            {/* Settings button for playback speed and menu */}
              <div className="relative">
                <button
                className={cn(
                  "p-1 sm:p-2 hover:bg-white/10 rounded-full transition-colors",
                  showSettings && "bg-white/10"
                )}
                onClick={() => setShowSettings((prev) => !prev)}
                aria-label="Playback Speed"
                >
                  <Settings className="w-5 h-5 text-white" />
                </button>
                {showSettings && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-auto min-w-[160px]">
                  <div className="bg-black/90 backdrop-blur-sm rounded-lg p-2">
                    <div className="text-white/60 text-xs font-medium px-3 py-1">
                      Playback Speed
                    </div>
                      {playbackSpeeds.map((speed) => (
                          <button
                            key={speed}
                            className={cn(
                          "w-full px-3 py-2 text-left text-xs hover:bg-white/10 transition-colors flex items-center justify-between",
                          playbackRate === speed ? "text-[#E50914]" : "text-white"
                          )}
                        onClick={() => { handlePlaybackRateChange(speed); setShowSettings(false); }}
                          >
                        <span>{speed}x</span>
                        {playbackRate === speed && <CheckCircle2 className="w-4 h-4" />}
                          </button>
                        ))}
                      </div>
                      </div>
                    )}
              </div>

              <button
              className="p-1 sm:p-2 hover:bg-white/10 rounded-full transition-colors"
              onClick={() => setShowTheater(prev => !prev)}
              aria-label="Theater mode"
            >
              {showTheater ? (
                <Minimize className="w-5 h-5 text-white" />
              ) : (
                null
              )}
            </button>

            <button
              className="p-1 sm:p-2 hover:bg-white/10 rounded-full transition-colors"
                onClick={toggleFullscreen}
              aria-label="Toggle fullscreen"
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

      {/* Loading spinner */}
      {buffering && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="rounded-full p-3 sm:p-4">
            <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 text-[#E50914] animate-spin" />
          </div>
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 sm:w-16 sm:h-16 text-[#E50914] mx-auto mb-4" />
            <h3 className="text-white text-base sm:text-lg font-bold mb-2">Playback Error</h3>
            <p className="text-white/70 text-xs sm:text-sm">
              {error.message || 'Failed to play video'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
});