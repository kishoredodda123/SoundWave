
import { useState, useEffect } from 'react';
import { Album as AlbumIcon } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import AlbumCard from '@/components/music/AlbumCard';
import { Album, musicService } from '@/services/musicService';
import { useNavigate } from 'react-router-dom';

const Albums = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    setAlbums(musicService.getAlbums());
  }, []);

  const handleAlbumClick = (albumId: string) => {
    navigate(`/albums/${albumId}`);
  };

  return (
    <MainLayout>
      <div className="px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex items-center">
            <div className="bg-music-primary p-4 rounded-lg mr-4">
              <AlbumIcon className="h-8 w-8 text-black" />
            </div>
            <h1 className="text-3xl font-bold">Your Albums</h1>
          </div>
        </div>
        
        {albums.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-8">
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
