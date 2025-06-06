
import { ReactNode, useEffect, useRef } from 'react';
import Sidebar from './Sidebar';
import MusicPlayer from '../player/MusicPlayer';
import { useMusicPlayerContext } from '@/contexts/MusicPlayerContext';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({
  children
}: MainLayoutProps) => {
  const musicPlayer = useMusicPlayerContext();
  const mainRef = useRef<HTMLElement>(null);
  
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
  
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-gradient-to-br from-music-secondary via-music-darkBg to-music-secondary">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main 
          ref={mainRef}
          className="flex-1 overflow-y-auto pb-[280px] sm:pb-[240px] md:pb-32 pt-4 md:pt-6 px-4 md:px-6 focus:outline-none" 
          tabIndex={0}
          role="main"
          aria-label="Main content area"
        >
          <div className="max-w-[1800px] mx-auto w-full h-full relative">
            {children}
          </div>
        </main>
      </div>
      <div className="fixed bottom-0 left-0 right-0 z-50 w-full">
        <MusicPlayer 
          currentTrack={musicPlayer.currentTrack} 
          isPlaying={musicPlayer.isPlaying} 
          onPlayPause={musicPlayer.togglePlayPause} 
          onNext={musicPlayer.playNext} 
          onPrevious={musicPlayer.playPrevious} 
        />
      </div>
    </div>
  );
};

export default MainLayout;
