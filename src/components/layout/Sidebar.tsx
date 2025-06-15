
import { Link } from 'react-router-dom';
import { Home, Search, PlusCircle, Heart, Music, Album, Menu, X } from 'lucide-react';
import { useState } from 'react';
import UserProfile from './UserProfile';

const Sidebar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };
  
  return <>
      {/* Mobile Menu Button - More integrated design */}
      <button 
        className="md:hidden fixed top-4 left-4 z-50 p-3 rounded-full bg-black/20 backdrop-blur-sm border border-white/10 hover:bg-black/30 transition-all duration-200" 
        onClick={toggleMobileMenu}
      >
        {isMobileMenuOpen ? (
          <X className="h-5 w-5 text-white" />
        ) : (
          <Menu className="h-5 w-5 text-white" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={closeMobileMenu} />}

      {/* Sidebar */}
      <aside className={`
        fixed md:relative z-40 md:z-auto
        w-64 md:w-64 h-full md:h-auto
        bg-music-secondary md:bg-transparent
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        border-r border-gray-800 md:border-r-0
        flex flex-col
      `}>
        <div className="p-6 h-full px-0 py-0 mx-[20px] my-[20px] flex flex-col">
          <div className="flex items-center mb-8">
            <Music className="h-8 w-8 text-music-primary mr-2" />
            <h1 className="text-2xl font-bold text-white">SoundWave</h1>
          </div>
          
          <nav className="flex-1">
            <ul className="space-y-4">
              <li>
                <Link to="/" className="flex items-center text-sm font-medium text-white hover:text-music-primary transition-colors" onClick={closeMobileMenu}>
                  <Home className="h-5 w-5 mr-3" />
                  Home
                </Link>
              </li>
              <li>
                <Link to="/search" className="flex items-center text-sm font-medium text-gray-400 hover:text-white transition-colors" onClick={closeMobileMenu}>
                  <Search className="h-5 w-5 mr-3" />
                  Search
                </Link>
              </li>
              <li>
                <Link to="/albums" className="flex items-center text-sm font-medium text-gray-400 hover:text-white transition-colors" onClick={closeMobileMenu}>
                  <Album className="h-5 w-5 mr-3" />
                  Albums
                </Link>
              </li>
            </ul>

            <div className="mt-8 pt-8 border-t border-gray-800">
              <Link to="/create-playlist" className="flex items-center text-sm font-medium text-gray-400 hover:text-white transition-colors mb-4" onClick={closeMobileMenu}>
                <PlusCircle className="h-5 w-5 mr-3" />
                Create Playlist
              </Link>
              <Link to="/liked-songs" className="flex items-center text-sm font-medium text-gray-400 hover:text-white transition-colors" onClick={closeMobileMenu}>
                <Heart className="h-5 w-5 mr-3" />
                Liked Songs
              </Link>
            </div>
          </nav>

          {/* User Profile Section */}
          <div className="mt-auto pt-4 border-t border-gray-800">
            <UserProfile />
          </div>
        </div>
      </aside>
    </>;
};

export default Sidebar;
