import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { MusicPlayerProvider } from '@/contexts/MusicPlayerContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { ContentTypeProvider, useContentType } from '@/contexts/ContentTypeContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import ErrorBoundary from '@/components/ErrorBoundary';
import Index from '@/pages/Index';
import Search from '@/pages/Search';
import LikedSongs from '@/pages/LikedSongs';
import CreatePlaylist from '@/pages/CreatePlaylist';
import Library from '@/pages/Library';
import Albums from '@/pages/Albums';
import AlbumDetail from '@/pages/AlbumDetail';
import Movies from '@/pages/Movies';
import MovieDetail from '@/pages/MovieDetail';
import Admin from '@/pages/Admin';
import AdminLogin from '@/pages/AdminLogin';
import Login from '@/pages/Login';
import SignUp from '@/pages/SignUp';
import NotFound from '@/pages/NotFound';
import Download from '@/pages/Download';
import './App.css';

const queryClient = new QueryClient();

function AppRoutes() {
  const { contentType } = useContentType();

  if (contentType === 'movies') {
    return (
      <Routes>
        <Route path="/" element={<Movies />} />
        <Route path="/movie/:movieId" element={<MovieDetail />} />
        <Route path="/search" element={<Search />} />
        <Route path="/recent" element={<Movies />} />
        <Route path="/download" element={<Download />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
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
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/search" element={<Search />} />
      <Route path="/liked-songs" element={<LikedSongs />} />
      <Route path="/create-playlist" element={<CreatePlaylist />} />
      <Route path="/library" element={<Library />} />
      <Route path="/albums" element={<Albums />} />
      <Route path="/albums/:albumId" element={<AlbumDetail />} />
      <Route path="/download" element={<Download />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
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
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ContentTypeProvider>
            <MusicPlayerProvider>
              <Router>
                <div className="h-full w-full bg-music-darkBg text-white overflow-hidden">
                  <AppRoutes />
                <Toaster />
              </div>
            </Router>
          </MusicPlayerProvider>
          </ContentTypeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
