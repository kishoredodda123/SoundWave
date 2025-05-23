
import MainLayout from '@/components/layout/MainLayout';
import { PlusCircle } from 'lucide-react';

const CreatePlaylist = () => {
  return (
    <MainLayout>
      <div className="px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex items-center">
            <div className="bg-red-600 p-4 rounded-lg mr-4">
              <PlusCircle className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold">Create Playlist</h1>
          </div>
        </div>
        <div className="mt-8 max-w-2xl">
          <p className="text-gray-400 mb-6">Create a new playlist to organize your favorite songs.</p>
          
          <div className="glass-card p-6 rounded-lg">
            <form className="space-y-4">
              <div>
                <label htmlFor="playlist-name" className="block text-sm font-medium mb-1">Playlist Name</label>
                <input 
                  id="playlist-name"
                  type="text" 
                  className="w-full px-4 py-2 rounded bg-music-cardBg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-600"
                  placeholder="My Awesome Playlist" 
                />
              </div>
              
              <div>
                <label htmlFor="playlist-description" className="block text-sm font-medium mb-1">Description (Optional)</label>
                <textarea 
                  id="playlist-description"
                  className="w-full px-4 py-2 rounded bg-music-cardBg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-600" 
                  rows={3}
                  placeholder="What's this playlist about?"
                />
              </div>
              
              <button 
                type="submit" 
                className="bg-red-600 text-white px-6 py-2 rounded-full hover:bg-red-700 transition-colors"
              >
                Create Playlist
              </button>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CreatePlaylist;
