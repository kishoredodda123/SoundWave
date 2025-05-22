
import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PlaylistCard from '@/components/music/PlaylistCard';
import { musicService, Playlist } from '@/services/musicService';

const Library = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  
  // For demo purposes, we're using mock data
  useState(() => {
    const loadPlaylists = async () => {
      const data = await musicService.getFeaturedPlaylists();
      setPlaylists(data);
    };
    
    loadPlaylists();
  });

  return (
    <MainLayout>
      <div className="px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h1 className="text-3xl font-bold">Your Library</h1>
          
          <div className="mt-4 sm:mt-0 flex space-x-2">
            <button className="px-4 py-2 bg-music-cardBg hover:bg-music-hover text-sm font-medium rounded-full transition-colors">
              Recent
            </button>
            <button className="px-4 py-2 bg-music-cardBg hover:bg-music-hover text-sm font-medium rounded-full transition-colors">
              Added by you
            </button>
            <button className="px-4 py-2 bg-music-cardBg hover:bg-music-hover text-sm font-medium rounded-full transition-colors">
              Alphabetical
            </button>
          </div>
        </div>
        
        <Tabs defaultValue="playlists" className="w-full">
          <TabsList className="grid w-full grid-cols-4 max-w-md mb-8 bg-music-cardBg">
            <TabsTrigger value="playlists" className="data-[state=active]:bg-music-primary data-[state=active]:text-black">
              Playlists
            </TabsTrigger>
            <TabsTrigger value="podcasts" className="data-[state=active]:bg-music-primary data-[state=active]:text-black">
              Podcasts
            </TabsTrigger>
            <TabsTrigger value="artists" className="data-[state=active]:bg-music-primary data-[state=active]:text-black">
              Artists
            </TabsTrigger>
            <TabsTrigger value="albums" className="data-[state=active]:bg-music-primary data-[state=active]:text-black">
              Albums
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="playlists" className="mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {/* Create Playlist Card */}
              <div className="group flex flex-col p-4 rounded-md bg-music-hover/30 hover:bg-music-hover transition-all cursor-pointer border border-dashed border-gray-600 items-center justify-center aspect-square">
                <div className="w-16 h-16 bg-music-primary/20 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-music-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="font-medium text-white mb-1">Create Playlist</h3>
                <p className="text-xs text-gray-400 text-center">Add your favorite songs</p>
              </div>
              
              {/* Liked Songs Playlist */}
              <div className="group flex flex-col p-4 rounded-md bg-gradient-to-br from-indigo-800 to-indigo-500 hover:from-indigo-700 hover:to-indigo-400 transition-all cursor-pointer">
                <div className="mb-4 flex-1 flex items-end">
                  <div className="w-full">
                    <h3 className="font-bold text-white text-xl mb-1">Liked Songs</h3>
                    <p className="text-sm text-gray-200">238 songs</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* Display User Playlists */}
              {playlists.map((playlist) => (
                <PlaylistCard key={playlist.id} playlist={playlist} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="podcasts" className="mt-0">
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-2">No podcasts found</h3>
              <p className="text-gray-400">You haven't subscribed to any podcasts yet.</p>
              <button className="mt-6 px-6 py-3 bg-music-primary text-black font-medium rounded-full hover:bg-music-highlight transition-colors">
                Browse Podcasts
              </button>
            </div>
          </TabsContent>
          
          <TabsContent value="artists" className="mt-0">
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-2">No followed artists</h3>
              <p className="text-gray-400">You haven't followed any artists yet.</p>
              <button className="mt-6 px-6 py-3 bg-music-primary text-black font-medium rounded-full hover:bg-music-highlight transition-colors">
                Browse Artists
              </button>
            </div>
          </TabsContent>
          
          <TabsContent value="albums" className="mt-0">
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-2">No saved albums</h3>
              <p className="text-gray-400">You haven't saved any albums yet.</p>
              <button className="mt-6 px-6 py-3 bg-music-primary text-black font-medium rounded-full hover:bg-music-highlight transition-colors">
                Browse Albums
              </button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Library;
