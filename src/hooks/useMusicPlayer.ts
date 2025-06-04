
import { useState, useCallback, useRef, useEffect } from 'react';
import { Track } from '@/services/musicService';

export const useMusicPlayer = () => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const lastTrackRef = useRef<string | null>(null);
  const stateInitialized = useRef(false);

  // Persist state to localStorage
  useEffect(() => {
    if (!stateInitialized.current) {
      // Load from localStorage on initialization
      const savedState = localStorage.getItem('musicPlayerState');
      if (savedState) {
        try {
          const { currentTrack: savedTrack, playlist: savedPlaylist, currentIndex: savedIndex } = JSON.parse(savedState);
          if (savedTrack) {
            setCurrentTrack(savedTrack);
            setPlaylist(savedPlaylist || []);
            setCurrentIndex(savedIndex || 0);
            lastTrackRef.current = savedTrack.id;
          }
        } catch (error) {
          console.error('Error loading music player state:', error);
        }
      }
      stateInitialized.current = true;
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (stateInitialized.current && currentTrack) {
      const stateToSave = {
        currentTrack,
        playlist,
        currentIndex
      };
      localStorage.setItem('musicPlayerState', JSON.stringify(stateToSave));
    }
  }, [currentTrack, playlist, currentIndex]);

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
