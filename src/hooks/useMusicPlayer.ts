
import { useState, useCallback } from 'react';
import { Track } from '@/services/musicService';

export const useMusicPlayer = () => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const playTrack = useCallback((track: Track, trackList?: Track[]) => {
    console.log('Playing track:', track.title, 'Audio URL:', track.audioUrl);
    setCurrentTrack(track);
    setIsPlaying(true);
    
    if (trackList) {
      setPlaylist(trackList);
      const index = trackList.findIndex(t => t.id === track.id);
      setCurrentIndex(index >= 0 ? index : 0);
      console.log('Set playlist with', trackList.length, 'tracks, current index:', index >= 0 ? index : 0);
    }
  }, []);

  const togglePlayPause = useCallback(() => {
    console.log('Toggle play/pause, current state:', isPlaying);
    setIsPlaying(prev => !prev);
  }, [isPlaying]);

  const playNext = useCallback(() => {
    if (playlist.length > 0 && currentIndex < playlist.length - 1) {
      const nextIndex = currentIndex + 1;
      const nextTrack = playlist[nextIndex];
      console.log('Playing next track:', nextTrack.title);
      setCurrentIndex(nextIndex);
      setCurrentTrack(nextTrack);
      setIsPlaying(true);
    } else {
      console.log('No next track available');
    }
  }, [playlist, currentIndex]);

  const playPrevious = useCallback(() => {
    if (playlist.length > 0 && currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      const prevTrack = playlist[prevIndex];
      console.log('Playing previous track:', prevTrack.title);
      setCurrentIndex(prevIndex);
      setCurrentTrack(prevTrack);
      setIsPlaying(true);
    } else {
      console.log('No previous track available');
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
