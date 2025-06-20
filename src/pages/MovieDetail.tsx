import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Star, Clock, Calendar, User2, ArrowLeft, Check } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { VideoPlayer } from '@/components/player/VideoPlayer';
import { getMovieById, type Movie } from '@/services/movieService';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function MovieDetail() {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuality, setSelectedQuality] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);

  useEffect(() => {
    const fetchMovie = async () => {
      if (!movieId) return;
      try {
        const data = await getMovieById(movieId);
        if (data) {
          // Ensure video_qualities exists
          const movieWithQualities = {
            ...data,
            video_qualities: data.video_qualities || [{
              quality: 'Default',
              url: data.stream_url
            }]
          };
          setMovie(movieWithQualities);
          // Set default quality
          setSelectedQuality(movieWithQualities.video_qualities[0].quality);
        }
      } catch (err) {
        console.error('Error fetching movie:', err);
        setError('Failed to load movie details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovie();
  }, [movieId]);

  const handleVideoError = (error: any) => {
    console.error('Video playback error:', error);
    setError('Failed to play video. Please try again later.');
  };

  const getSelectedQualityUrl = () => {
    if (!movie || !selectedQuality) return '';
    const quality = movie.video_qualities.find(q => q.quality === selectedQuality);
    return quality?.url || movie.stream_url;
  };

  const handleQualitySelect = (quality: string) => {
    setSelectedQuality(quality);
    setShowPlayer(true);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-[500px] bg-gray-700 rounded-3xl" />
            <div className="space-y-4">
              <div className="h-8 bg-gray-700 w-64 rounded" />
              <div className="h-4 bg-gray-700 w-32 rounded" />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !movie) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-red-500">{error || 'Movie not found'}</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-2 sm:px-4 py-6 sm:py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 items-start">
          {/* Left Column - Poster */}
          <div className="w-full lg:w-[320px] space-y-4 lg:sticky lg:top-8">
            <div className="rounded-lg overflow-hidden shadow-2xl ring-1 ring-white/20">
              <img
                src={movie.poster_url}
                alt={movie.title}
                className="w-full h-auto"
              />
            </div>
            <Dialog open={showPlayer} onOpenChange={setShowPlayer}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    size="lg" 
                    className="w-full gap-2 bg-white hover:bg-white/90 text-black font-semibold shadow-lg shadow-black/20"
                  >
                    <Play className="h-4 w-4" fill="black" />
                    Watch Now
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-[200px]">
                  {movie.video_qualities.map((quality) => (
                    <DropdownMenuItem
                      key={quality.quality}
                      className="flex items-center justify-between"
                      onClick={() => handleQualitySelect(quality.quality)}
                    >
                      <span>{quality.quality}</span>
                      {selectedQuality === quality.quality && (
                        <Check className="h-4 w-4" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <DialogContent 
                className="max-w-6xl w-[98vw] sm:w-[95vw] h-[60vh] sm:h-[90vh] p-0"
                aria-describedby="video-player-desc"
              >
                <div id="video-player-desc" className="sr-only">
                  Video player for {movie.title} in {selectedQuality}
                </div>
                <VideoPlayer 
                  url={getSelectedQualityUrl()} 
                  onError={handleVideoError} 
                />
              </DialogContent>
            </Dialog>
          </div>

          {/* Right Column - Details */}
          <div className="flex-1 w-full">
            {/* Title Section */}
            <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
                {movie.title}
              </h1>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-gray-300 text-xs sm:text-sm">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <span>{movie.year}</span>
                </div>
                {movie.duration && (
                  <>
                    <Separator orientation="vertical" className="h-4 bg-gray-600" />
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      <span>{movie.duration}</span>
                    </div>
                  </>
                )}
                {movie.rating && (
                  <>
                    <Separator orientation="vertical" className="h-4 bg-gray-600" />
                    <div className="flex items-center gap-1.5 text-amber-400">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="font-semibold">{movie.rating}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Genre Tags */}
            <div className="mb-4 sm:mb-6">
              <div className="flex flex-wrap gap-2">
                <Badge 
                  className="px-2.5 py-1 text-xs font-medium bg-white/10 hover:bg-white/20 text-white border-none"
                >
                  {movie.genre}
                </Badge>
                <Badge 
                  variant="outline" 
                  className="px-2.5 py-1 text-xs font-medium border-white/20 text-gray-300"
                >
                  {movie.language}
                </Badge>
              </div>
            </div>

            {/* Synopsis */}
            <div className="mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-white">Synopsis</h2>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                {movie.synopsis}
              </p>
            </div>

            {/* Cast & Crew */}
            <div className="space-y-4 sm:space-y-6">
              {movie.cast && movie.cast.length > 0 && (
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-white">Cast</h2>
                  <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                    {movie.cast.map((actor: string) => (
                      <div 
                        key={actor}
                        className={cn(
                          "flex items-center gap-2 sm:gap-3 p-2 rounded-lg sm:p-2.5",
                          "bg-white/5 hover:bg-white/10 transition-colors ring-1 ring-white/10"
                        )}
                      >
                        <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                          <User2 className="h-4 w-4 text-gray-300" />
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-gray-200">{actor}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {movie.director && (
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-white">Director</h2>
                  <div className={cn(
                    "flex items-center gap-2 sm:gap-3 p-2 rounded-lg sm:p-2.5 w-fit",
                    "bg-white/5 hover:bg-white/10 transition-colors ring-1 ring-white/10"
                  )}>
                    <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                      <User2 className="h-4 w-4 text-gray-300" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-gray-200">{movie.director}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 