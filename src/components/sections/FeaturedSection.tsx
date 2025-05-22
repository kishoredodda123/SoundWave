
import { useEffect, useState } from 'react';
import { Playlist } from '@/services/musicService';
import { musicService } from '@/services/musicService';
import PlaylistCard from '@/components/music/PlaylistCard';

const FeaturedSection = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const data = await musicService.getFeaturedPlaylists();
        setPlaylists(data);
      } catch (error) {
        console.error('Error fetching featured playlists:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPlaylists();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-music-hover rounded-md aspect-square mb-3"></div>
            <div className="bg-music-hover h-5 rounded w-3/4 mb-2"></div>
            <div className="bg-music-hover h-4 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
        {playlists.map((playlist) => (
          <PlaylistCard key={playlist.id} playlist={playlist} />
        ))}
      </div>
    </div>
  );
};

export default FeaturedSection;
