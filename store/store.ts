import { Product } from "@/sanity.types";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import  {fabric}  from "fabric";
import { costEngine } from "@/lib/costEngine";

export interface BasketItem {
  product: Product;
  quantity: number;
  size: string; // Added size to BasketItem
  extraCost: number; // Added extraCost to BasketItem
}

export interface BasketState {
  items: BasketItem[];
  addItem: (product: Product, size: string, extraCost: number) => void; // Modified signature to include size and extraCost
  removeItem: (productId: string, size: string) => void;
  getItemCount: (productId: string, size: string) => number;
  clearBasket: () => void;
  getTotalPrice: () => number;
  getGroupedItems: () => BasketItem[];
}

interface ColorSwatch {
  _id: string;
  name: string;
  hexCode?: string;
  imageUrl: string;
  createdAt: string;
}

interface EditorState {
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
const useBasketStore = create<BasketState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, size, extraCost) =>
        set((state) => {
          const existingItem = state.items.find(
            (item) => product._id === item.product._id && size === item.size
          );
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                 product._id === item.product._id && size === item.size
                  ? { ...item, quantity: item.quantity + 1 } // add extraCost
                  : item
              ),
            };
          } else {
            return { items: [...state.items, { product, quantity: 1, size, extraCost }] }; // add extraCost
          }
        }),
      removeItem: (productId, size) =>
        set((state) => ({
          items: state.items.reduce((acc, item) => {
            if (item.product._id === productId && item.size === size) {
              if (item.quantity > 1) {
                acc.push({ ...item, quantity: item.quantity - 1 });
              } else {
                // Remove the item if quantity is 1
              }
            } else {
              acc.push(item);
            }
            return acc;
          }, [] as BasketItem[]),
        })),
      clearBasket: () => set({ items: [] }),
      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + (item.product.price ?? 0) * item.quantity + item.extraCost,
          0
        );
      },
      getItemCount: (productId, size) => {
        const item = get().items.find((item) => item.product._id === productId && item.size === size);
        return item ? item.quantity : 0;
      },
      getGroupedItems: () => get().items,
    }),
    {
      name: "basket-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useBasketStore;
