
import MainLayout from '@/components/layout/MainLayout';
import FeaturedSection from '@/components/sections/FeaturedSection';
import TrendingSection from '@/components/sections/TrendingSection';
import TrackCarousel from '@/components/ui/track-carousel';
import { useState, useEffect } from 'react';
import { musicService, Track, Album } from '@/services/musicService';
import AlbumCard from '@/components/music/AlbumCard';
import { Link, useNavigate } from 'react-router-dom';
import { useMusicPlayerContext } from '@/contexts/MusicPlayerContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { recentlyPlayed } = useMusicPlayerContext();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentAlbumSlide, setCurrentAlbumSlide] = useState(0);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const albumsData = await musicService.getAlbums();
        setAlbums(albumsData);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load content. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleAlbumClick = (albumId: string) => {
    navigate(`/albums/${albumId}`);
  };

  // Album carousel logic - 4 for mobile, 6 for desktop
  const albumsPerSlide = isMobile ? 4 : 6;
  const totalAlbumSlides = Math.ceil(albums.length / albumsPerSlide);
  
  const nextAlbumSlide = () => {
    setCurrentAlbumSlide((prev) => (prev + 1) % totalAlbumSlides);
  };

  const prevAlbumSlide = () => {
    setCurrentAlbumSlide((prev) => (prev - 1 + totalAlbumSlides) % totalAlbumSlides);
  };

  const getCurrentAlbums = () => {
    const start = currentAlbumSlide * albumsPerSlide;
    const end = start + albumsPerSlide;
    return albums.slice(start, end);
  };

  return (
    <MainLayout>
      <div className="flex flex-col min-h-full">
        {/* Main Content Container */}
        <div className="flex-1 space-y-6 sm:space-y-8 md:space-y-10">
          {/* Hero Section */}
          <div className="bg-gradient-to-b from-music-primary/20 to-transparent rounded-xl">
            <div className="px-4 sm:px-6 py-6 sm:py-8 md:p-8">
              <h1 className="text-2xl md:text-4xl font-bold mb-2">Welcome to SoundWave</h1>
              <p className="text-gray-300 mb-4 md:mb-6 text-sm md:text-base">Discover and enjoy your favorite music</p>
              <button className="bg-music-primary text-black font-medium px-4 md:px-6 py-2 md:py-3 rounded-full hover:bg-music-highlight transition-colors text-sm md:text-base">
                Explore Now
              </button>
            </div>
          </div>

          {/* Featured Albums */}
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-music-primary"></div>
            </div>
          ) : (
            albums.length > 0 && (
              <section className="px-4 sm:px-6 md:px-0">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl md:text-2xl font-bold">Featured Albums</h2>
                  <div className="flex items-center gap-2">
                    {totalAlbumSlides > 1 && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={prevAlbumSlide}
                          className="h-8 w-8 p-0"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={nextAlbumSlide}
                          className="h-8 w-8 p-0"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    <Link to="/albums" className="text-sm text-music-primary hover:underline">View All</Link>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-6">
                    {getCurrentAlbums().map(album => (
                      <AlbumCard key={album.id} album={album} onClick={() => handleAlbumClick(album.id)} />
                    ))}
                  </div>
                  
                  {/* Slide indicators */}
                  {totalAlbumSlides > 1 && (
                    <div className="flex justify-center mt-4 gap-2">
                      {Array.from({ length: totalAlbumSlides }, (_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentAlbumSlide(index)}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            index === currentAlbumSlide ? 'bg-music-primary' : 'bg-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )
          )}

          {/* Featured Section */}
          <section className="px-4 sm:px-6 md:px-0">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl md:text-2xl font-bold">Featured Playlists</h2>
              <button className="text-sm text-music-primary hover:underline">View All</button>
            </div>
            <FeaturedSection />
          </section>
          
          {/* Trending Section */}
          <section className="px-4 sm:px-6 md:px-0">
            <TrendingSection />
          </section>
        </div>
        
        {/* Recently Played */}
        <section className="mb-8">
          {recentlyPlayed.length > 0 ? (
            <TrackCarousel tracks={recentlyPlayed} title="Recently Played" />
          ) : (
            <div>
              <h2 className="text-xl md:text-2xl font-bold mb-4">Recently Played</h2>
              <div className="text-center py-6 md:py-8">
                <p className="text-gray-400 text-sm md:text-base">
                  No recently played songs. Start listening to see your history here!
                </p>
              </div>
            </div>
          )}
        </section>
      </div>

      {error && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-music-cardBg p-6 rounded-lg text-center max-w-sm mx-4">
            <p className="text-red-500 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-music-primary text-black font-medium px-6 py-3 rounded-full hover:bg-music-highlight transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default Index;
