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
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
  url: string;
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

const playbackSpeeds = [0.5, 1, 1.25, 1.5, 2];

export function VideoPlayer({ url, onError }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
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
  const [showTheater, setShowTheater] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const mouseIdleTimerRef = useRef<any>(null);

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
  useEffect(() => {
    if (!playerRef.current && videoRef.current) {
      const videoElement = videoRef.current;
      const player = videojs(videoElement, {
        controls: false,
        autoplay: false,
        preload: 'auto',
        fluid: true,
        playbackRates: playbackSpeeds,
        html5: {
          vhs: { overrideNative: true },
          nativeAudioTracks: true,
          nativeVideoTracks: true,
          nativeTextTracks: true,
        },
      });

      // Add sample captions (replace with your actual captions)
      player.addRemoteTextTrack({
        kind: 'captions',
        srclang: 'en',
        label: 'English',
        src: 'path/to/captions.vtt', // Replace with actual captions file
      }, false);

      player.src({ src: url, type: 'video/mp4' });

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
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [url, onError]);

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
      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          handlePlayPause();
          break;
        case 'arrowleft':
          handleSkipBackward();
          break;
        case 'arrowright':
          handleSkipForward();
          break;
        case 'f':
          toggleFullscreen();
          break;
        case 'm':
          handleMuteToggle();
          break;
        case 't':
          setShowTheater(v => !v);
          break;
      }
    };
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handlePlayPause = () => {
    if (playerRef.current) {
      if (playing) playerRef.current.pause();
      else playerRef.current.play();
      setPlaying(!playing);
      setShowControls(true);
    }
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
      playerRef.current.volume(newVolume);
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
        'h-[220px] xs:h-[240px] sm:h-auto', // Responsive height for mobile
      )}
      onDoubleClick={toggleFullscreen}
      style={{ touchAction: 'manipulation' }}
    >
      {/* Video container with proper centering */}
      <div className="absolute inset-0 flex items-center justify-center bg-black">
        <div data-vjs-player className="w-full h-full">
          <video
            ref={videoRef}
            className="video-js vjs-big-play-centered w-full h-full object-contain max-h-full"
            playsInline
            style={{ maxHeight: '100vh' }}
          />
        </div>
      </div>

      {/* Elegant floating controls */}
      <div
        className={cn(
          'absolute inset-x-0 bottom-0 z-20',
          'transition-all duration-500 ease-in-out transform',
          showControls ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
          'pointer-events-none',
        )}
      >
        {/* Netflix-style progress bar */}
        <div 
          ref={progressBarRef}
          className="relative w-full h-2 sm:h-1 group/progress pointer-events-auto"
        >
          <div className="absolute inset-0 -top-2 -bottom-2 cursor-pointer bg-white/20 group-hover/progress:h-4 transition-all duration-200">
            <div
              className="absolute inset-y-0 left-0 bg-[#E50914] transition-all duration-200"
              style={{ width: `${played * 100}%` }}
            />
            {hoverTime !== null && (
              <div 
                className="absolute top-0 -translate-y-full transform px-2 py-1 bg-white/90 rounded text-xs font-medium text-black pointer-events-none"
                style={{ left: `${(hoverTime / duration) * 100}%`, transform: 'translate(-50%, -8px)' }}
              >
                {formatTime(hoverTime)}
              </div>
            )}
          </div>
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

        {/* Controls bar with Netflix-style gradient */}
        <div 
          className="w-full px-2 sm:px-6 py-2 sm:py-4 pointer-events-auto"
          style={{
            background: 'linear-gradient(0deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 70%, transparent 100%)',
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-4">
            {/* Left controls */}
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                className="p-2 sm:p-2.5 rounded-full hover:bg-white/10 transition-colors"
                onClick={handlePlayPause}
                aria-label={playing ? 'Pause' : 'Play'}
              >
                {playing ? (
                  <Pause className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                ) : (
                  <Play className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                )}
              </button>

              <div className="flex items-center gap-1">
                <button
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                  onClick={handleSkipBackward}
                  aria-label="Rewind 10 seconds"
                >
                  <SkipBack className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </button>
                <button
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                  onClick={handleSkipForward}
                  aria-label="Forward 10 seconds"
                >
                  <SkipForward className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </button>
              </div>

              {/* Volume control (hide on xs screens) */}
              <div className="group relative hidden xs:block">
                <button
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                  onClick={handleMuteToggle}
                  aria-label={muted ? 'Unmute' : 'Mute'}
                >
                  {muted ? (
                    <VolumeX className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  ) : (
                    <Volume2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  )}
                </button>
                <div className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 hidden group-hover:block">
                  <div className="bg-black/90 backdrop-blur-sm rounded-lg p-2">
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.1}
                      value={muted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="h-24 w-1.5 appearance-none bg-white/30 rounded-full outline-none"
                      style={{
                        writingMode: 'vertical-lr',
                        WebkitAppearance: 'slider-vertical',
                      }}
                    />
                  </div>
                </div>
              </div>

              <span className="text-white/90 text-xs sm:text-sm font-medium">
                {formatTime(duration * played)} / {formatTime(duration)}
              </span>
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Subtitles menu */}
              <div className="group relative">
                <button
                  className={cn(
                    "p-2 rounded-full hover:bg-white/10 transition-colors",
                    currentTextTrack && "text-[#E50914]"
                  )}
                  aria-label="Subtitles"
                >
                  <Subtitles className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                {textTracks.length > 0 && (
                  <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block">
                    <div className="bg-black/90 backdrop-blur-sm rounded-lg p-2 min-w-[160px] sm:min-w-[200px]">
                      <div className="text-white/60 text-xs font-medium px-3 py-1">
                        Subtitles
                      </div>
                      {textTracks.map(track => (
                        <button
                          key={track.id}
                          className={cn(
                            "w-full px-3 py-2 text-left text-xs sm:text-sm hover:bg-white/10 transition-colors",
                            currentTextTrack === track.id ? "text-[#E50914]" : "text-white"
                          )}
                          onClick={() => handleTextTrackChange(track.id)}
                        >
                          {track.label}
                        </button>
                      ))}
                      <button
                        className={cn(
                          "w-full px-3 py-2 text-left text-xs sm:text-sm hover:bg-white/10 transition-colors",
                          !currentTextTrack ? "text-[#E50914]" : "text-white"
                        )}
                        onClick={() => handleTextTrackChange('')}
                      >
                        Off
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Settings menu */}
              <div className="group relative">
                <button
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                  aria-label="Settings"
                >
                  <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </button>
                <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block">
                  <div className="bg-black/90 backdrop-blur-sm rounded-lg p-2 min-w-[160px] sm:min-w-[200px]">
                    {/* Playback speed */}
                    <div className="mb-2">
                      <div className="text-white/60 text-xs font-medium px-3 py-1">
                        Playback Speed
                      </div>
                      <div className="grid grid-cols-3 gap-1 p-1">
                        {playbackSpeeds.map(speed => (
                          <button
                            key={speed}
                            className={cn(
                              "px-2 py-1 text-xs sm:text-sm rounded",
                              playbackRate === speed
                                ? "bg-[#E50914] text-white"
                                : "text-white hover:bg-white/10"
                            )}
                            onClick={() => handlePlaybackRateChange(speed)}
                          >
                            {speed}x
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Audio tracks */}
                    {audioTracks.length > 0 && (
                      <div>
                        <div className="text-white/60 text-xs font-medium px-3 py-1">
                          Audio
                        </div>
                        {audioTracks.map(track => (
                          <button
                            key={track.id}
                            className={cn(
                              "w-full px-3 py-2 text-left text-xs sm:text-sm hover:bg-white/10 transition-colors",
                              currentAudioTrack === track.id ? "text-[#E50914]" : "text-white"
                            )}
                            onClick={() => handleAudioTrackChange(track.id)}
                          >
                            {track.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Theater mode (hide on xs screens) */}
              <button
                className={cn(
                  "p-2 rounded-full hover:bg-white/10 transition-colors hidden xs:inline-flex",
                  showTheater && "text-[#E50914]"
                )}
                onClick={() => setShowTheater(v => !v)}
                aria-label="Theater mode"
              >
                <MonitorPlay className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              {/* Fullscreen */}
              <button
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
                onClick={toggleFullscreen}
                aria-label="Toggle fullscreen"
              >
                {fullscreen ? (
                  <Minimize className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                ) : (
                  <Maximize className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Center play button */}
      {!playing && !buffering && !error && (
        <button
          className="absolute inset-0 flex items-center justify-center"
          onClick={handlePlayPause}
          aria-label="Play"
        >
          <div className="rounded-full p-3 sm:p-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all">
            <Play className="w-12 h-12 sm:w-16 sm:h-16 text-white" fill="white" />
          </div>
        </button>
      )}

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
}