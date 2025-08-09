import { create } from 'zustand';

// A simplified state for the editor, not tied to a specific canvas library.

export interface TextObject {
  id: string;
  content: string;
  x: number;
  y: number;
  color: string;
  fontSize: number;
}

export interface ImageObject {
  id: string;
  uri: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface EditorState {
  shirtStyle: 'slim' | 'oversized';
  toggleShirtStyle: () => void;

  texts: TextObject[];
  addText: (content: string) => void;

  images: ImageObject[];
  addImage: (uri: string) => void;

  // We will manage drawing actions instead of a canvas instance
  // The CanvasWrapper will listen to these and draw accordingly.

  reset: () => void;
}

const initialState = {
  shirtStyle: 'slim' as 'slim' | 'oversized',
  texts: [],
  images: [],
};

export const useEditorStore = create<EditorState>((set) => ({
  ...initialState,

  toggleShirtStyle: () =>
    set((state) => ({
      shirtStyle: state.shirtStyle === 'slim' ? 'oversized' : 'slim',
    })),

  addText: (content) =>
    set((state) => ({
      texts: [
        ...state.texts,
        {
          id: `text-${Date.now()}`,
          content,
          x: 150, // Default position
          y: 250,
          color: 'black',
          fontSize: 40,
        },
      ],
    })),

  addImage: (uri) =>
    set((state) => ({
      images: [
        ...state.images,
        {
          id: `image-${Date.now()}`,
          uri,
          x: 100, // Default position
          y: 100,
          width: 200,
          height: 200,
        },
      ],
    })),

  reset: () => set(initialState),
}));
