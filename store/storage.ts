import { StateStorage } from 'zustand/middleware';

const dummyStorage: StateStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

const storage: StateStorage =
  typeof window !== 'undefined'
    ? window.localStorage
    : dummyStorage;

export default storage;
