import React, { createContext, useContext, ReactNode, useRef, useEffect } from 'react';
import { useMusicPlayer } from '@/hooks/useMusicPlayer';
import { useRecentlyPlayed } from '@/hooks/useRecentlyPlayed';
import { Track } from '@/services/musicService';

interface MusicPlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  playlist: Track[];
  playTrack: (track: Track, trackList?: Track[]) => void;
  togglePlayPause: () => void;
  playNext: () => void;
  playPrevious: () => void;
  audioRef: React.RefObject<HTMLAudioElement>;
  currentTime: number;
  duration: number;
  volume: number;
  setVolume: (value: number) => void;
  handleSeek: (value: number) => void;
  skipForward: () => void;
  skipBackward: () => void;
  recentlyPlayed: Track[];
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

export const MusicPlayerProvider = ({ children }: { children: ReactNode }) => {
  const musicPlayer = useMusicPlayer();
  const { recentlyPlayed, addToRecentlyPlayed } = useRecentlyPlayed();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [volume, setVolume] = React.useState(70);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);

  // Track when a song starts playing to add it to recently played
  useEffect(() => {
    if (musicPlayer.currentTrack && musicPlayer.isPlaying) {
      addToRecentlyPlayed(musicPlayer.currentTrack);
    }
  }, [musicPlayer.currentTrack?.id, musicPlayer.isPlaying]);

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
      }
    };

    const handleEnded = () => {
      console.log('🏁 Audio ended');
      setCurrentTime(0);
      musicPlayer.playNext();
    };

    // Add event listeners
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [musicPlayer]);

  // Handle volume changes
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume / 100;
    }
  }, [volume]);

  // Handle play/pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !musicPlayer.currentTrack?.audioUrl) return;

    const handlePlayback = async () => {
      try {
        if (musicPlayer.isPlaying) {
          await audio.play();
        } else {
          audio.pause();
        }
      } catch (error) {
        console.error('❌ Audio playback error:', error);
      }
    };

    handlePlayback();
  }, [musicPlayer.isPlaying, musicPlayer.currentTrack]);

  // Handle track changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !musicPlayer.currentTrack?.audioUrl) return;

    audio.src = musicPlayer.currentTrack.audioUrl;
    audio.load();
    if (musicPlayer.isPlaying) {
      audio.play().catch(console.error);
    }
  }, [musicPlayer.currentTrack?.id]);

  const handleSeek = (value: number) => {
    const audio = audioRef.current;
    if (audio && !isNaN(value) && duration > 0) {
      const newTime = Math.min(value, duration);
      audio.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const skipForward = () => {
    const audio = audioRef.current;
    if (audio && duration > 0) {
      const newTime = Math.min(currentTime + 10, duration);
      audio.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const skipBackward = () => {
    const audio = audioRef.current;
    if (audio) {
      const newTime = Math.max(currentTime - 10, 0);
      audio.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const contextValue = {
    ...musicPlayer,
    audioRef,
    currentTime,
    duration,
    volume,
    setVolume,
    handleSeek,
    skipForward,
    skipBackward,
    recentlyPlayed
  };
  
  return (
    <MusicPlayerContext.Provider value={contextValue}>
      <audio
        ref={audioRef}
        preload="metadata"
        style={{ display: 'none' }}
      />
      {children}
    </MusicPlayerContext.Provider>
  );
};

export const useMusicPlayerContext = () => {
  const context = useContext(MusicPlayerContext);
  if (context === undefined) {
    console.error('useMusicPlayerContext must be used within a MusicPlayerProvider');
    throw new Error('useMusicPlayerContext must be used within a MusicPlayerProvider');
  }
  return context;
};
