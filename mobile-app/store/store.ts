import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Using 'any' for Product type as a placeholder
type Product = any;

export interface BasketItem {
  product: Product;
  quantity: number;
  size: string;
  extraCost: number;
}

export interface BasketState {
  items: BasketItem[];
  addItem: (product: Product, size: string, extraCost?: number) => void;
  removeItem: (productId: string, size:string) => void;
  clearBasket: () => void;
  getTotalPrice: () => number;
  getItemCount: (productId: string, size: string) => number;
}

const useBasketStore = create<BasketState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, size, extraCost = 0) =>
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
    }),
    {
      name: 'basket-storage', // name of the item in the storage
      storage: createJSONStorage(() => AsyncStorage), // use AsyncStorage for persistence
    }
  )
);

export default useBasketStore;
