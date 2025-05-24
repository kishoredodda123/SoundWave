
import { useState, useCallback } from 'react';
import { Track } from '@/services/musicService';

export const useMusicPlayer = () => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const playTrack = useCallback((track: Track, trackList?: Track[]) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    
    if (trackList) {
      setPlaylist(trackList);
      const index = trackList.findIndex(t => t.id === track.id);
      setCurrentIndex(index >= 0 ? index : 0);
    }
  }, []);

  const togglePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const playNext = useCallback(() => {
    if (playlist.length > 0 && currentIndex < playlist.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setCurrentTrack(playlist[nextIndex]);
      setIsPlaying(true);
    }
  }, [playlist, currentIndex]);

  const playPrevious = useCallback(() => {
    if (playlist.length > 0 && currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      setCurrentTrack(playlist[prevIndex]);
      setIsPlaying(true);
    }
  }, [playlist, currentIndex]);

  return {
    currentTrack,
    isPlaying,
    playlist,
    playTrack,
    togglePlayPause,
    playNext,
    playPrevious
  };
};
