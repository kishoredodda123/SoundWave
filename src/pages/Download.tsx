import { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Smartphone, Apple } from 'lucide-react';
import { musicService } from '@/services/musicService';
import { Database } from '@/integrations/supabase/types';

type AppDownloadLink = Database['public']['Tables']['app_download_links']['Row'];

export default function Download() {
  const [downloadLinks, setDownloadLinks] = useState<AppDownloadLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDownloadLinks = async () => {
      try {
        const links = await musicService.getAppDownloadLinks();
        setDownloadLinks(links);
      } catch (err) {
        setError('Failed to load download links');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDownloadLinks();
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-music-primary"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-4 py-8 md:py-12">
        <div className="w-full max-w-4xl mx-auto text-center">
          {/* Download Icon */}
          <div className="mb-8">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-music-primary rounded-full flex items-center justify-center mx-auto">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="40%" 
                height="40%" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="text-black"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </div>
          </div>

          {/* Title and Description */}
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Download SoundWave</h1>
          <p className="text-gray-400 text-lg md:text-xl mb-12 max-w-2xl mx-auto">
            Take your music with you. Download our app and enjoy unlimited streaming on the go.
          </p>

          {/* Download Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto px-4">
            {/* Android Download */}
            <div className="bg-card rounded-xl p-6 text-center hover:bg-white/5 transition-colors">
              <div className="mb-4">
                <div className="w-20 h-20 mx-auto bg-[#28C840] rounded-2xl flex items-center justify-center">
                  <Smartphone className="w-12 h-12 text-black" />
                </div>
              </div>
              <h2 className="text-xl font-semibold mb-4">Android</h2>
              <Button 
                className="w-full bg-[#28C840] hover:bg-[#23B338] text-black font-semibold py-2 px-4 rounded-md"
                onClick={() => {
                  const androidLink = downloadLinks.find(link => link.platform.toLowerCase() === 'android');
                  if (androidLink?.download_url) {
                    window.location.href = androidLink.download_url;
                  }
                }}
              >
                Download APK
              </Button>
            </div>

            {/* iPhone Download */}
            <div className="bg-card rounded-xl p-6 text-center hover:bg-white/5 transition-colors">
              <div className="mb-4">
                <div className="w-20 h-20 mx-auto bg-gray-600 rounded-2xl flex items-center justify-center">
                  <Apple className="w-12 h-12 text-gray-300" />
                </div>
              </div>
              <h2 className="text-xl font-semibold mb-4">iPhone</h2>
              <Button 
                className="w-full bg-gray-600 hover:bg-gray-700 text-gray-300 cursor-not-allowed font-semibold py-2 px-4 rounded-md"
                disabled
              >
                Coming Soon
              </Button>
            </div>
          </div>

          {/* Available Platforms Text */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-400 flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#28C840]"></span>
              Available for Android • iOS coming soon
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 