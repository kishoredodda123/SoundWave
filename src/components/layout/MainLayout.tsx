import { ReactNode } from 'react';
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
  return <div className="flex flex-col h-full w-full overflow-hidden bg-gradient-to-br from-music-secondary via-music-darkBg to-music-secondary">
      <div className="flex flex-1 overflow-hidden w-full">
        <Sidebar />
        <main className="flex-1 overflow-y-auto pb-24 md:pb-32 pt-4 md:pt-6 px-4 w-full md:px-0 py-[2px]">
          <div className="max-w-7xl mx-auto w-full h-full">
            {children}
          </div>
        </main>
      </div>
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <MusicPlayer currentTrack={musicPlayer.currentTrack} isPlaying={musicPlayer.isPlaying} onPlayPause={musicPlayer.togglePlayPause} onNext={musicPlayer.playNext} onPrevious={musicPlayer.playPrevious} />
      </div>
    </div>;
};
export default MainLayout;