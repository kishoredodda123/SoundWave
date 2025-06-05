
import { supabase, supabaseAdmin } from "@/integrations/supabase/client";

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

// Helper function to map database track to our Track interface
const mapDatabaseTrackToTrack = (dbTrack: any): Track => ({
  id: dbTrack.id,
  title: dbTrack.title,
  artist: dbTrack.artist,
  album: dbTrack.album || '',
  duration: dbTrack.duration || 0,
  cover: dbTrack.cover_url || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=300&h=300',
  audioUrl: dbTrack.audio_url,
  releaseDate: dbTrack.release_date,
  genre: dbTrack.genre,
  isLiked: false // We'll handle this separately if needed
});

// Function to get all tracks
const getAllTracks = async (): Promise<Track[]> => {
  const { data: tracks, error } = await supabase
    .from('music_files')
    .select('*');
  
  if (error) {
    console.error('Error fetching tracks:', error);
    return [];
  }
  
  return tracks.map(mapDatabaseTrackToTrack);
};

// Function to add track to recently played (using localStorage)
const addToRecentlyPlayed = (track: Track) => {
  try {
    const recentlyPlayed = getFromStorage(RECENTLY_PLAYED_KEY);
    
    // Remove track if it already exists
    const filteredTracks = recentlyPlayed.filter((t: Track) => t.id !== track.id);
    
    // Add track to the beginning
    const updatedTracks = [track, ...filteredTracks].slice(0, 10); // Keep only last 10
    
    saveToStorage(RECENTLY_PLAYED_KEY, updatedTracks);
  } catch (error) {
    console.error('Error adding track to recently played:', error);
  }
};

// Function to get recently played tracks (from localStorage)
const getRecentlyPlayed = (): Track[] => {
  return getFromStorage(RECENTLY_PLAYED_KEY);
};

// Function to check if track is liked
const isTrackLiked = async (trackId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('liked_tracks')
      .select('id')
      .eq('track_id', trackId)
      .single();

    if (error) {
      console.error('Error checking track like status:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error in isTrackLiked:', error);
    return false;
  }
};

// Function to toggle like status
const toggleLikeTrack = async (track: Track): Promise<boolean> => {
  try {
    const isLiked = await isTrackLiked(track.id);

    if (isLiked) {
      // Unlike the track
      const { error } = await supabaseAdmin
        .from('liked_tracks')
        .delete()
        .eq('track_id', track.id);

      if (error) {
        console.error('Error unliking track:', error);
        return true; // Return true because it's still liked (operation failed)
      }

      return false; // Successfully unliked
    } else {
      // Like the track
      const { error } = await supabaseAdmin
        .from('liked_tracks')
        .insert([{ 
          track_id: track.id,
          created_at: new Date().toISOString()
        }]);

      if (error) {
        console.error('Error liking track:', error);
        return false; // Return false because it's still unliked (operation failed)
      }

      return true; // Successfully liked
    }
  } catch (error) {
    console.error('Error in toggleLikeTrack:', error);
    throw error;
  }
};

// Function to get liked songs
const getLikedSongs = async (): Promise<Track[]> => {
  try {
    const { data: likedTracks, error } = await supabaseAdmin
      .from('liked_tracks')
      .select(`
        track_id,
        music_files (
          id,
          title,
          artist,
          album,
          cover_url,
          audio_url,
          duration,
          genre,
          release_date
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching liked songs:', error);
      return [];
    }

    return likedTracks
      .map(lt => lt.music_files)
      .filter(Boolean)
      .map(track => ({
        id: track.id,
        title: track.title,
        artist: track.artist,
        album: track.album || '',
        duration: track.duration || 0,
        cover: track.cover_url || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=300&h=300',
        audioUrl: track.audio_url,
        releaseDate: track.release_date,
        genre: track.genre,
        isLiked: true
      }));
  } catch (error) {
    console.error('Error in getLikedSongs:', error);
    return [];
  }
};

// Function to create an album
const createAlbum = async (albumData: Omit<Album, 'id'>): Promise<Album | null> => {
  try {
    // Validate required fields
    if (!albumData.title || !albumData.artist) {
      throw new Error('Album title and artist are required');
    }

    // Prepare the data
    const insertData = {
      title: albumData.title.trim(),
      artist: albumData.artist.trim(),
      album: albumData.title.trim(),
      cover_url: albumData.cover || 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=300&h=300',
      release_date: albumData.releaseDate || new Date().toISOString(),
      audio_url: '', // Placeholder
      genre: 'Album',
      duration: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Create the album entry using the admin client
    const { data: albumTrack, error: albumError } = await supabaseAdmin
      .from('music_files')
      .insert([insertData])
      .select('*')
      .single();

    if (albumError) {
      console.error('Error creating album:', albumError);
      throw new Error(`Failed to create album: ${albumError.message}`);
    }

    if (!albumTrack) {
      throw new Error('Failed to create album: No data returned from server');
    }

    // Return the created album
    return {
      id: albumTrack.id,
      title: albumTrack.title,
      artist: albumTrack.artist,
      cover: albumTrack.cover_url || '',
      releaseDate: albumTrack.release_date || '',
      trackCount: 0,
      tracks: []
    };
  } catch (error) {
    console.error('Error in createAlbum:', error);
    throw error;
  }
};

// Function to add a track to an album
const addTrackToAlbum = async (albumId: string, track: Omit<Track, 'id' | 'duration'>): Promise<Track | null> => {
  try {
    // Get the album details first
    const { data: albumData } = await supabaseAdmin
      .from('music_files')
      .select('*')
      .eq('id', albumId)
      .single();

    if (!albumData) {
      console.error('Album not found');
      return null;
    }

    // Add the new track using the admin client
    const { data: newTrack, error: trackError } = await supabaseAdmin
      .from('music_files')
      .insert([{
        title: track.title,
        artist: track.artist,
        album: albumData.title,
        cover_url: track.cover || albumData.cover_url,
        audio_url: track.audioUrl,
        release_date: albumData.release_date,
        genre: track.genre || 'Album Track'
      }])
      .select()
      .single();

    if (trackError) {
      console.error('Error adding track:', trackError);
      return null;
    }

    return mapDatabaseTrackToTrack(newTrack);
  } catch (error) {
    console.error('Error in addTrackToAlbum:', error);
    return null;
  }
};

// Function to get all albums with their tracks
const getAlbums = async (): Promise<Album[]> => {
  try {
    // First get all unique album titles
    const { data: albumTracks, error: albumError } = await supabase
      .from('music_files')
      .select('*')
      .not('album', 'is', null)
      .order('created_at', { ascending: false });

    if (albumError) {
      console.error('Error fetching albums:', albumError);
      return [];
    }

    // Group tracks by album
    const albumsMap = new Map<string, Album>();
    
    albumTracks.forEach(track => {
      if (!track.album) return;
      
      if (!albumsMap.has(track.album)) {
        albumsMap.set(track.album, {
          id: track.id,
          title: track.album,
          artist: track.artist,
          cover: track.cover_url || '',
          releaseDate: track.release_date || '',
          trackCount: 0,
          tracks: []
        });
      }
      
      const album = albumsMap.get(track.album)!;
      album.tracks.push(mapDatabaseTrackToTrack(track));
      album.trackCount = album.tracks.length;
    });

    return Array.from(albumsMap.values());
  } catch (error) {
    console.error('Error in getAlbums:', error);
    return [];
  }
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
  const allTracks = await getAllTracks();
  return allTracks.slice(0, 5);
};

// Function to get recommended tracks
const getRecommendedTracks = async (): Promise<Track[]> => {
  const allTracks = await getAllTracks();
  return allTracks.slice(0, 5);
};

// Function to search tracks
const searchTracks = async (query: string): Promise<Track[]> => {
  const { data: tracks, error } = await supabase
    .from('music_files')
    .select('*')
    .or(`title.ilike.%${query}%,artist.ilike.%${query}%,album.ilike.%${query}%`);

  if (error) {
    console.error('Error searching tracks:', error);
    return [];
  }

  return tracks.map(mapDatabaseTrackToTrack);
};

// Function to update album
const updateAlbum = async (albumId: string, updates: { title?: string; cover?: string }) => {
  try {
    // First get the album details
    const { data: albumData } = await supabaseAdmin
      .from('music_files')
      .select('*')
      .eq('id', albumId)
      .single();

    if (!albumData) {
      console.error('Album not found');
      return false;
    }

    // Update the album track itself
    const { error: albumError } = await supabaseAdmin
      .from('music_files')
      .update({
        title: updates.title,
        cover_url: updates.cover,
        updated_at: new Date().toISOString()
      })
      .eq('id', albumId);

    if (albumError) {
      console.error('Error updating album:', albumError);
      return false;
    }

    // Update all tracks in this album to maintain consistency
    if (updates.title || updates.cover) {
      const { error: tracksError } = await supabaseAdmin
        .from('music_files')
        .update({
          album: updates.title || albumData.album,
          cover_url: updates.cover || albumData.cover_url,
          updated_at: new Date().toISOString()
        })
        .eq('album', albumData.album);

      if (tracksError) {
        console.error('Error updating album tracks:', tracksError);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error in updateAlbum:', error);
    return false;
  }
};

// Function to update track
const updateTrack = async (trackId: string, updates: { title?: string; artist?: string; audioUrl?: string }) => {
  try {
    const { error } = await supabaseAdmin
      .from('music_files')
      .update({
        title: updates.title,
        artist: updates.artist,
        audio_url: updates.audioUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', trackId);

    if (error) {
      console.error('Error updating track:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateTrack:', error);
    return false;
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
