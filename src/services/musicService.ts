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
  backblazeFileId?: string;
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

// Function to transform Supabase music_files to Track objects
const transformMusicFileToTrack = (file: any): Track => {
  return {
    id: file.id,
    title: file.title,
    artist: file.artist,
    album: file.album || '',
    duration: file.duration || 0,
    cover: file.cover_url || 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=300&h=300',
    audioUrl: file.audio_url,
    releaseDate: file.release_date,
    genre: file.genre,
    backblazeFileId: file.backblaze_file_id
  };
};

// Function to get music from Supabase (which will be synced with Backblaze)
const getMusicFromBackblaze = async (): Promise<Track[]> => {
  try {
    console.log('Getting music from Supabase...');
    const { data, error } = await supabase
      .from('music_files')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching music files:', error);
      // Return mock data as fallback during development
      return mockTracks;
    }
    
    if (data && data.length > 0) {
      console.log(`Found ${data.length} music files in database`);
      return data.map(transformMusicFileToTrack);
    } else {
      console.log('No music files found in database, returning mock data');
      return mockTracks;
    }
  } catch (error) {
    console.error('Error in getMusicFromBackblaze:', error);
    return mockTracks;
  }
};

// Function to get featured playlists from Supabase
const getFeaturedPlaylists = async (): Promise<Playlist[]> => {
  try {
    const { data, error } = await supabase
      .from('playlists')
      .select(`
        id,
        title,
        description,
        cover_url,
        playlist_tracks (
          position,
          music_files (*)
        )
      `);

    if (error) {
      console.error('Error fetching playlists:', error);
      return mockPlaylists;
    }

    if (data && data.length > 0) {
      return data.map((playlist: any) => {
        const tracks = playlist.playlist_tracks
          .sort((a: any, b: any) => a.position - b.position)
          .map((item: any) => transformMusicFileToTrack(item.music_files));
        
        return {
          id: playlist.id,
          title: playlist.title,
          description: playlist.description || '',
          cover: playlist.cover_url || 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=300&h=300',
          trackCount: tracks.length,
          tracks: tracks
        };
      });
    } else {
      return mockPlaylists;
    }
  } catch (error) {
    console.error('Error in getFeaturedPlaylists:', error);
    return mockPlaylists;
  }
};

// Function to get trending tracks
const getTrendingTracks = async (): Promise<Track[]> => {
  try {
    // In a real app, you might have a view or algorithm to determine trending
    // For now, we'll just get the most recently added tracks
    const { data, error } = await supabase
      .from('music_files')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (error) {
      console.error('Error fetching trending tracks:', error);
      return mockTracks.slice(0, 5);
    }
    
    if (data && data.length > 0) {
      return data.map(transformMusicFileToTrack);
    } else {
      return mockTracks.slice(0, 5);
    }
  } catch (error) {
    console.error('Error in getTrendingTracks:', error);
    return mockTracks.slice(0, 5);
  }
};

// Function to get recommended tracks based on user preferences
const getRecommendedTracks = async (): Promise<Track[]> => {
  try {
    // In a real app with user preferences, you'd use a more sophisticated algorithm
    // For now, we'll just get some random tracks
    const { data, error } = await supabase
      .from('music_files')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('Error fetching recommended tracks:', error);
      return mockTracks.slice(3, 6);
    }
    
    if (data && data.length > 0) {
      return data.map(transformMusicFileToTrack);
    } else {
      return mockTracks.slice(3, 6);
    }
  } catch (error) {
    console.error('Error in getRecommendedTracks:', error);
    return mockTracks.slice(3, 6);
  }
};

// Function to search for tracks
const searchTracks = async (query: string): Promise<Track[]> => {
  if (!query) return [];
  
  try {
    const normalizedQuery = query.toLowerCase();
    
    const { data, error } = await supabase
      .from('music_files')
      .select('*')
      .or(`title.ilike.%${normalizedQuery}%,artist.ilike.%${normalizedQuery}%,album.ilike.%${normalizedQuery}%`)
      .limit(10);
    
    if (error) {
      console.error('Error searching tracks:', error);
      return mockTracks.filter(
        track => 
          track.title.toLowerCase().includes(normalizedQuery) ||
          track.artist.toLowerCase().includes(normalizedQuery) ||
          track.album.toLowerCase().includes(normalizedQuery)
      );
    }
    
    if (data && data.length > 0) {
      return data.map(transformMusicFileToTrack);
    } else {
      // If no results in DB, fall back to mock data
      return mockTracks.filter(
        track => 
          track.title.toLowerCase().includes(normalizedQuery) ||
          track.artist.toLowerCase().includes(normalizedQuery) ||
          track.album.toLowerCase().includes(normalizedQuery)
      );
    }
  } catch (error) {
    console.error('Error in searchTracks:', error);
    // Fall back to mock data filtering
    const normalizedQuery = query.toLowerCase();
    return mockTracks.filter(
      track => 
        track.title.toLowerCase().includes(normalizedQuery) ||
        track.artist.toLowerCase().includes(normalizedQuery) ||
        track.album.toLowerCase().includes(normalizedQuery)
    );
  }
};

// Mock data for initial testing
const mockTracks: Track[] = [
  {
    id: '1',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    duration: 200,
    cover: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=300&h=300',
    audioUrl: 'https://example.com/audio/blinding-lights.mp3',
    releaseDate: '2020-03-20',
    genre: 'Pop',
  },
  {
    id: '2',
    title: 'Save Your Tears',
    artist: 'The Weeknd',
    album: 'After Hours',
    duration: 215,
    cover: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=300&h=300',
    audioUrl: 'https://example.com/audio/save-your-tears.mp3',
    releaseDate: '2020-03-20',
    genre: 'Pop',
  },
  {
    id: '3',
    title: 'Starboy',
    artist: 'The Weeknd, Daft Punk',
    album: 'Starboy',
    duration: 230,
    cover: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=300&h=300',
    audioUrl: 'https://example.com/audio/starboy.mp3',
    releaseDate: '2016-11-25',
    genre: 'Pop',
  },
  {
    id: '4',
    title: 'Memories',
    artist: 'Maroon 5',
    album: 'Jordi',
    duration: 189,
    cover: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?auto=format&fit=crop&w=300&h=300',
    audioUrl: 'https://example.com/audio/memories.mp3',
    releaseDate: '2019-09-20',
    genre: 'Pop',
  },
  {
    id: '5',
    title: 'Bad Habits',
    artist: 'Ed Sheeran',
    album: '=',
    duration: 230,
    cover: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=300&h=300',
    audioUrl: 'https://example.com/audio/bad-habits.mp3',
    releaseDate: '2021-06-25',
    genre: 'Pop',
  },
  {
    id: '6',
    title: 'Stay',
    artist: 'The Kid LAROI, Justin Bieber',
    album: 'F*CK LOVE 3: OVER YOU',
    duration: 141,
    cover: 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?auto=format&fit=crop&w=300&h=300',
    audioUrl: 'https://example.com/audio/stay.mp3',
    releaseDate: '2021-07-09',
    genre: 'Pop',
  },
];

// Mock featured playlists
const mockPlaylists: Playlist[] = [
  {
    id: '1',
    title: 'Top Hits',
    description: 'The hottest tracks right now',
    cover: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=300&h=300',
    trackCount: 50,
    tracks: mockTracks.slice(0, 4),
  },
  {
    id: '2',
    title: 'Chill Vibes',
    description: 'Relax and unwind with these smooth tunes',
    cover: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?auto=format&fit=crop&w=300&h=300',
    trackCount: 40,
    tracks: mockTracks.slice(2, 5),
  },
  {
    id: '3',
    title: 'Workout Mix',
    description: 'Get pumped with high-energy tracks',
    cover: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=300&h=300',
    trackCount: 35,
    tracks: mockTracks.slice(1, 4),
  },
];

// Function to sync music from Backblaze to Supabase
const syncBackblazeToSupabase = async () => {
  try {
    console.log('Syncing Backblaze to Supabase...');
    
    // Use the Supabase client to invoke the function directly
    const { data, error } = await supabase.functions.invoke('sync-backblaze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (error) {
      throw new Error(`Error syncing music: ${error.message}`);
    }
    
    console.log('Sync result:', data);
    
    return data;
  } catch (error) {
    console.error('Error in syncBackblazeToSupabase:', error);
    throw error;
  }
};

export const musicService = {
  getMusicFromBackblaze,
  getFeaturedPlaylists,
  getTrendingTracks,
  getRecommendedTracks,
  searchTracks,
  syncBackblazeToSupabase,
};
