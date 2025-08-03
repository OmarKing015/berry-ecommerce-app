"use client";

import { createContext, useContext, useState } from 'react';

const Context = createContext<any>(null);

export const ContextProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <Context.Provider value={{}}>
      {children}
    </Context.Provider>
  );
};

export const useAppContext = () => useContext(Context);
