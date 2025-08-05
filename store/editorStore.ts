import { create } from "zustand";
import { fabric } from "fabric";
import { costEngine } from "@/lib/costEngine";

interface ColorSwatch {
  _id: string;
  name: string;
  hexCode?: string;
  imageUrl: string;
  createdAt: string;
}

export interface EditorState {
  canvas: fabric.Canvas | null;
  setCanvas: (canvas: fabric.Canvas) => void;
  shirtStyle: "slim" | "oversized";
  toggleShirtStyle: () => void;
  selectedColorSwatch: ColorSwatch | null;
  setSelectedColorSwatch: (colorSwatch: ColorSwatch) => void;
  totalCost: number;
  setTotalCost: (cost: number) => void;

  history: string[];
  setHistory: (history: string[]) => void;
  historyIndex: number;
  setHistoryIndex: (index: any) => void;
  saveCanvasState: () => void;

  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;

  // New state for shared toolbar options
  selectedFont: string;
  setSelectedFont: (font: string) => void;
  selectedFontColor: string;
  setSelectedFontColor: (color: string) => void;
  selectedSize: string;
  setSelectedSize: (size: string) => void;
  selectedColor: string;
  setSelectedColor: (color: string) => void;
  isArabic: boolean;
  setIsArabic: (isArabic: boolean) => void;
  text: string;
  setText: (text: string) => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  canvas: null,
  setCanvas: (canvas) => {
    set({ canvas });
    // Initialize history with the initial canvas state
    const initialState = JSON.stringify(canvas.toJSON(['cost', 'type']));
    set({ history: [initialState], historyIndex: 0, canUndo: false, canRedo: false });
    // Set initial cost
    const { totalCost } = costEngine.calculate(canvas.getObjects());
    set({ totalCost: totalCost });

    // Add event listeners for canvas modifications to save state
    canvas.on({
      'object:added': get().saveCanvasState,
      'object:modified': get().saveCanvasState,
      'object:removed': get().saveCanvasState,
      'after:render': () => {
        const { totalCost } = costEngine.calculate(canvas.getObjects());
        if (totalCost !== get().totalCost) {
          set({ totalCost: totalCost });
        }
      },
    });
  },
  shirtStyle: "slim",
  toggleShirtStyle: () =>
    set((state) => ({
      shirtStyle: state.shirtStyle === "slim" ? "oversized" : "slim",
    })),
  selectedColorSwatch: null,
  setSelectedColorSwatch: (colorSwatch: ColorSwatch) => set({ selectedColorSwatch: colorSwatch }),
  totalCost: 6.00, // Initial base cost
  setTotalCost: (cost) => set({ totalCost: cost }),

  // New state implementation
  selectedFont: "Inter",
  setSelectedFont: (font) => set({ selectedFont: font }),
  selectedFontColor: "#000000",
  setSelectedFontColor: (color) => set({ selectedFontColor: color }),
  selectedSize: "M",
  setSelectedSize: (size) => set({ selectedSize: size }),
  selectedColor: "#FFFFFF",
  setSelectedColor: (color) => set({ selectedColor: color }),
  isArabic: false,
  setIsArabic: (isArabic) => set({ isArabic }),
  text: "English",
  setText: (text) => set({ text }),
  history: [],
  setHistory: (history) => set({ history, canUndo: get().historyIndex > 0, canRedo: get().historyIndex < history.length - 1 }),
  historyIndex: -1,
  setHistoryIndex: (index) => set({ historyIndex: index, canUndo: index > 0, canRedo: index < get().history.length - 1 }),
  saveCanvasState: () => {
    const { canvas, history, historyIndex, setHistory, setHistoryIndex } = get();
    if (canvas) {
      const json = JSON.stringify(canvas.toJSON(['cost', 'type']));
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(json);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  },
  undo: () => {
    const { history, historyIndex, canvas, setHistoryIndex, setTotalCost } = get();
    if (historyIndex > 0 && canvas) {
      const newIndex = historyIndex - 1;
      canvas.loadFromJSON(JSON.parse(history[newIndex]), () => {
        canvas.renderAll();
        const objects = canvas.getObjects();
        const cost = costEngine.calculate(objects);
        setTotalCost(cost.totalCost);
        setHistoryIndex(newIndex);
      });
    }
  },
  redo: () => {
    const { history, historyIndex, canvas, setHistoryIndex, setTotalCost } = get();
    if (historyIndex < history.length - 1 && canvas) {
      const newIndex = historyIndex + 1;
      canvas.loadFromJSON(JSON.parse(history[newIndex]), () => {
        canvas.renderAll();
        const objects = canvas.getObjects();
        const cost = costEngine.calculate(objects);
        setTotalCost(cost.totalCost);
        setHistoryIndex(newIndex);
      });
    }
  },
  canUndo: false,
  canRedo: false,
}));
