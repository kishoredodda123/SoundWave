
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

// This would be integrated with your Backblaze service
const getMusicFromBackblaze = async (): Promise<Track[]> => {
  // This is where you'd fetch from Backblaze
  // For now, return mock data
  console.log('Getting music from Backblaze (mock)');
  return mockTracks;
};

// Function to get featured playlists
const getFeaturedPlaylists = async (): Promise<Playlist[]> => {
  // This would fetch from your backend/storage in the future
  return mockPlaylists;
};

// Function to get trending tracks
const getTrendingTracks = async (): Promise<Track[]> => {
  // This would be based on some algorithm/data in the future
  return mockTracks.slice(0, 5);
};

// Function to get recommended tracks based on user preferences
const getRecommendedTracks = async (): Promise<Track[]> => {
  // This would be personalized in the future
  return mockTracks.slice(3, 6);
};

// Function to search for tracks
const searchTracks = async (query: string): Promise<Track[]> => {
  if (!query) return [];
  
  const normalizedQuery = query.toLowerCase();
  return mockTracks.filter(
    track => 
      track.title.toLowerCase().includes(normalizedQuery) ||
      track.artist.toLowerCase().includes(normalizedQuery) ||
      track.album.toLowerCase().includes(normalizedQuery)
  );
};

export const musicService = {
  getMusicFromBackblaze,
  getFeaturedPlaylists,
  getTrendingTracks,
  getRecommendedTracks,
  searchTracks,
};
