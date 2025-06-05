
import { useEffect, useState } from 'react';
import { Playlist } from '@/services/musicService';
import { musicService } from '@/services/musicService';
import PlaylistCard from '@/components/music/PlaylistCard';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

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

  if (playlists.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">No featured playlists available.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {playlists.map((playlist) => (
            <CarouselItem key={playlist.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
              <PlaylistCard playlist={playlist} />
            </CarouselItem>
          ))}
        </CarouselContent>
        {playlists.length > 4 && (
          <>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </>
        )}
      </Carousel>
    </div>
  );
};

export default FeaturedSection;
