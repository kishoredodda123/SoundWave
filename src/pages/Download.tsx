
import { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';

const getDownloadLink = () => localStorage.getItem('androidDownloadLink') || '';
const setDownloadLink = (link: string) => localStorage.setItem('androidDownloadLink', link);

const Download = () => {
  const [androidLink, setAndroidLink] = useState('');

  useEffect(() => {
    setAndroidLink(getDownloadLink());
  }, []);

  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <h1 className="text-3xl font-bold mb-4">Download SoundWave App</h1>
        <div className="bg-music-cardBg p-8 rounded-md shadow max-w-sm w-full flex flex-col items-center">
          {androidLink ? (
            <a
              href={androidLink}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded text-white font-bold transition mb-4 w-full text-center"
            >
              Download for Android
            </a>
          ) : (
            <button
              className="bg-gray-400 px-6 py-2 rounded text-white font-bold mb-4 w-full opacity-60 cursor-not-allowed"
              disabled
            >
              Android Link Not Available
            </button>
          )}
          <div className="w-full">
            <button
              className="bg-gray-600 px-6 py-2 rounded text-white font-bold w-full opacity-60 cursor-not-allowed"
              disabled
            >
              Download for iPhone (Coming Soon)
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Download;
