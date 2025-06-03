
import { useEffect, useState } from 'react';
import { Track } from '@/services/musicService';
import { musicService } from '@/services/musicService';
import TrackCarousel from '@/components/ui/track-carousel';

const TrendingSection = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const data = await musicService.getTrendingTracks();
        setTracks(data);
        console.log('🔥 TrendingSection loaded tracks:', data.length);
      } catch (error) {
        console.error('Error fetching trending tracks:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTracks();
  }, []);

  if (loading) {
    return (
      <div className="space-y-3 mt-4">
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
    );
  }

  return <TrackCarousel tracks={tracks} title="Trending Now" />;
};

export default TrendingSection;
