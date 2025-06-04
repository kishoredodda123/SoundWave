
import MainLayout from '@/components/layout/MainLayout';
import FeaturedSection from '@/components/sections/FeaturedSection';
import TrendingSection from '@/components/sections/TrendingSection';
import TrackCarousel from '@/components/ui/track-carousel';
import { useState, useEffect } from 'react';
import { musicService, Track, Album } from '@/services/musicService';
import AlbumCard from '@/components/music/AlbumCard';
import { Link, useNavigate } from 'react-router-dom';

const Index = () => {
  const [recentlyPlayed, setRecentlyPlayed] = useState<Track[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    setRecentlyPlayed(musicService.getRecentlyPlayed());
    setAlbums(musicService.getAlbums().slice(0, 6)); // Show up to 6 albums
  }, []);

  const handleAlbumClick = (albumId: string) => {
    navigate(`/albums/${albumId}`);
  };

  return (
    <MainLayout>
      <div className="px-0 md:px-2 py-4 md:py-6 w-full h-full">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-music-primary/20 to-transparent p-4 md:p-8 rounded-xl mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold mb-2">Welcome to SoundWave</h1>
          <p className="text-gray-300 mb-4 md:mb-6 text-sm md:text-base">Discover and enjoy your favorite music</p>
          <button className="bg-music-primary text-black font-medium px-4 md:px-6 py-2 md:py-3 rounded-full hover:bg-music-highlight transition-colors text-sm md:text-base">
            Explore Now
          </button>
        </div>

        {/* Featured Albums */}
        {albums.length > 0 && (
          <section className="mb-8 md:mb-10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl md:text-2xl font-bold">Featured Albums</h2>
              <Link to="/albums" className="text-sm text-music-primary hover:underline">View All</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-6">
              {albums.map((album) => (
                <AlbumCard 
                  key={album.id} 
                  album={album}
                  onClick={() => handleAlbumClick(album.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Featured Section */}
        <section className="mb-8 md:mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl md:text-2xl font-bold">Featured Playlists</h2>
            <button className="text-sm text-music-primary hover:underline">View All</button>
          </div>
          <FeaturedSection />
        </section>
        
        {/* Trending Section */}
        <section className="mb-8 md:mb-10">
          <TrendingSection />
        </section>
        
        {/* Recently Played */}
        <section className="mb-8 md:mb-10">
          {recentlyPlayed.length > 0 ? (
            <TrackCarousel tracks={recentlyPlayed} title="Recently Played" />
          ) : (
            <div>
              <h2 className="text-xl md:text-2xl font-bold mb-4">Recently Played</h2>
              <div className="text-center py-6 md:py-8">
                <p className="text-gray-400 text-sm md:text-base">No recently played songs. Start listening to see your history here!</p>
              </div>
            </div>
          )}
        </section>
      </div>
    </MainLayout>
  );
};

export default Index;
