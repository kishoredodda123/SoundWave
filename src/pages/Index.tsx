
import MainLayout from '@/components/layout/MainLayout';
import FeaturedSection from '@/components/sections/FeaturedSection';
import TrendingSection from '@/components/sections/TrendingSection';
import { useState, useEffect } from 'react';
import { musicService, Track, Album } from '@/services/musicService';
import TrackCard from '@/components/music/TrackCard';
import AlbumCard from '@/components/music/AlbumCard';
import { Link } from 'react-router-dom';

const Index = () => {
  const [recentlyPlayed, setRecentlyPlayed] = useState<Track[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);

  useEffect(() => {
    setRecentlyPlayed(musicService.getRecentlyPlayed());
    setAlbums(musicService.getAlbums().slice(0, 6)); // Show up to 6 albums
  }, []);

  return (
    <MainLayout>
      <div className="px-6 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-music-primary/20 to-transparent p-8 rounded-xl mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome to SoundWave</h1>
          <p className="text-gray-300 mb-6">Discover and enjoy your favorite music</p>
          <button className="bg-music-primary text-black font-medium px-6 py-3 rounded-full hover:bg-music-highlight transition-colors">
            Explore Now
          </button>
        </div>

        {/* Featured Albums */}
        {albums.length > 0 && (
          <section className="mb-10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Featured Albums</h2>
              <Link to="/albums" className="text-sm text-music-primary hover:underline">View All</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {albums.map((album) => (
                <AlbumCard 
                  key={album.id} 
                  album={album}
                  onClick={() => window.location.href = `/albums/${album.id}`}
                />
              ))}
            </div>
          </section>
        )}

        {/* Featured Section */}
        <section className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Featured Playlists</h2>
            <button className="text-sm text-music-primary hover:underline">View All</button>
          </div>
          <FeaturedSection />
        </section>
        
        {/* Trending Section */}
        <section className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Trending Now</h2>
            <button className="text-sm text-music-primary hover:underline">View All</button>
          </div>
          <TrendingSection />
        </section>
        
        {/* Recently Played */}
        <section className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Recently Played</h2>
            <button className="text-sm text-music-primary hover:underline">View All</button>
          </div>
          {recentlyPlayed.length > 0 ? (
            <div className="space-y-1">
              {recentlyPlayed.map((track) => (
                <TrackCard 
                  key={track.id} 
                  track={track} 
                  playlist={recentlyPlayed}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">No recently played songs. Start listening to see your history here!</p>
            </div>
          )}
        </section>
      </div>
    </MainLayout>
  );
};

export default Index;
