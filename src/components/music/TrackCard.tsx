
import { Play, Heart } from 'lucide-react';
import { Track } from '@/services/musicService';
import { useMusicPlayerContext } from '@/contexts/MusicPlayerContext';
import { musicService } from '@/services/musicService';
import { useState, useEffect } from 'react';

interface TrackCardProps {
  track: Track;
  playlist?: Track[];
}

const TrackCard = ({ track, playlist }: TrackCardProps) => {
  const { playTrack } = useMusicPlayerContext();
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    setIsLiked(musicService.isTrackLiked(track.id));
  }, [track.id]);

  // Format duration to MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handlePlay = () => {
    console.log('🎯 TrackCard handlePlay called for:', track.title);
    musicService.addToRecentlyPlayed(track);
    playTrack(track, playlist);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering play
    const newLikedStatus = musicService.toggleLikeTrack(track);
    setIsLiked(newLikedStatus);
  };

  return (
    <div 
      className="group flex items-center p-3 rounded-md hover:bg-music-hover transition-colors cursor-pointer"
      onClick={handlePlay}
    >
      <div className="relative flex-shrink-0 mr-4">
        <img 
          src={track.cover} 
          alt={track.title} 
          className="h-12 w-12 object-cover rounded shadow" 
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 rounded opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
          <Play className="h-6 w-6 text-white" />
        </div>
      </div>
      <div className="flex-grow min-w-0">
        <h3 className="text-sm font-medium text-white truncate">{track.title}</h3>
        <p className="text-xs text-gray-400 truncate">{track.artist}</p>
      </div>
      <div className="flex items-center gap-3 ml-4">
        <button
          onClick={handleLike}
          className={`p-1 rounded-full transition-colors ${
            isLiked 
              ? 'text-red-500 hover:text-red-400' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
        </button>
        <div className="text-xs text-gray-400">
          {formatDuration(track.duration)}
        </div>
      </div>
    </div>
  );
};

export default TrackCard;
