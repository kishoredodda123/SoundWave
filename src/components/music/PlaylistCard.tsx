
import { Playlist } from '@/services/musicService';

interface PlaylistCardProps {
  playlist: Playlist;
  onClick?: () => void;
}

const PlaylistCard = ({
  playlist,
  onClick
}: PlaylistCardProps) => {
  return (
    <div 
      className="group flex flex-col p-4 rounded-md bg-music-cardBg hover:bg-music-hover transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="aspect-square bg-music-hover rounded-md mb-3 flex items-center justify-center">
        {playlist.cover ? (
          <img 
            src={playlist.cover} 
            alt={playlist.title}
            className="w-full h-full object-cover rounded-md"
          />
        ) : (
          <div className="w-16 h-16 bg-music-primary/20 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-music-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
        )}
      </div>
      <h3 className="font-medium text-white mb-1 truncate">{playlist.title}</h3>
      <p className="text-xs text-gray-400 truncate">{playlist.description}</p>
    </div>
  );
};

export default PlaylistCard;
