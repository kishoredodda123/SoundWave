import { supabase } from '@/integrations/supabase/client';

export interface Movie {
  id: string;
  title: string;
  year: string;
  poster_url: string;
  genre: string;
  rating: number;
  duration: string;
  language: string;
  synopsis: string;
  cast: string[];
  director: string;
  stream_url: string;
  video_qualities: {
    quality: string;
    url: string;
  }[];
  created_at: string;
}

const MOVIES_CACHE_KEY = 'soundwave_movies_cache';
const MOVIE_CACHE_EXPIRY = 1000 * 60 * 1; // 5 minutes

interface CachedData {
  timestamp: number;
  data: any;
}

const getFromCache = (key: string) => {
  const cached = localStorage.getItem(key);
  if (!cached) return null;

  const { timestamp, data }: CachedData = JSON.parse(cached);
  if (Date.now() - timestamp > MOVIE_CACHE_EXPIRY) {
    localStorage.removeItem(key);
    return null;
  }

  return data;
};

const setInCache = (key: string, data: any) => {
  const cacheData: CachedData = {
    timestamp: Date.now(),
    data
  };
  localStorage.setItem(key, JSON.stringify(cacheData));
};

const clearMovieCache = (movieId?: string) => {
  if (movieId) {
    localStorage.removeItem(`${MOVIES_CACHE_KEY}_${movieId}`);
  }
  localStorage.removeItem(MOVIES_CACHE_KEY);
};

export const getMovies = async (skipCache = false): Promise<Movie[]> => {
  // Try to get from cache first
  if (!skipCache) {
    const cached = getFromCache(MOVIES_CACHE_KEY);
    if (cached) return cached;
  }

  const { data, error } = await supabase
    .from('movies')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching movies:', error);
    throw error;
  }

  // Ensure each movie has video_qualities array
  const moviesWithQualities = data?.map(movie => ({
    ...movie,
    video_qualities: movie.video_qualities || [{
      quality: 'Default',
      url: movie.stream_url
    }]
  })) || [];

  // Cache the results
  if (moviesWithQualities.length > 0) {
    setInCache(MOVIES_CACHE_KEY, moviesWithQualities);
  }

  return moviesWithQualities;
};

export const getMovieById = async (id: string, skipCache = false): Promise<Movie | null> => {
  // Try to get from cache first
  if (!skipCache) {
    const cacheKey = `${MOVIES_CACHE_KEY}_${id}`;
    const cached = getFromCache(cacheKey);
    if (cached) return cached;
  }

  const { data, error } = await supabase
    .from('movies')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching movie:', error);
    throw error;
  }

  if (!data) return null;

  // Ensure movie has video_qualities array
  const movieWithQualities = {
    ...data,
    video_qualities: data.video_qualities || [{
      quality: 'Default',
      url: data.stream_url
    }]
  };

  // Cache the results
  setInCache(`${MOVIES_CACHE_KEY}_${id}`, movieWithQualities);

  return movieWithQualities;
};

export const updateMovieQualities = async (
  movieId: string,
  qualities: { quality: string; url: string; }[]
): Promise<Movie | null> => {
  try {
    const { data, error } = await supabase
      .from('movies')
      .update({
        video_qualities: qualities,
        stream_url: qualities[0]?.url || '' // Update stream_url with the first quality URL
      })
      .eq('id', movieId)
      .select()
      .single();

    if (error) {
      console.error('Error updating movie qualities:', error);
      throw error;
    }

    if (!data) return null;

    // Clear cache to ensure fresh data
    clearMovieCache(movieId);

    // Return updated movie with qualities
    const movieWithQualities = {
      ...data,
      video_qualities: data.video_qualities || [{
        quality: 'Default',
        url: data.stream_url
      }]
    };

    return movieWithQualities;
  } catch (error) {
    console.error('Error in updateMovieQualities:', error);
    throw error;
  }
}; 