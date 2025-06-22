import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

type ContentType = 'music' | 'movies';

interface ContentTypeContextType {
  contentType: ContentType;
  toggleContentType: () => void;
  setContentType: (type: ContentType) => void;
}

const ContentTypeContext = createContext<ContentTypeContextType | undefined>(undefined);

export const ContentTypeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Initialize based on localStorage and URL path
  const getInitialContentType = (): ContentType => {
    const stored = localStorage.getItem('contentType') as ContentType;
    
    // If we're explicitly on a movies path, always use movies
    if (location.pathname.startsWith('/movies')) {
      localStorage.setItem('contentType', 'movies');
      return 'movies';
    }
    
    // If we're on a specific music path (like /albums/123), always use music
    if (location.pathname.startsWith('/albums') || location.pathname.startsWith('/library')) {
      localStorage.setItem('contentType', 'music');
      return 'music';
    }
    
    // For root path or other paths, use stored preference or default to music
    return stored || 'music';
  };

  const [contentType, setContentTypeState] = useState<ContentType>(getInitialContentType);

  const setContentType = (type: ContentType) => {
    setContentTypeState(type);
    localStorage.setItem('contentType', type);
    
    // Navigate based on content type
    if (type === 'movies') {
      if (!location.pathname.startsWith('/movies')) {
        navigate('/movies');
      }
    } else {
      if (location.pathname.startsWith('/movies')) {
        navigate('/');
      }
    }
  };

  const toggleContentType = () => {
    const newType = contentType === 'music' ? 'movies' : 'music';
    setContentType(newType);
  };

  // Keep content type in sync with explicit path changes
  useEffect(() => {
    // Only update for explicit section paths
    if (location.pathname.startsWith('/movies')) {
      setContentTypeState('movies');
      localStorage.setItem('contentType', 'movies');
    } else if (location.pathname.startsWith('/albums') || location.pathname.startsWith('/library')) {
      setContentTypeState('music');
      localStorage.setItem('contentType', 'music');
    } else if (location.pathname === '/') {
      // For root path, use stored preference
      const stored = localStorage.getItem('contentType') as ContentType;
      if (stored) {
        setContentTypeState(stored);
      }
    }
  }, [location.pathname]);

  return (
    <ContentTypeContext.Provider value={{ contentType, toggleContentType, setContentType }}>
      {children}
    </ContentTypeContext.Provider>
  );
};

export const useContentType = () => {
  const context = useContext(ContentTypeContext);
  if (context === undefined) {
    throw new Error('useContentType must be used within a ContentTypeProvider');
  }
  return context;
}; 