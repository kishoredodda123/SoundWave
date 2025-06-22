import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Star, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Movie } from '@/services/movieService';

type MovieCardProps = Movie & {
  className?: string;
};

export function MovieCard(props: MovieCardProps) {
  const navigate = useNavigate();
  const { id, title, year, poster_url, genre, rating, className } = props;
  return (
    <div
      onClick={() => navigate(`/movies/${id}`, { state: props })}
      style={{ cursor: 'pointer' }}
    >
      <Card className={cn(
        "group cursor-pointer overflow-hidden transition-all hover:scale-105 bg-card/50 backdrop-blur-sm",
        className
      )}>
        <CardContent className="p-0">
          <div className="relative aspect-[2/3] overflow-hidden">
            <img 
              src={poster_url || "/placeholder.svg"} 
              alt={title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Hover Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button size="lg" variant="secondary" className="rounded-full">
                <Play className="h-6 w-6 text-white" />
              </Button>
            </div>

            {/* Movie Info */}
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {rating && (
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-sm font-medium">{rating}</span>
                    </div>
                  )}
                  {genre && (
                    <span className="text-xs px-2 py-1 rounded-full bg-white/20 backdrop-blur-sm">
                      {genre}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-semibold line-clamp-2">{title}</h3>
                <p className="text-sm text-gray-300">{year}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 