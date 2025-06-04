import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Loader2 } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import TrackCard from '@/components/music/TrackCard';
import { Album, musicService } from '@/services/musicService';
import { useMusicPlayerContext } from '@/contexts/MusicPlayerContext';
import { cn } from '@/lib/utils';
import { toast } from "@/components/ui/use-toast";

const AlbumDetail = () => {
  const { albumId } = useParams<{ albumId: string }>();
  const navigate = useNavigate();
  const [album, setAlbum] = useState<Album | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { playTrack } = useMusicPlayerContext();
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadAlbum = async () => {
      if (albumId) {
        try {
          const albums = await musicService.getAlbums();
          const foundAlbum = albums.find(a => a.id === albumId);
          setAlbum(foundAlbum || null);
          
          if (!foundAlbum) {
            toast({
              title: "Error",
              description: "Album not found.",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error('Error loading album:', error);
          toast({
            title: "Error",
            description: "Failed to load album. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadAlbum();
  }, [albumId]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    setScrolled(scrollTop > 20);
  };

  const handlePlayAll = () => {
    if (album && album.tracks.length > 0) {
      playTrack(album.tracks[0], album.tracks);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <Loader2 className="h-8 w-8 animate-spin text-music-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!album) {
    return (
      <MainLayout>
        <div className="px-4 md:px-6 py-6 md:py-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-400 hover:text-white mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </button>
          <p className="text-gray-400">Album not found.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div 
        className="h-full overflow-y-auto" 
        onScroll={handleScroll}
      >
        <div 
          ref={headerRef}
          className={cn(
            "sticky top-0 z-10 px-4 md:px-6 py-4 transition-colors duration-200",
            scrolled && "bg-background/80 backdrop-blur-sm"
          )}
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </button>
        </div>

        <div className="px-4 md:px-6">
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <img 
              src={album.cover} 
              alt={album.title}
              className="w-48 h-48 object-cover rounded-lg shadow-lg"
            />
            <div className="flex flex-col justify-end">
              <h1 className="text-4xl font-bold mb-2">{album.title}</h1>
              <p className="text-gray-400 mb-4">
                {album.trackCount} {album.trackCount === 1 ? 'track' : 'tracks'} • {album.artist}
              </p>
              {album.tracks.length > 0 && (
                <button
                  onClick={handlePlayAll}
                  className="flex items-center justify-center w-12 h-12 rounded-full bg-music-primary text-black hover:bg-music-highlight transition-colors"
                >
                  <Play className="h-6 w-6" />
                </button>
              )}
            </div>
          </div>

          <div className="mb-[160px] sm:mb-[140px] md:mb-32">
            <div className="space-y-2">
              {album.tracks.map((track, index) => (
                <TrackCard
                  key={track.id}
                  track={track}
                  index={index + 1}
                  onClick={() => playTrack(track, album.tracks)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AlbumDetail;
