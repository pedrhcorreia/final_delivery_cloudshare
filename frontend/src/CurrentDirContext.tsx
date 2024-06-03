import React, { createContext, useContext, useState } from 'react';

interface CurrentDirContextData {
  currentDir: string;
  setCurrentDir: (dir: string) => void;
}

const CurrentDirContext = createContext<CurrentDirContextData>({
  currentDir: '/',
  setCurrentDir: () => {},
});

export const useCurrentDir = () => useContext(CurrentDirContext);


interface CurrentDirProviderProps {
  children: React.ReactNode;
}


export const CurrentDirProvider: React.FC<CurrentDirProviderProps> = ({ children }) => {
  const [currentDir, setCurrentDir] = useState<string>('');

  return (
    <CurrentDirContext.Provider value={{ currentDir, setCurrentDir }}>
      {children}
    </CurrentDirContext.Provider>
  );
};
