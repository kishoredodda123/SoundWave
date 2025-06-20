import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Input } from '@/components/ui/input';
import TrackCard from '@/components/music/TrackCard';
import { MovieCard } from '@/components/movies/MovieCard';
import { Search as SearchIcon } from 'lucide-react';
import { musicService, Track } from '@/services/musicService';
import { useContentType } from '@/contexts/ContentTypeContext';
import { supabase } from '@/integrations/supabase/client';
import type { Movie } from '@/services/movieService';

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<(Track | Movie)[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { contentType } = useContentType();

  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        if (contentType === 'music') {
          const results = await musicService.searchTracks(searchQuery);
          setSearchResults(results);
        } else {
          // Search movies
          const { data, error } = await supabase
            .from('movies')
            .select('*')
            .ilike('title', `%${searchQuery}%`)
            .order('created_at', { ascending: false });

          if (error) throw error;
          setSearchResults(data || []);
        }
      } catch (error) {
        console.error('Error searching:', error);
      } finally {
        setIsSearching(false);
      }
    };

    // Add debounce to avoid too many API calls
    const timer = setTimeout(() => {
      performSearch();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, contentType]);

  const placeholder = contentType === 'music' 
    ? "Search for songs, artists, or albums..."
    : "Search for movies by title...";

  return (
    <MainLayout>
      <div className="px-4 md:px-6 py-4 md:py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Search</h1>
        
        <div className="relative mb-6 md:mb-8">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 md:h-5 md:w-5" />
          <Input
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-music-cardBg border-gray-700 text-white placeholder:text-gray-400 focus:ring-music-primary focus:border-music-primary rounded-full py-4 md:py-6 text-sm md:text-base"
          />
        </div>
        
        {searchQuery.trim().length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg md:text-xl font-semibold mb-4">
              {isSearching ? 'Searching...' : `Results for "${searchQuery}"`}
            </h2>
            
            {isSearching ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="animate-pulse flex items-center p-3">
                    <div className="bg-music-hover h-10 w-10 md:h-12 md:w-12 rounded mr-3 md:mr-4"></div>
                    <div className="flex-1">
                      <div className="bg-music-hover h-3 md:h-4 w-3/4 rounded mb-2"></div>
                      <div className="bg-music-hover h-2 md:h-3 w-1/2 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : searchResults.length > 0 ? (
              contentType === 'music' ? (
                <div className="space-y-2 mb-8">
                  {searchResults.map((result) => (
                    <TrackCard key={result.id} track={result as Track} />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4 md:gap-6">
                  {searchResults.map((result) => (
                    <MovieCard key={result.id} {...result as Movie} />
                  ))}
                </div>
              )
            ) : (
              <div className="text-center py-8 md:py-12 text-gray-400 mb-8">
                <SearchIcon className="h-8 w-8 md:h-12 md:w-12 mx-auto mb-4 opacity-50" />
                <p className="text-base md:text-lg">No results found for "{searchQuery}"</p>
                <p className="text-xs md:text-sm mt-2">Try searching for something else</p>
              </div>
            )}
          </div>
        )}
        
        {searchQuery.trim().length === 0 && (
          <div className="text-center py-8 md:py-12 text-gray-400 mb-8">
            <SearchIcon className="h-8 w-8 md:h-12 md:w-12 mx-auto mb-4 opacity-50" />
            <p className="text-base md:text-lg">
              {contentType === 'music' 
                ? "Start typing to search for music"
                : "Start typing to search for movies"
              }
            </p>
            <p className="text-xs md:text-sm mt-2">
              {contentType === 'music'
                ? "Find your favorite songs, artists, and albums"
                : "Find your favorite movies by title"
              }
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Search;
