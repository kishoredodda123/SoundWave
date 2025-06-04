import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { MusicPlayerProvider } from '@/contexts/MusicPlayerContext';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Index from '@/pages/Index';
import Search from '@/pages/Search';
import LikedSongs from '@/pages/LikedSongs';
import CreatePlaylist from '@/pages/CreatePlaylist';
import Library from '@/pages/Library';
import Albums from '@/pages/Albums';
import AlbumDetail from '@/pages/AlbumDetail';
import Admin from '@/pages/Admin';
import AdminLogin from '@/pages/AdminLogin';
import NotFound from '@/pages/NotFound';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
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
                <Route path="/admin-login" element={<AdminLogin />} />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <Admin />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
            </div>
          </Router>
        </MusicPlayerProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
