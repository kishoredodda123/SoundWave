
import { useEffect, useState } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import TrackCard from '@/components/music/TrackCard';
import { Track, musicService } from '@/services/musicService';
import { toast } from "@/components/ui/use-toast";

const LikedSongs = () => {
  const [likedTracks, setLikedTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLikedSongs = async () => {
      try {
        const liked = await musicService.getLikedSongs();
        setLikedTracks(liked);
      } catch (error) {
        console.error('Error loading liked songs:', error);
        toast({
          title: "Error",
          description: "Failed to load liked songs. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadLikedSongs();
    
    // Refresh liked songs every time the page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadLikedSongs();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <MainLayout>
      <div className="px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex items-center">
            <div className="bg-red-600 p-4 rounded-lg mr-4">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold">Liked Songs</h1>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-music-primary" />
          </div>
        ) : likedTracks.length > 0 ? (
          <div className="mt-8 space-y-1 mb-8">
            {likedTracks.map((track) => (
              <TrackCard 
                key={track.id} 
                track={track} 
                playlist={likedTracks}
              />
            ))}
          </div>
        ) : (
          <div className="mt-8 mb-8">
            <p className="text-gray-400">No liked songs yet. Start liking songs by clicking the heart icon!</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default LikedSongs;
