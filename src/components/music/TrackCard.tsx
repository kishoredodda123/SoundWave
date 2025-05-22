
import { Play } from 'lucide-react';
import { Track } from '@/services/musicService';

interface TrackCardProps {
  track: Track;
  onPlay?: () => void;
}

const TrackCard = ({ track, onPlay }: TrackCardProps) => {
  // Format duration to MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div 
      className="group flex items-center p-3 rounded-md hover:bg-music-hover transition-colors cursor-pointer"
      onClick={onPlay}
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
      <div className="text-xs text-gray-400 ml-4">
        {formatDuration(track.duration)}
      </div>
    </div>
  );
};

export default TrackCard;
