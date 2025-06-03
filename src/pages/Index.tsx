import MainLayout from '@/components/layout/MainLayout';
import FeaturedSection from '@/components/sections/FeaturedSection';
import TrendingSection from '@/components/sections/TrendingSection';
const Index = () => {
  return <MainLayout>
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
            {[1, 2, 3, 4, 5, 6].map(item => {})}
          </div>
        </section>
      </div>
    </MainLayout>;
};
export default Index;