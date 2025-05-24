
import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import MusicPlayer from '../player/MusicPlayer';
import { useMusicPlayer } from '@/hooks/useMusicPlayer';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const musicPlayer = useMusicPlayer();

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gradient-to-br from-music-secondary via-music-darkBg to-music-secondary">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto pb-24 md:pb-32 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Pass the music player context to children */}
            <div style={{ ['--music-player' as any]: musicPlayer }}>
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
