import { createBrowserRouter, RouterProvider, ScrollRestoration, Outlet, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { ContentTypeProvider } from '@/contexts/ContentTypeContext';
import { MusicPlayerProvider } from '@/contexts/MusicPlayerContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useContentType } from '@/contexts/ContentTypeContext';
import Index from '@/pages/Index';
import Movies from '@/pages/Movies';
import MovieDetail from '@/pages/MovieDetail';
import Search from '@/pages/Search';
import Login from '@/pages/Login';
import SignUp from '@/pages/SignUp';
import AdminLogin from '@/pages/AdminLogin';
import Admin from '@/pages/Admin';
import NotFound from '@/pages/NotFound';
import Download from '@/pages/Download';
import LikedSongs from '@/pages/LikedSongs';
import CreatePlaylist from '@/pages/CreatePlaylist';
import Library from '@/pages/Library';
import Albums from '@/pages/Albums';
import AlbumDetail from '@/pages/AlbumDetail';
import ProtectedRoute from '@/components/ProtectedRoute';

const queryClient = new QueryClient();

// AppRoutes component
function AppRoutes() {
  const { contentType } = useContentType();

  if (contentType === 'movies') {
    return (
      <Routes>
        <Route path="/" element={<Movies />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/movies/:movieId" element={<MovieDetail />} />
        <Route path="/movie/:movieId" element={<Navigate to="/movies/:movieId" replace />} />
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

// Root layout that includes providers
const RootLayout = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ContentTypeProvider>
            <MusicPlayerProvider>
              <ScrollRestoration 
                getKey={(location) => {
                  // For album details and movie details, use the full pathname
                  if (location.pathname.startsWith('/albums/') || location.pathname.startsWith('/movies/')) {
                    return location.pathname;
                  }
                  // For main pages (home, movies list, etc), maintain scroll position
                  return location.pathname;
                }}
              />
              <div className="h-full w-full bg-music-darkBg text-white">
                <Outlet />
                <Toaster position="bottom-right" />
              </div>
            </MusicPlayerProvider>
          </ContentTypeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

// Create router with the root layout
const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <AppRoutes />
      },
      {
        path: '*',
        element: <AppRoutes />
      }
    ]
  }
]);

function App() {
  return (
    <>
      <Toaster position="top-center" richColors />
      <RouterProvider router={router} />
    </>
  );
}

export default App;
