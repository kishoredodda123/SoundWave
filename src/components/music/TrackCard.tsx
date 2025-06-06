
import { Play, Heart } from 'lucide-react';
import { Track } from '@/services/musicService';
import { useMusicPlayerContext } from '@/contexts/MusicPlayerContext';
import { musicService } from '@/services/musicService';
import { useState, useEffect, useRef } from 'react';

interface TrackCardProps {
  track: Track;
  playlist?: Track[];
  index?: number;
  onClick?: () => void;
}

const TrackCard = ({ track, playlist, index, onClick }: TrackCardProps) => {
  const { playTrack } = useMusicPlayerContext();
  const [isLiked, setIsLiked] = useState(false);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [actualDuration, setActualDuration] = useState<number>(track.duration || 0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const checkLikeStatus = async () => {
      try {
        const liked = await musicService.isTrackLiked(track.id);
        setIsLiked(liked);
      } catch (error) {
        console.error('Error checking like status:', error);
      }
    };

    checkLikeStatus();
  }, [track.id]);

  // Load audio metadata to get duration
  useEffect(() => {
    if (track.audioUrl && !track.duration) {
      const audio = new Audio();
      audio.src = track.audioUrl;
      
      const handleLoadedMetadata = () => {
        if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
          setActualDuration(audio.duration);
        }
      };

      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.load();

      return () => {
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    }
  }, [track.audioUrl, track.duration]);

  // Format duration to MM:SS
  const formatDuration = (seconds: number) => {
    if (!seconds || seconds === 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handlePlay = () => {
    if (onClick) {
      onClick();
    } else {
      console.log('🎯 TrackCard handlePlay called for:', track.title);
      musicService.addToRecentlyPlayed(track);
      playTrack(track, playlist);
    }
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering play
    if (isLikeLoading) return;

    setIsLikeLoading(true);
    try {
      const newLikedStatus = await musicService.toggleLikeTrack(track);
      setIsLiked(newLikedStatus);
    } catch (error) {
      console.error('Error toggling like status:', error);
    } finally {
      setIsLikeLoading(false);
    }
  };

  return (
    <div 
      className="group flex items-center p-3 rounded-md hover:bg-music-hover transition-colors cursor-pointer"
      onClick={handlePlay}
    >
      {index !== undefined && (
        <div className="w-8 text-center text-gray-400 text-sm mr-4">
          {index}
        </div>
      )}
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
          disabled={isLikeLoading}
          className={`p-1 rounded-full transition-colors ${
            isLiked 
              ? 'text-red-500 hover:text-red-400' 
              : 'text-gray-400 hover:text-white'
          } ${isLikeLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
        </button>
        <div className="text-xs text-gray-400">
          {formatDuration(actualDuration)}
        </div>
      </div>
    </div>
  );
};

export default TrackCard;
