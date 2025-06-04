
import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import MusicPlayer from '../player/MusicPlayer';
import { useMusicPlayerContext } from '@/contexts/MusicPlayerContext';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const musicPlayer = useMusicPlayerContext();

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-gradient-to-br from-music-secondary via-music-darkBg to-music-secondary">
      <div className="flex flex-1 overflow-hidden h-full">
        <Sidebar />
        <main className="flex-1 overflow-y-auto h-full w-full">
          <div className="h-full w-full pb-20 md:pb-32 pt-16 md:pt-0 px-0 md:px-8">
            <div className="max-w-7xl mx-auto w-full h-full">
              {children}
            </div>
          </div>
        </main>
      </div>
      <MusicPlayer 
        currentTrack={musicPlayer.currentTrack}
        isPlaying={musicPlayer.isPlaying}
        onPlayPause={musicPlayer.togglePlayPause}
        onNext={musicPlayer.playNext}
        onPrevious={musicPlayer.playPrevious}
      />
    </div>
  );
};

export default MainLayout;
