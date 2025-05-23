
import { useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Volume1, VolumeX } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [currentTime, setCurrentTime] = useState(0);
  const duration = 263; // In seconds (4:23)

  // For demo purposes - show equalizer when playing
  const [activeTrack, setActiveTrack] = useState({
    title: 'Starboy',
    artist: 'The Weeknd, Daft Punk',
    album: 'Starboy',
    cover: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=150&h=150',
  });

  // Format time in MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Update time indicator for demo
  useEffect(() => {
    let interval: number | undefined;
    
    if (isPlaying) {
      interval = window.setInterval(() => {
        setCurrentTime((prevTime) => {
          if (prevTime >= duration) {
            setIsPlaying(false);
            return 0;
          }
          return prevTime + 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, duration]);

  // Volume icon based on level
  const VolumeIcon = volume === 0 ? VolumeX : volume < 50 ? Volume1 : Volume2;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-music-cardBg border-t border-gray-800 px-4 py-3">
      <div className="flex flex-col md:flex-row items-center">
        {/* Track Info - Mobile: Top, Desktop: Left */}
        <div className="flex items-center w-full md:w-1/4 mb-3 md:mb-0">
          <img 
            src={activeTrack.cover}
            alt={`${activeTrack.title} album art`}
            className="h-12 w-12 object-cover rounded mr-3"
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-white truncate">{activeTrack.title}</h4>
            <p className="text-xs text-gray-400 truncate">{activeTrack.artist}</p>
          </div>
        </div>
        
        {/* Player Controls - Mobile: Middle, Desktop: Center */}
        <div className="flex flex-col w-full md:w-1/2 md:px-4">
          <div className="flex justify-center items-center space-x-4 mb-3">
            <button className="text-gray-400 hover:text-white">
              <SkipBack className="h-5 w-5" />
            </button>
            <button 
              className="bg-red-600 rounded-full p-2 text-white hover:scale-105 transition"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </button>
            <button className="text-gray-400 hover:text-white">
              <SkipForward className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex items-center space-x-3 text-xs text-gray-400">
            <span>{formatTime(currentTime)}</span>
            <div className="flex-1">
              <Slider 
                value={[currentTime]} 
                max={duration}
                step={1}
                onValueChange={(values) => setCurrentTime(values[0])}
                className="cursor-pointer"
              />
            </div>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
        
        {/* Volume Control - Mobile: Bottom, Desktop: Right */}
        <div className="flex items-center justify-end w-full md:w-1/4 mt-3 md:mt-0">
          <VolumeIcon className="h-5 w-5 text-gray-400 mr-2" />
          <div className="w-24">
            <Slider 
              value={[volume]} 
              max={100}
              step={1}
              onValueChange={(values) => setVolume(values[0])}
              className="cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
