import { useState, useEffect } from 'react';
import { Album as AlbumIcon, Loader2 } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import AlbumCard from '@/components/music/AlbumCard';
import { Album, musicService } from '@/services/musicService';
import { useNavigate } from 'react-router-dom';
import { toast } from "@/components/ui/use-toast";

const Albums = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadAlbums = async () => {
      try {
        const fetchedAlbums = await musicService.getAlbums();
        setAlbums(fetchedAlbums);
      } catch (error) {
        console.error('Error loading albums:', error);
        toast({
          title: "Error",
          description: "Failed to load albums. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadAlbums();
  }, []);

  const handleAlbumClick = (albumId: string) => {
    navigate(`/albums/${albumId}`);
  };

  return (
    <MainLayout>
      <div className="px-2 md:px-4 py-4 md:py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex items-center">
            <div className="bg-music-primary p-4 rounded-lg mr-4">
              <AlbumIcon className="h-8 w-8 text-black" />
            </div>
            <h1 className="text-3xl font-bold">Your Albums</h1>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-music-primary" />
          </div>
        ) : albums.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 mt-6">
            {albums.map((album) => (
              <AlbumCard 
                key={album.id} 
                album={album}
                onClick={() => handleAlbumClick(album.id)}
              />
            ))}
          </div>
        ) : (
          <div className="mt-8">
            <p className="text-gray-400">No albums created yet. Create your first album in the Admin page!</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Albums;
