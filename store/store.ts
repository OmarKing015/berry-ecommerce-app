import { Product } from "@/sanity.types";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import storage from "./storage";

export interface BasketItem {
  product: Product;
  quantity: number;
  size: string;
  extraCost: number;
}

export interface BasketState {
  items: BasketItem[];
  addItem: (product: Product, size: string, extraCost: number) => void;
  removeItem: (productId: string, size: string) => void;
  getItemCount: (productId: string, size: string) => number;
  clearBasket: () => void;
  getTotalPrice: () => number;
  getGroupedItems: () => BasketItem[];
}

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
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            };
          } else {
            return { items: [...state.items, { product, quantity: 1, size, extraCost }] };
          }
        }),
      removeItem: (productId, size) =>
        set((state) => ({
          items: state.items.reduce((acc, item) => {
            if (item.product._id === productId && item.size === size) {
              if (item.quantity > 1) {
                acc.push({ ...item, quantity: item.quantity - 1 });
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
      storage: createJSONStorage(() => storage),
    }
  )
);

export default useBasketStore;
