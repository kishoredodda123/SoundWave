import { supabase } from "@/integrations/supabase/client";

// Types for music data
export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  cover: string;
  audioUrl: string;
  releaseDate?: string;
  genre?: string;
  isLiked?: boolean;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  cover: string;
  releaseDate: string;
  trackCount: number;
  tracks: Track[];
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  cover: string;
  trackCount: number;
  tracks: Track[];
}

// Local storage keys
const LIKED_SONGS_KEY = 'liked_songs';
const RECENTLY_PLAYED_KEY = 'recently_played';
const PLAYLISTS_KEY = 'playlists';
const ALBUMS_KEY = 'albums';

// Public tracks with working audio URLs
const publicTracks: Track[] = [
  {
    id: 'public-track-1',
    title: 'My Public Song',
    artist: 'Your Artist',
    album: 'Public Album',
    duration: 180,
    cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=300&h=300',
    audioUrl: 'https://u.pcloud.link/publink/show?code=XZORNS5ZSnViH86claLQ0q3lVijrO48qffw7',
    releaseDate: '2024-01-01',
    genre: 'Public',
  },
  {
    id: 'public-track-2',
    title: 'Harom Harom Hara',
    artist: 'Unknown Artist',
    album: 'Unknown Album',
    duration: 240,
    cover: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=300&h=300',
    audioUrl: 'https://resilient-cheesecake-34437e.netlify.app/%5BiSongs.info%5D%2001%20-%20Harom%20Harom%20Hara.mp3',
    releaseDate: '2024-01-01',
    genre: 'Public',
  }
];

// Helper functions for local storage
const getFromStorage = (key: string) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : [];
  } catch {
    return [];
  }
};

const saveToStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

// Function to get all tracks (public + albums)
const getAllTracks = (): Track[] => {
  const albums: Album[] = getFromStorage(ALBUMS_KEY);
  const albumTracks = albums.flatMap(album => album.tracks);
  return [...publicTracks, ...albumTracks];
};

// Function to add track to recently played
const addToRecentlyPlayed = (track: Track) => {
  const recentlyPlayed: Track[] = getFromStorage(RECENTLY_PLAYED_KEY);
  const filtered = recentlyPlayed.filter(t => t.id !== track.id);
  const updated = [track, ...filtered].slice(0, 10); // Keep only last 10
  saveToStorage(RECENTLY_PLAYED_KEY, updated);
};

// Function to get recently played tracks
const getRecentlyPlayed = (): Track[] => {
  return getFromStorage(RECENTLY_PLAYED_KEY);
};

// Function to toggle like status
const toggleLikeTrack = (track: Track): boolean => {
  const likedSongs: Track[] = getFromStorage(LIKED_SONGS_KEY);
  const isLiked = likedSongs.some(t => t.id === track.id);
  
  if (isLiked) {
    const updated = likedSongs.filter(t => t.id !== track.id);
    saveToStorage(LIKED_SONGS_KEY, updated);
    return false;
  } else {
    const updated = [...likedSongs, { ...track, isLiked: true }];
    saveToStorage(LIKED_SONGS_KEY, updated);
    return true;
  }
};

// Function to get liked songs
const getLikedSongs = (): Track[] => {
  return getFromStorage(LIKED_SONGS_KEY);
};

// Function to check if track is liked
const isTrackLiked = (trackId: string): boolean => {
  const likedSongs: Track[] = getFromStorage(LIKED_SONGS_KEY);
  return likedSongs.some(t => t.id === trackId);
};

// Function to create album
const createAlbum = (albumData: Omit<Album, 'id'>) => {
  const albums: Album[] = getFromStorage(ALBUMS_KEY);
  const newAlbum: Album = {
    ...albumData,
    id: Date.now().toString(),
  };
  const updated = [...albums, newAlbum];
  saveToStorage(ALBUMS_KEY, updated);
  return newAlbum;
};

// Function to add track to album
const addTrackToAlbum = async (albumId: string, track: Omit<Track, 'id' | 'duration'>) => {
  const albums: Album[] = getFromStorage(ALBUMS_KEY);
  const albumIndex = albums.findIndex(a => a.id === albumId);
  
  if (albumIndex !== -1) {
    // Get duration from audio file
    const duration = await getAudioDuration(track.audioUrl);
    
    const newTrack: Track = {
      ...track,
      id: `${albumId}-${Date.now()}`,
      duration: duration,
    };
    
    albums[albumIndex].tracks.push(newTrack);
    albums[albumIndex].trackCount = albums[albumIndex].tracks.length;
    saveToStorage(ALBUMS_KEY, albums);
    return newTrack;
  }
  
  return null;
};

// Function to get albums
const getAlbums = (): Album[] => {
  return getFromStorage(ALBUMS_KEY);
};

// Function to get featured playlists (only show user-created playlists)
const getFeaturedPlaylists = async (): Promise<Playlist[]> => {
  return getFromStorage(PLAYLISTS_KEY);
};

// Function to create playlist
const createPlaylist = (playlistData: Omit<Playlist, 'id'>) => {
  const playlists: Playlist[] = getFromStorage(PLAYLISTS_KEY);
  const newPlaylist: Playlist = {
    ...playlistData,
    id: Date.now().toString(),
  };
  const updated = [...playlists, newPlaylist];
  saveToStorage(PLAYLISTS_KEY, updated);
  return newPlaylist;
};

// Function to add track to playlist
const addTrackToPlaylist = (playlistId: string, track: Track) => {
  const playlists: Playlist[] = getFromStorage(PLAYLISTS_KEY);
  const playlistIndex = playlists.findIndex(p => p.id === playlistId);
  
  if (playlistIndex !== -1) {
    const isAlreadyInPlaylist = playlists[playlistIndex].tracks.some(t => t.id === track.id);
    if (!isAlreadyInPlaylist) {
      playlists[playlistIndex].tracks.push(track);
      playlists[playlistIndex].trackCount = playlists[playlistIndex].tracks.length;
      saveToStorage(PLAYLISTS_KEY, playlists);
    }
  }
};

// Function to get trending tracks
const getTrendingTracks = async (): Promise<Track[]> => {
  const allTracks = getAllTracks();
  return allTracks.slice(0, 5);
};

// Function to get recommended tracks
const getRecommendedTracks = async (): Promise<Track[]> => {
  const allTracks = getAllTracks();
  return allTracks.slice(0, 5);
};

// Function to search for tracks
const searchTracks = async (query: string): Promise<Track[]> => {
  if (!query) return [];
  
  const normalizedQuery = query.toLowerCase();
  const allTracks = getAllTracks();
  
  return allTracks.filter(track => 
    track.title.toLowerCase().includes(normalizedQuery) ||
    track.artist.toLowerCase().includes(normalizedQuery) ||
    track.album.toLowerCase().includes(normalizedQuery)
  );
};

// Function to get audio duration from URL
const getAudioDuration = (audioUrl: string): Promise<number> => {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.addEventListener('loadedmetadata', () => {
      resolve(audio.duration || 180); // Fallback to 3 minutes if can't detect
    });
    audio.addEventListener('error', () => {
      resolve(180); // Fallback duration on error
    });
    audio.src = audioUrl;
  });
};

// Function to update album
const updateAlbum = (albumId: string, updates: { title?: string; cover?: string }) => {
  const albums: Album[] = getFromStorage(ALBUMS_KEY);
  const albumIndex = albums.findIndex(a => a.id === albumId);
  
  if (albumIndex !== -1) {
    albums[albumIndex] = { ...albums[albumIndex], ...updates };
    // Update cover for all tracks in the album if cover is updated
    if (updates.cover) {
      albums[albumIndex].tracks = albums[albumIndex].tracks.map(track => ({
        ...track,
        cover: updates.cover!
      }));
    }
    // Update album name for all tracks if title is updated
    if (updates.title) {
      albums[albumIndex].tracks = albums[albumIndex].tracks.map(track => ({
        ...track,
        album: updates.title!
      }));
    }
    saveToStorage(ALBUMS_KEY, albums);
  }
};

// Function to update track
const updateTrack = (trackId: string, updates: { title?: string; artist?: string; audioUrl?: string }) => {
  const albums: Album[] = getFromStorage(ALBUMS_KEY);
  
  for (let album of albums) {
    const trackIndex = album.tracks.findIndex(t => t.id === trackId);
    if (trackIndex !== -1) {
      album.tracks[trackIndex] = { ...album.tracks[trackIndex], ...updates };
      saveToStorage(ALBUMS_KEY, albums);
      break;
    }
  }
};

export const musicService = {
  getAllTracks,
  getFeaturedPlaylists,
  getTrendingTracks,
  getRecommendedTracks,
  searchTracks,
  addToRecentlyPlayed,
  getRecentlyPlayed,
  toggleLikeTrack,
  getLikedSongs,
  isTrackLiked,
  createAlbum,
  addTrackToAlbum,
  getAlbums,
  createPlaylist,
  addTrackToPlaylist,
  updateAlbum,
  updateTrack,
};
