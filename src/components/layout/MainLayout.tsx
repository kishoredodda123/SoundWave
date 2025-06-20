import { ReactNode, useEffect, useRef, useState } from 'react';
import Sidebar from './Sidebar';
import MusicPlayer from '../player/MusicPlayer';
import { useMusicPlayerContext } from '@/contexts/MusicPlayerContext';
import { useContentType } from '@/contexts/ContentTypeContext';
import { cn } from '@/lib/utils';
import { Menu } from 'lucide-react';
import { ContentToggle } from '@/components/ui/content-toggle';
import { useLocation } from 'react-router-dom';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({
  children
}: MainLayoutProps) => {
  const musicPlayer = useMusicPlayerContext();
  const { contentType } = useContentType();
  const mainRef = useRef<HTMLElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!mainRef.current) return;
      
      const scrollAmount = 100;
      
      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          mainRef.current.scrollBy({ top: -scrollAmount, behavior: 'smooth' });
          break;
        case 'ArrowDown':
          event.preventDefault();
          mainRef.current.scrollBy({ top: scrollAmount, behavior: 'smooth' });
          break;
        case 'PageUp':
          event.preventDefault();
          mainRef.current.scrollBy({ top: -400, behavior: 'smooth' });
          break;
        case 'PageDown':
          event.preventDefault();
          mainRef.current.scrollBy({ top: 400, behavior: 'smooth' });
          break;
      }
    };

    // Add event listener to the main element
    const mainElement = mainRef.current;
    if (mainElement) {
      mainElement.addEventListener('keydown', handleKeyDown);
      // Auto-focus the main element for TV navigation
      mainElement.focus();
    }

    return () => {
      if (mainElement) {
        mainElement.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, []);
  
  // Close sidebar on route change (optional, for better UX)
  useEffect(() => {
    setSidebarOpen(false);
  }, [contentType]);
  
  return (
    <div className={cn(
      "flex flex-col h-screen w-screen overflow-hidden bg-gradient-to-br",
      contentType === 'music' 
        ? "from-music-secondary via-music-darkBg to-music-secondary"
        : "from-red-900 via-slate-900 to-red-900"
    )}>
      <div className="flex flex-1 overflow-hidden relative">
        {/* Hamburger for mobile */}
        <button
          className="absolute top-4 left-4 z-40 md:hidden flex items-center justify-center w-10 h-10 rounded-full bg-card/80 backdrop-blur shadow-lg"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open sidebar"
        >
          <Menu className="w-6 h-6 text-white" />
        </button>
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main 
          ref={mainRef}
          className="flex-1 overflow-y-auto pb-[280px] sm:pb-[240px] md:pb-32 pt-4 md:pt-6 px-4 md:px-6 focus:outline-none" 
          tabIndex={0}
          role="main"
          aria-label="Main content area"
        >
          <div className="max-w-[1800px] mx-auto w-full h-full relative">
            {location.pathname === '/' && <ContentToggle />}
            {children}
          </div>
        </main>
      </div>
      {contentType === 'music' && (
      <div className="fixed bottom-0 left-0 right-0 z-50 w-full">
        <MusicPlayer 
          currentTrack={musicPlayer.currentTrack} 
          isPlaying={musicPlayer.isPlaying} 
          onPlayPause={musicPlayer.togglePlayPause} 
          onNext={musicPlayer.playNext} 
          onPrevious={musicPlayer.playPrevious} 
        />
      </div>
      )}
    </div>
  );
};

export default MainLayout;
