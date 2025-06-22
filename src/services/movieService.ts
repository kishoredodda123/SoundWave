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
const MOVIE_CACHE_EXPIRY = 1000 * 60 * 60; // 1 hour

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

export const getMovies = async (): Promise<Movie[]> => {
  // Try to get from cache first
  const cached = getFromCache(MOVIES_CACHE_KEY);
  if (cached) return cached;

  const { data, error } = await supabase
    .from('movies')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching movies:', error);
    throw error;
  }

  // Cache the results
  if (data) {
    setInCache(MOVIES_CACHE_KEY, data);
  }

  return data || [];
};

export const getMovieById = async (id: string): Promise<Movie | null> => {
  // Try to get from cache first
  const cacheKey = `${MOVIES_CACHE_KEY}_${id}`;
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  const { data, error } = await supabase
    .from('movies')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching movie:', error);
    throw error;
  }

  // Cache the results
  if (data) {
    setInCache(cacheKey, data);
  }

  return data;
}; 