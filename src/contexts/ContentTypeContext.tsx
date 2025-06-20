import { createContext, useContext, useState, ReactNode } from 'react';

type ContentType = 'music' | 'movies';

interface ContentTypeContextType {
  contentType: ContentType;
  toggleContentType: () => void;
  setContentType: (type: ContentType) => void;
}

const ContentTypeContext = createContext<ContentTypeContextType | undefined>(undefined);

export function ContentTypeProvider({ children }: { children: ReactNode }) {
  const [contentType, setContentType] = useState<ContentType>('music');

  const toggleContentType = () => {
    setContentType(prev => prev === 'music' ? 'movies' : 'music');
  };

  return (
    <ContentTypeContext.Provider value={{ contentType, toggleContentType, setContentType }}>
      {children}
    </ContentTypeContext.Provider>
  );
}

export function useContentType() {
  const context = useContext(ContentTypeContext);
  if (context === undefined) {
    throw new Error('useContentType must be used within a ContentTypeProvider');
  }
  return context;
} 