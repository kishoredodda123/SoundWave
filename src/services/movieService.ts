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

export const getMovies = async (): Promise<Movie[]> => {
  const { data, error } = await supabase
    .from('movies')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching movies:', error);
    throw error;
  }

  return data || [];
};

export const getMovieById = async (id: string): Promise<Movie | null> => {
  const { data, error } = await supabase
    .from('movies')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching movie:', error);
    throw error;
  }

  return data;
}; 