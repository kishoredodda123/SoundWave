
import { useEffect, useState } from 'react';
import { Download as DownloadIcon, Smartphone, Apple } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { downloadService } from '@/services/downloadService';

const Download = () => {
  const [androidLink, setAndroidLink] = useState<string | null>(null);
  const [iosLink, setIosLink] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDownloadLinks = async () => {
      try {
        const androidUrl = await downloadService.getActiveDownloadLink('android');
        const iosUrl = await downloadService.getActiveDownloadLink('ios');
        
        setAndroidLink(androidUrl);
        setIosLink(iosUrl);
      } catch (error) {
        console.error('Error loading download links:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDownloadLinks();
  }, []);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-music-primary mx-auto mb-4"></div>
            <p className="text-gray-400">Loading download options...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-music-primary to-music-highlight rounded-full mb-6">
            <DownloadIcon className="h-10 w-10 text-black" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">
            Download SoundWave
          </h1>
          <p className="text-gray-400 text-lg max-w-md mx-auto">
            Take your music with you. Download our app and enjoy unlimited streaming on the go.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-md">
          {/* Android Download */}
          <div className={`bg-gradient-to-br from-music-cardBg to-music-secondary border border-gray-700 rounded-2xl p-6 transition-all duration-300 ${
            androidLink ? 'hover:border-music-primary group' : 'opacity-75'
          }`}>
            <div className="flex flex-col items-center text-center">
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-4 transition-transform ${
                androidLink 
                  ? 'bg-green-600 group-hover:scale-110' 
                  : 'bg-gray-600'
              }`}>
                <Smartphone className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Android</h3>
              {androidLink ? (
                <a
                  href={androidLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-green-500/25"
                >
                  Download APK
                </a>
              ) : (
                <div className="w-full">
                  <button
                    className="w-full bg-gray-600 text-gray-300 font-semibold py-3 px-6 rounded-xl cursor-not-allowed opacity-50"
                    disabled
                  >
                    Coming Soon
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* iPhone Download */}
          <div className={`bg-gradient-to-br from-music-cardBg to-music-secondary border border-gray-700 rounded-2xl p-6 transition-all duration-300 ${
            iosLink ? 'hover:border-music-primary group' : 'opacity-75'
          }`}>
            <div className="flex flex-col items-center text-center">
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-4 transition-transform ${
                iosLink 
                  ? 'bg-blue-600 group-hover:scale-110' 
                  : 'bg-gray-600'
              }`}>
                <Apple className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">iPhone</h3>
              {iosLink ? (
                <a
                  href={iosLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25"
                >
                  Download App
                </a>
              ) : (
                <button
                  className="w-full bg-gray-600 text-gray-300 font-semibold py-3 px-6 rounded-xl cursor-not-allowed"
                  disabled
                >
                  Coming Soon
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 bg-music-cardBg border border-gray-700 rounded-full px-6 py-3">
            <div className={`w-2 h-2 rounded-full animate-pulse ${
              androidLink || iosLink ? 'bg-green-500' : 'bg-gray-500'
            }`}></div>
            <span className="text-gray-300 text-sm">
              {androidLink && iosLink 
                ? 'Available for Android & iOS' 
                : androidLink 
                ? 'Available for Android • iOS coming soon'
                : iosLink
                ? 'Available for iOS • Android coming soon'
                : 'Coming soon for all platforms'
              }
            </span>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Download;
