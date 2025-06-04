import { useState, useEffect } from 'react';
import { Track } from '@/services/musicService';

const RECENTLY_PLAYED_KEY = 'recentlyPlayed';
const MAX_RECENT_TRACKS = 20;

export const useRecentlyPlayed = () => {
  const [recentlyPlayed, setRecentlyPlayed] = useState<Track[]>([]);

  // Load recently played tracks from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(RECENTLY_PLAYED_KEY);
      if (saved) {
        setRecentlyPlayed(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading recently played tracks:', error);
    }
  }, []);

  // Add a track to recently played
  const addToRecentlyPlayed = (track: Track) => {
    setRecentlyPlayed(prev => {
      // Remove the track if it already exists
      const filtered = prev.filter(t => t.id !== track.id);
      
      // Add the track to the beginning
      const updated = [track, ...filtered];
      
      // Keep only the most recent tracks
      const limited = updated.slice(0, MAX_RECENT_TRACKS);
      
      // Save to localStorage
      localStorage.setItem(RECENTLY_PLAYED_KEY, JSON.stringify(limited));
      
      return limited;
    });
  };

  // Get recently played tracks
  const getRecentlyPlayed = () => recentlyPlayed;

  // Clear recently played tracks
  const clearRecentlyPlayed = () => {
    localStorage.removeItem(RECENTLY_PLAYED_KEY);
    setRecentlyPlayed([]);
  };

  return {
    recentlyPlayed,
    addToRecentlyPlayed,
    getRecentlyPlayed,
    clearRecentlyPlayed
  };
}; 