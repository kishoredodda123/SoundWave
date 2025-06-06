
import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Input } from '@/components/ui/input';
import TrackCard from '@/components/music/TrackCard';
import { Search as SearchIcon } from 'lucide-react';
import { musicService, Track } from '@/services/musicService';

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const results = await musicService.searchTracks(searchQuery);
        setSearchResults(results);
      } catch (error) {
        console.error('Error searching tracks:', error);
      } finally {
        setIsSearching(false);
      }
    };

    // Add debounce to avoid too many API calls
    const timer = setTimeout(() => {
      performSearch();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <MainLayout>
      <div className="px-4 md:px-6 py-4 md:py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Search</h1>
        
        <div className="relative mb-6 md:mb-8">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 md:h-5 md:w-5" />
          <Input
            type="text"
            placeholder="Search for songs, artists, or albums..."
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
              <div className="space-y-2 mb-8">
                {searchResults.map((track) => (
                  <TrackCard key={track.id} track={track} />
                ))}
              </div>
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
            <p className="text-base md:text-lg">Start typing to search for music</p>
            <p className="text-xs md:text-sm mt-2">Find your favorite songs, artists, and albums</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Search;
