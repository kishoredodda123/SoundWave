
import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import MusicPlayer from '../player/MusicPlayer';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-music-darkBg">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto pb-24 md:pb-32">
          {children}
        </main>
      </div>
      <MusicPlayer />
    </div>
  );
};

export default MainLayout;
