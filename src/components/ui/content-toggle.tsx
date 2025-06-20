import { useContentType } from "@/contexts/ContentTypeContext";
import { Music, Film } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function ContentToggle() {
  const { contentType, setContentType } = useContentType();
  const navigate = useNavigate();

  const handleSwitch = (type: 'music' | 'movies') => {
    setContentType(type);
    if (type === 'music') {
      navigate('/');
    } else {
      navigate('/'); // Movies home is also '/'; AppRoutes will render Movies
    }
  };

  return (
    <div className="w-full flex justify-center mt-3 select-none">
      <div className="inline-flex rounded-full bg-background/90 backdrop-blur shadow-lg border border-white/10 overflow-hidden transition-all">
        <button
          className={`flex items-center gap-1 px-3 py-1.5 md:px-4 md:py-2 font-semibold text-sm md:text-base transition-all duration-200
            ${contentType === 'music'
              ? 'bg-music-primary/95 text-black shadow-md scale-105'
              : 'bg-transparent text-white/80 hover:bg-white/10'}
            focus:outline-none`}
          style={{ borderRight: '1px solid rgba(255,255,255,0.08)' }}
          onClick={() => handleSwitch('music')}
          aria-label="Switch to Music"
        >
          <Music className="w-4 h-4 md:w-5 md:h-5" />
          <span className="hidden sm:inline">Music</span>
        </button>
        <button
          className={`flex items-center gap-1 px-3 py-1.5 md:px-4 md:py-2 font-semibold text-sm md:text-base transition-all duration-200
            ${contentType === 'movies'
              ? 'bg-red-600/90 text-white shadow-md scale-105'
              : 'bg-transparent text-white/80 hover:bg-white/10'}
            focus:outline-none`}
          onClick={() => handleSwitch('movies')}
          aria-label="Switch to Movies"
        >
          <Film className="w-4 h-4 md:w-5 md:h-5" />
          <span className="hidden sm:inline">Movies</span>
        </button>
      </div>
    </div>
  );
} 