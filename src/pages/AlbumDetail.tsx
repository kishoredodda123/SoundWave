
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import TrackCard from '@/components/music/TrackCard';
import { Album, musicService } from '@/services/musicService';
import { useMusicPlayerContext } from '@/contexts/MusicPlayerContext';

const AlbumDetail = () => {
  const { albumId } = useParams<{ albumId: string }>();
  const navigate = useNavigate();
  const [album, setAlbum] = useState<Album | null>(null);
  const { playTrack } = useMusicPlayerContext();

  useEffect(() => {
    if (albumId) {
      const foundAlbum = musicService.getAlbums().find(a => a.id === albumId);
      setAlbum(foundAlbum || null);
    }
  }, [albumId]);

  const handlePlayAll = () => {
    if (album && album.tracks.length > 0) {
      playTrack(album.tracks[0], album.tracks);
    }
  };

  if (!album) {
    return (
      <MainLayout>
        <div className="px-6 py-8">
          <p className="text-gray-400">Album not found.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="px-6 py-8">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </button>

        {/* Album Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end gap-6 mb-8">
          <img 
            src={album.cover} 
            alt={album.title}
            className="w-48 h-48 object-cover rounded-lg shadow-xl"
          />
          <div className="flex-1">
            <p className="text-sm text-gray-400 uppercase tracking-wider mb-2">Album</p>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">{album.title}</h1>
            <div className="flex items-center text-gray-300">
              <span className="text-sm">{album.trackCount} songs</span>
              <span className="mx-2">•</span>
              <span className="text-sm">{album.releaseDate}</span>
            </div>
          </div>
        </div>

        {/* Play Button */}
        {album.tracks.length > 0 && (
          <div className="mb-6">
            <button
              onClick={handlePlayAll}
              className="bg-music-primary text-black rounded-full p-4 hover:scale-105 transition-transform shadow-lg"
            >
              <Play className="h-6 w-6" />
            </button>
          </div>
        )}

        {/* Tracks List */}
        <div className="space-y-1">
          {album.tracks.length > 0 ? (
            album.tracks.map((track, index) => (
              <div key={track.id} className="flex items-center">
                <div className="w-8 text-center text-gray-400 text-sm mr-4">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <TrackCard 
                    track={track} 
                    playlist={album.tracks}
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400">No tracks in this album yet.</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default AlbumDetail;
