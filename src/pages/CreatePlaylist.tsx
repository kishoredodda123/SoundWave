
import MainLayout from '@/components/layout/MainLayout';

const CreatePlaylist = () => {
  return (
    <MainLayout>
      <div className="px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h1 className="text-3xl font-bold">Create Playlist</h1>
        </div>
        <div className="mt-8">
          <p className="text-gray-400">Create a new playlist here.</p>
        </div>
      </div>
    </MainLayout>
  );
};

export default CreatePlaylist;
