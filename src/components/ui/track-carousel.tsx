
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Track } from '@/services/musicService';
import TrackCard from '@/components/music/TrackCard';

interface TrackCarouselProps {
  tracks: Track[];
  title: string;
}

const TrackCarousel = ({ tracks, title }: TrackCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 3;
  const totalPages = Math.ceil(tracks.length / itemsPerPage);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalPages);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const getCurrentTracks = () => {
    const start = currentIndex * itemsPerPage;
    const end = start + itemsPerPage;
    return tracks.slice(start, end);
  };

  if (tracks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">No {title.toLowerCase()} available.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{title}</h2>
        {totalPages > 1 && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={prevSlide}
              disabled={tracks.length <= itemsPerPage}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={nextSlide}
              disabled={tracks.length <= itemsPerPage}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-1">
        {getCurrentTracks().map((track) => (
          <TrackCard 
            key={track.id} 
            track={track} 
            playlist={tracks}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-4 gap-2">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-music-primary' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TrackCarousel;
