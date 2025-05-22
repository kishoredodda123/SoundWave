
import { Album } from '@/services/musicService';

interface AlbumCardProps {
  album: Album;
  onClick?: () => void;
}

const AlbumCard = ({ album, onClick }: AlbumCardProps) => {
  return (
    <div 
      className="group flex flex-col p-4 rounded-md bg-music-cardBg hover:bg-music-hover transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="relative mb-4">
        <img 
          src={album.cover} 
          alt={album.title} 
          className="album-artwork w-full aspect-square object-cover rounded-md shadow-lg" 
        />
        <div className="absolute bottom-2 right-2 w-10 h-10 bg-music-primary rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform group-hover:translate-y-0 translate-y-2 transition-all duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
      <h3 className="font-medium text-white mb-1 truncate">{album.title}</h3>
      <p className="text-sm text-gray-400 truncate">{album.artist}</p>
      <p className="text-xs text-gray-500 mt-1">{album.trackCount} songs</p>
    </div>
  );
};

export default AlbumCard;
