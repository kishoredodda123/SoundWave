import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Star, Clock, Calendar, User2, ArrowLeft, Check } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { VideoPlayer } from '@/components/player/VideoPlayer';
import { getMovieById, getMovies, type Movie } from '@/services/movieService';
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

const MOVIES_CACHE_KEY = 'soundwave_movies_cache';
const CURRENT_MOVIE_KEY = 'soundwave_current_movie';

export default function MovieDetail() {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuality, setSelectedQuality] = useState<string | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const fetchMovie = async () => {
      if (!movieId) {
        setError('Invalid movie ID');
        setIsLoading(false);
        return;
      }

      try {
        // First try to load from current movie cache
        const cachedCurrentMovie = localStorage.getItem(CURRENT_MOVIE_KEY);
        if (cachedCurrentMovie) {
          const parsed = JSON.parse(cachedCurrentMovie);
          if (parsed.id === movieId) {
            setMovie(parsed);
            setSelectedQuality(parsed.video_qualities?.[0]?.quality || 'Default');
            setIsLoading(false);
            return;
          }
        }

        // Try to get from API
        const data = await getMovieById(movieId);
        if (data) {
          const movieWithQualities = {
            ...data,
            video_qualities: data.video_qualities || [{
              quality: 'Default',
              url: data.stream_url
            }]
          };
          setMovie(movieWithQualities);
          setSelectedQuality(movieWithQualities.video_qualities[0].quality);
          // Cache the current movie
          localStorage.setItem(CURRENT_MOVIE_KEY, JSON.stringify(movieWithQualities));
          setIsLoading(false);
          return;
        }

        // If API fails, try to get from movies list cache
        const cachedMovies = localStorage.getItem(MOVIES_CACHE_KEY);
        if (cachedMovies) {
          const movies = JSON.parse(cachedMovies);
          const cachedMovie = movies.find((m: Movie) => m.id === movieId);
          if (cachedMovie) {
            const movieWithQualities = {
              ...cachedMovie,
              video_qualities: cachedMovie.video_qualities || [{
                quality: 'Default',
                url: cachedMovie.stream_url
              }]
            };
            setMovie(movieWithQualities);
            setSelectedQuality(movieWithQualities.video_qualities[0].quality);
            // Cache the current movie
            localStorage.setItem(CURRENT_MOVIE_KEY, JSON.stringify(movieWithQualities));
            setIsLoading(false);
            return;
          }
        }

        // If still not found, try to fetch all movies
        const allMovies = await getMovies();
        const foundMovie = allMovies.find(m => m.id === movieId);
        if (foundMovie) {
          const movieWithQualities = {
            ...foundMovie,
            video_qualities: foundMovie.video_qualities || [{
              quality: 'Default',
              url: foundMovie.stream_url
            }]
          };
          setMovie(movieWithQualities);
          setSelectedQuality(movieWithQualities.video_qualities[0].quality);
          // Cache the current movie and all movies
          localStorage.setItem(CURRENT_MOVIE_KEY, JSON.stringify(movieWithQualities));
          localStorage.setItem(MOVIES_CACHE_KEY, JSON.stringify(allMovies));
          setIsLoading(false);
          return;
        }

        setError('Movie not found');
      } catch (err) {
        console.error('Error fetching movie:', err);
        setError('Failed to load movie details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovie();
  }, [movieId]);

  useEffect(() => {
    setIsMobile(window.innerWidth <= 768);
  }, []);

  const handleVideoError = (error: any) => {
    console.error('Video playback error:', error);
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

  const handleClosePlayer = () => {
    setShowPlayer(false);
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
          <div className="flex flex-col items-center justify-center space-y-4">
            <h1 className="text-2xl font-bold text-red-500">Movie not found</h1>
            <p className="text-gray-400">The movie you're looking for might have been removed or is temporarily unavailable.</p>
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="mt-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Movies
            </Button>
          </div>
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
            <Dialog open={showPlayer} onOpenChange={handleClosePlayer}>
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
                className="p-0 sm:max-w-[90vw] sm:max-h-[100vh] sm:w-[1080px] sm:h-auto sm:rounded-xl w-screen h-screen rounded-none"
                aria-describedby="video-player-desc"
              >
                <div id="video-player-desc" className="sr-only">
                  Video player for {movie.title} in {selectedQuality}
                </div>
                <VideoPlayer 
                  url={getSelectedQualityUrl()} 
                  onError={handleVideoError}
                  title={movie.title}
                  autoPlay
                  autoFullscreen={isMobile}
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