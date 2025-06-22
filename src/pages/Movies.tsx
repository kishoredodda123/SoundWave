import { useEffect, useState, useRef, useLayoutEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { MovieCard } from '@/components/movies/MovieCard';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { getMovies, type Movie } from '@/services/movieService';

// Featured movies: latest 4 by year (or id if year is missing)
const getFeaturedMovies = (movies: Movie[]) => {
  return [...movies]
    .sort((a, b) => (b.year || '').localeCompare(a.year || ''))
    .slice(0, 4);
};

const SCROLL_POSITION_KEY = 'movies_scroll_position';

export default function Movies() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Save scroll position on navigation away
  useEffect(() => {
    const saveScroll = () => {
      sessionStorage.setItem(SCROLL_POSITION_KEY, window.scrollY.toString());
    };
    window.addEventListener('beforeunload', saveScroll);
    return () => {
      saveScroll();
      window.removeEventListener('beforeunload', saveScroll);
    };
  }, []);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const data = await getMovies();
        setMovies(data);
      } catch (err) {
        setError('Failed to fetch movies. Please try again later.');
        console.error('Error fetching movies:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovies();
  }, []);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-[500px] bg-gray-700 rounded-3xl" />
            <div className="space-y-4">
              <div className="h-8 bg-gray-700 w-32 rounded" />
              <div className="grid grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-64 bg-gray-700 rounded-lg" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-red-500">{error}</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div ref={containerRef} className="container mx-auto px-2 sm:px-4 py-6 sm:py-8 space-y-8 sm:space-y-12">
        {/* Hero Section */}
        <section className="relative h-[220px] sm:h-[350px] md:h-[500px] rounded-2xl sm:rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent z-10" />
          {movies.length > 0 && (
            <img 
              src={movies[0].poster_url} 
              alt={movies[0].title} 
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          <div className="relative z-20 h-full flex flex-col justify-end p-4 sm:p-8 max-w-full sm:max-w-2xl">
            <h1 className="text-2xl sm:text-5xl font-bold mb-2 sm:mb-4">Featured Movies</h1>
            <p className="text-sm sm:text-lg text-gray-300 mb-2 sm:mb-6">
              Discover the latest and greatest movies on SoundWave
            </p>
          </div>
        </section>

        {/* Featured Movies Carousel */}
        {movies.length > 0 && (
          <section className="space-y-2 sm:space-y-4">
            <h2 className="text-lg sm:text-2xl font-semibold">Featured</h2>
            <ScrollArea className="w-full whitespace-nowrap rounded-lg">
              <div className="flex w-full gap-3 sm:gap-4 pb-2 sm:pb-4">
                {getFeaturedMovies(movies).map((movie) => (
                  <div key={movie.id} className="w-[160px] sm:w-[300px] flex-none">
                    <MovieCard {...movie} />
                  </div>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </section>
        )}

        {/* All Movies */}
        <section className="space-y-4 sm:space-y-6">
          <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight">All Movies</h2>
          {movies.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No movies available.</p>
          ) : (
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4 md:gap-6">
              {movies.map((movie) => (
                <MovieCard key={movie.id} {...movie} />
              ))}
            </div>
          )}
        </section>
      </div>
    </MainLayout>
  );
} 