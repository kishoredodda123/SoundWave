
import { Link } from 'react-router-dom';
import { Home, Search, PlusCircle, Heart, Music, Album } from 'lucide-react';

const Sidebar = () => {
  return (
    <aside className="hidden md:flex flex-col w-64 bg-music-secondary border-r border-gray-800 overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center mb-8">
          <Music className="h-8 w-8 text-music-primary mr-2" />
          <h1 className="text-2xl font-bold text-white">SoundWave</h1>
        </div>
        
        <nav>
          <ul className="space-y-4">
            <li>
              <Link to="/" className="flex items-center text-sm font-medium text-white hover:text-music-primary transition-colors">
                <Home className="h-5 w-5 mr-3" />
                Home
              </Link>
            </li>
            <li>
              <Link to="/search" className="flex items-center text-sm font-medium text-gray-400 hover:text-white transition-colors">
                <Search className="h-5 w-5 mr-3" />
                Search
              </Link>
            </li>
            <li>
              <Link to="/albums" className="flex items-center text-sm font-medium text-gray-400 hover:text-white transition-colors">
                <Album className="h-5 w-5 mr-3" />
                Albums
              </Link>
            </li>
          </ul>
        </nav>

        <div className="mt-8 pt-8 border-t border-gray-800">
          <Link to="/create-playlist" className="flex items-center text-sm font-medium text-gray-400 hover:text-white transition-colors mb-4">
            <PlusCircle className="h-5 w-5 mr-3" />
            Create Playlist
          </Link>
          <Link to="/liked-songs" className="flex items-center text-sm font-medium text-gray-400 hover:text-white transition-colors">
            <Heart className="h-5 w-5 mr-3" />
            Liked Songs
          </Link>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
