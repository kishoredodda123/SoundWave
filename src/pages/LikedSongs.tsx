
import MainLayout from '@/components/layout/MainLayout';
import { Heart } from 'lucide-react';

const LikedSongs = () => {
  return (
    <MainLayout>
      <div className="px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex items-center">
            <div className="bg-red-600 p-4 rounded-lg mr-4">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold">Liked Songs</h1>
          </div>
        </div>
        <div className="mt-8">
          <p className="text-gray-400">Songs you like will appear here. Start liking songs to build your collection.</p>
        </div>
      </div>
    </MainLayout>
  );
};

export default LikedSongs;
