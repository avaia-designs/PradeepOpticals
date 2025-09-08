import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Cart, CartItem } from '@/types';
import { CartService } from '@/lib/services/cart.service';
import { ErrorHandler } from '@/lib/utils/error-handler';

interface CartState {
  cart: Cart;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  addItem: (productId: string, quantity: number, specifications?: any) => Promise<void>;
  updateItemQuantity: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  applyDiscount: (discountAmount: number) => Promise<void>;
  removeDiscount: () => Promise<void>;
  loadCart: () => Promise<void>;
  clearError: () => void;
}

const initialCart: Cart = {
  items: [],
  subtotal: 0,
  tax: 0,
  shipping: 0,
  discount: 0,
  totalAmount: 0,
  itemCount: 0,
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: initialCart,
      isLoading: false,
      error: null,

      addItem: async (productId: string, quantity: number, specifications?: any) => {
        set({ isLoading: true, error: null });
        try {
          const cart = await CartService.addItem(productId, quantity, specifications);
          set({ cart, isLoading: false });
        } catch (error: any) {
          ErrorHandler.handleCartError(error, 'add');
          set({
            isLoading: false,
            error: ErrorHandler.getErrorMessage(error),
          });
          throw error;
        }
      },

      updateItemQuantity: async (productId: string, quantity: number) => {
        set({ isLoading: true, error: null });
        try {
          const cart = await CartService.updateItemQuantity(productId, quantity);
          set({ cart, isLoading: false });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Failed to update item quantity',
          });
          throw error;
        }
      },

      removeItem: async (productId: string) => {
        set({ isLoading: true, error: null });
        try {
          const cart = await CartService.removeItem(productId);
          set({ cart, isLoading: false });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Failed to remove item from cart',
          });
          throw error;
        }
      },

      clearCart: async () => {
        set({ isLoading: true, error: null });
        try {
          const cart = await CartService.clearCart();
          set({ cart, isLoading: false });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Failed to clear cart',
          });
          throw error;
        }
      },

      applyDiscount: async (discountAmount: number) => {
        set({ isLoading: true, error: null });
        try {
          const cart = await CartService.applyDiscount(discountAmount);
          set({ cart, isLoading: false });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Failed to apply discount',
          });
          throw error;
        }
      },

      removeDiscount: async () => {
        set({ isLoading: true, error: null });
        try {
          const cart = await CartService.removeDiscount();
          set({ cart, isLoading: false });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Failed to remove discount',
          });
          throw error;
        }
      },

      loadCart: async () => {
        set({ isLoading: true, error: null });
        try {
          const cart = await CartService.getCart();
          set({ cart, isLoading: false });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Failed to load cart',
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        cart: state.cart,
      }),
    }
  )
);

// Computed values
export const useCartItems = () => useCartStore((state) => state.cart.items);
export const useCartTotal = () => useCartStore((state) => state.cart.totalAmount);
export const useCartItemCount = () => useCartStore((state) => state.cart.itemCount);
export const useCartSubtotal = () => useCartStore((state) => state.cart.subtotal);
export const useCartTax = () => useCartStore((state) => state.cart.tax);
export const useCartShipping = () => useCartStore((state) => state.cart.shipping);
export const useCartDiscount = () => useCartStore((state) => state.cart.discount);

// Additional computed values for header
export const useTotalItems = () => useCartStore((state) => state.cart.itemCount);