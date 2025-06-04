
import { useState, useCallback, useRef, useEffect } from 'react';
import { Track } from '@/services/musicService';

export const useMusicPlayer = () => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const lastTrackRef = useRef<string | null>(null);

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const savedTrack = localStorage.getItem('currentTrack');
      const savedIsPlaying = localStorage.getItem('isPlaying');
      const savedPlaylist = localStorage.getItem('playlist');
      const savedIndex = localStorage.getItem('currentIndex');

      if (savedTrack) {
        setCurrentTrack(JSON.parse(savedTrack));
      }
      if (savedIsPlaying) {
        setIsPlaying(JSON.parse(savedIsPlaying));
      }
      if (savedPlaylist) {
        setPlaylist(JSON.parse(savedPlaylist));
      }
      if (savedIndex) {
        setCurrentIndex(JSON.parse(savedIndex));
      }
    } catch (error) {
      console.error('Error loading music player state:', error);
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (currentTrack) {
      localStorage.setItem('currentTrack', JSON.stringify(currentTrack));
    }
  }, [currentTrack]);

  useEffect(() => {
    localStorage.setItem('isPlaying', JSON.stringify(isPlaying));
  }, [isPlaying]);

  useEffect(() => {
    localStorage.setItem('playlist', JSON.stringify(playlist));
  }, [playlist]);

  useEffect(() => {
    localStorage.setItem('currentIndex', JSON.stringify(currentIndex));
  }, [currentIndex]);

  const playTrack = useCallback((track: Track, trackList?: Track[]) => {
    console.log('🎵 Playing track:', track.title);
    console.log('🔗 Audio URL:', track.audioUrl);
    
    // If it's the same track, just toggle play/pause
    if (currentTrack?.id === track.id && lastTrackRef.current === track.id) {
      console.log('📀 Same track, toggling play/pause');
      setIsPlaying(prev => !prev);
      return;
    }
    
    // Set new track
    setCurrentTrack(track);
    setIsPlaying(true);
    lastTrackRef.current = track.id;
    
    if (trackList) {
      setPlaylist(trackList);
      const index = trackList.findIndex(t => t.id === track.id);
      setCurrentIndex(index >= 0 ? index : 0);
      console.log('📝 Set playlist with', trackList.length, 'tracks, current index:', index >= 0 ? index : 0);
    }
  }, [currentTrack]);

  const togglePlayPause = useCallback(() => {
    if (!currentTrack) {
      console.log('⚠️ No track selected for play/pause');
      return;
    }
    
    console.log('🔄 Toggle play/pause, current state:', isPlaying);
    setIsPlaying(prev => !prev);
  }, [isPlaying, currentTrack]);

  const playNext = useCallback(() => {
    if (playlist.length > 0 && currentIndex < playlist.length - 1) {
      const nextIndex = currentIndex + 1;
      const nextTrack = playlist[nextIndex];
      console.log('⏭️ Playing next track:', nextTrack.title);
      setCurrentIndex(nextIndex);
      setCurrentTrack(nextTrack);
      setIsPlaying(true);
      lastTrackRef.current = nextTrack.id;
    } else {
      console.log('🚫 No next track available');
    }
  }, [playlist, currentIndex]);

  const playPrevious = useCallback(() => {
    if (playlist.length > 0 && currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      const prevTrack = playlist[prevIndex];
      console.log('⏮️ Playing previous track:', prevTrack.title);
      setCurrentIndex(prevIndex);
      setCurrentTrack(prevTrack);
      setIsPlaying(true);
      lastTrackRef.current = prevTrack.id;
    } else {
      console.log('🚫 No previous track available');
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
