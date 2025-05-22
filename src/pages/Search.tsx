
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
      <div className="px-6 py-8">
        <h1 className="text-3xl font-bold mb-6">Search</h1>
        
        <div className="relative mb-8">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search for songs, artists, or albums..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-music-cardBg border-gray-700 text-white placeholder:text-gray-400 focus:ring-music-primary focus:border-music-primary rounded-full py-6"
          />
        </div>
        
        {searchQuery.trim().length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">
              {isSearching ? 'Searching...' : `Results for "${searchQuery}"`}
            </h2>
            
            {isSearching ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="animate-pulse flex items-center p-3">
                    <div className="bg-music-hover h-12 w-12 rounded mr-4"></div>
                    <div className="flex-1">
                      <div className="bg-music-hover h-4 w-3/4 rounded mb-2"></div>
                      <div className="bg-music-hover h-3 w-1/2 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-2">
                {searchResults.map((track) => (
                  <TrackCard key={track.id} track={track} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <SearchIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No results found for "{searchQuery}"</p>
                <p className="text-sm mt-2">Try searching for something else</p>
              </div>
            )}
          </div>
        )}
        
        {searchQuery.trim().length === 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Browse Categories</h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {['Pop', 'Rock', 'Hip Hop', 'R&B', 'Electronic', 'Classical', 'Jazz', 'Country', 'Metal', 'Indie', 'Folk', 'Reggae'].map((genre) => (
                <div 
                  key={genre}
                  className="relative overflow-hidden rounded-md aspect-square cursor-pointer transform transition-transform hover:scale-105"
                  style={{ 
                    background: `linear-gradient(45deg, ${getRandomColor()}, ${getRandomColor()})`,
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <h3 className="text-white font-bold text-lg">{genre}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

// Helper function to generate random colors for genre cards
const getRandomColor = () => {
  const colors = [
    '#1DB954', '#FF5500', '#1E3264', '#7D4698', '#E8115B', 
    '#148A08', '#BC5900', '#8D67AB', '#B49BC8', '#509BF5'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

export default Search;
