
import MainLayout from '@/components/layout/MainLayout';
import FeaturedSection from '@/components/sections/FeaturedSection';
import TrendingSection from '@/components/sections/TrendingSection';

const Index = () => {
  return (
    <MainLayout>
      <div className="px-6 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-music-primary/20 to-transparent p-8 rounded-xl mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome to SoundWave</h1>
          <p className="text-gray-300 mb-6">Discover and enjoy your favorite music</p>
          <button className="bg-music-primary text-black font-medium px-6 py-3 rounded-full hover:bg-music-highlight transition-colors">
            Explore Now
          </button>
        </div>

        {/* Featured Section */}
        <section className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Featured Playlists</h2>
            <button className="text-sm text-music-primary hover:underline">View All</button>
          </div>
          <FeaturedSection />
        </section>
        
        {/* Trending Section */}
        <section className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Trending Now</h2>
            <button className="text-sm text-music-primary hover:underline">View All</button>
          </div>
          <TrendingSection />
        </section>
        
        {/* Recently Played */}
        <section className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Recently Played</h2>
            <button className="text-sm text-music-primary hover:underline">View All</button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="group">
                <div className="relative mb-2">
                  <img 
                    src={`https://images.unsplash.com/photo-${item % 2 === 0 ? '1618160702438-9b02ab6515c9' : '1500673922987-e212871fec22'}?auto=format&fit=crop&w=200&h=200`}
                    alt="Album cover" 
                    className="w-full aspect-square object-cover rounded-md shadow-md group-hover:shadow-xl transition-all duration-300" 
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="bg-music-primary text-black rounded-full p-2 transform scale-90 group-hover:scale-100 transition-transform">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      </svg>
                    </button>
                  </div>
                </div>
                <h3 className="text-sm font-medium truncate">Track Title {item}</h3>
                <p className="text-xs text-gray-400 truncate">Artist Name</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default Index;
