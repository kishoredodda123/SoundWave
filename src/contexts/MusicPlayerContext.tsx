
import React, { createContext, useContext, ReactNode } from 'react';
import { useMusicPlayer } from '@/hooks/useMusicPlayer';
import { Track } from '@/services/musicService';

interface MusicPlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  playlist: Track[];
  playTrack: (track: Track, trackList?: Track[]) => void;
  togglePlayPause: () => void;
  playNext: () => void;
  playPrevious: () => void;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

export const MusicPlayerProvider = ({ children }: { children: ReactNode }) => {
  const musicPlayer = useMusicPlayer();
  
  console.log('🎵 MusicPlayerProvider rendering with:', {
    currentTrack: musicPlayer.currentTrack?.title,
    isPlaying: musicPlayer.isPlaying
  });
  
  return (
    <MusicPlayerContext.Provider value={musicPlayer}>
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
