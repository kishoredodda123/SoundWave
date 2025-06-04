
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { MusicPlayerProvider } from '@/contexts/MusicPlayerContext';
import Index from '@/pages/Index';
import Search from '@/pages/Search';
import LikedSongs from '@/pages/LikedSongs';
import CreatePlaylist from '@/pages/CreatePlaylist';
import Library from '@/pages/Library';
import Albums from '@/pages/Albums';
import AlbumDetail from '@/pages/AlbumDetail';
import Admin from '@/pages/Admin';
import NotFound from '@/pages/NotFound';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MusicPlayerProvider>
        <Router>
          <div className="h-full w-full bg-music-darkBg text-white overflow-hidden">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/search" element={<Search />} />
              <Route path="/liked-songs" element={<LikedSongs />} />
              <Route path="/create-playlist" element={<CreatePlaylist />} />
              <Route path="/library" element={<Library />} />
              <Route path="/albums" element={<Albums />} />
              <Route path="/albums/:albumId" element={<AlbumDetail />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </div>
        </Router>
      </MusicPlayerProvider>
    </QueryClientProvider>
  );
}

export default App;
