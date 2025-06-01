
import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import TrackCard from '@/components/music/TrackCard';
import { Track, musicService } from '@/services/musicService';
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

const LikedSongs = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const data = await musicService.getMusicFromBackblaze();
        setTracks(data);
        console.log('❤️ LikedSongs loaded tracks:', data.length);
      } catch (error) {
        console.error('Error fetching music:', error);
        toast({
          title: "Error",
          description: "Failed to load music tracks.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchTracks();
  }, []);

  const handleSyncMusic = async () => {
    try {
      setLoading(true);
      const result = await musicService.syncBackblazeToSupabase();
      
      if (result.success) {
        toast({
          title: "Sync Complete",
          description: `Added ${result.added || 0} new tracks, updated ${result.updated || 0} existing tracks.`,
        });
        
        // Refresh the track list
        const data = await musicService.getMusicFromBackblaze();
        setTracks(data);
      } else {
        throw new Error(result.error || "Unknown error during sync");
      }
    } catch (error) {
      console.error('Error syncing music files:', error);
      toast({
        title: "Sync Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
          <div className="mt-4 sm:mt-0">
            <Button
              onClick={handleSyncMusic}
              disabled={loading}
              className="bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? "Loading..." : "Sync Music"}
            </Button>
          </div>
        </div>
        
        {loading ? (
          <div className="space-y-3 mt-8">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="animate-pulse flex items-center p-3">
                <div className="bg-music-hover h-12 w-12 rounded mr-4"></div>
                <div className="flex-1">
                  <div className="bg-music-hover h-4 w-3/4 rounded mb-2"></div>
                  <div className="bg-music-hover h-3 w-1/2 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : tracks.length > 0 ? (
          <div className="mt-8 space-y-1">
            {tracks.map((track) => (
              <TrackCard 
                key={track.id} 
                track={track} 
                playlist={tracks}
              />
            ))}
          </div>
        ) : (
          <div className="mt-8">
            <p className="text-gray-400">No music files found. Click the "Sync Music" button to import your files from Backblaze.</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default LikedSongs;
