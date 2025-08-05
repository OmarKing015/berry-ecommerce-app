"use client";

import { createContext, useContext, useState } from 'react';

const Context = createContext<any>(null);

export const ContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [assetId, setAssetId] = useState<string | null>(null);
  const [zipedFile, setZipedFile] = useState<Blob>();

  return (
    <Context.Provider value={{ assetId, setAssetId, zipedFile,setZipedFile }}>
      {children}
    </Context.Provider>
  );
};

export const useAppContext = () => useContext(Context);
