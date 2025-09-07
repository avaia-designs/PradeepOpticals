import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Cart, CartItem, Product } from '@/types';
import { cartService } from '@/lib/services/cart-service';
import { getFromStorage, setToStorage } from '@/lib/utils';

interface CartState {
  cart: Cart | null;
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  total: number;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadCart: () => Promise<void>;
  addItem: (productId: string, quantity?: number, selectedVariant?: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  moveToWishlist: (itemId: string) => Promise<void>;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => Promise<void>;
  syncCart: () => Promise<void>;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: null,
      items: [],
      totalItems: 0,
      subtotal: 0,
      total: 0,
      isLoading: false,
      error: null,

      loadCart: async () => {
        set({ isLoading: true, error: null });
        try {
          const cart = await cartService.getCart();
          set({
            cart,
            items: cart.items,
            totalItems: cart.totalItems,
            subtotal: cart.subtotal,
            total: cart.total,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to load cart',
            isLoading: false,
          });
        }
      },

      addItem: async (productId: string, quantity = 1, selectedVariant?: string) => {
        set({ isLoading: true, error: null });
        try {
          const newItem = await cartService.addToCart(productId, quantity, selectedVariant);
          const currentItems = get().items;
          const existingItemIndex = currentItems.findIndex(
            item => item.productId === productId && item.selectedVariant?.id === selectedVariant
          );

          let updatedItems: CartItem[];
          if (existingItemIndex >= 0) {
            updatedItems = currentItems.map((item, index) =>
              index === existingItemIndex
                ? { ...item, quantity: item.quantity + quantity, totalPrice: item.unitPrice * (item.quantity + quantity) }
                : item
            );
          } else {
            updatedItems = [...currentItems, newItem];
          }

          const subtotal = updatedItems.reduce((sum, item) => sum + item.totalPrice, 0);
          const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);

          set({
            items: updatedItems,
            subtotal,
            totalItems,
            total: subtotal, // Will be updated with tax/shipping when cart is loaded
            isLoading: false,
          });

          // Update local storage for offline support
          setToStorage('cart_items', updatedItems);
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to add item to cart',
            isLoading: false,
          });
          throw error;
        }
      },

      updateQuantity: async (itemId: string, quantity: number) => {
        if (quantity <= 0) {
          await get().removeItem(itemId);
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const updatedItem = await cartService.updateCartItem(itemId, quantity);
          const currentItems = get().items;
          const updatedItems = currentItems.map(item =>
            item.id === itemId ? updatedItem : item
          );

          const subtotal = updatedItems.reduce((sum, item) => sum + item.totalPrice, 0);
          const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);

          set({
            items: updatedItems,
            subtotal,
            totalItems,
            total: subtotal,
            isLoading: false,
          });

          setToStorage('cart_items', updatedItems);
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to update item quantity',
            isLoading: false,
          });
          throw error;
        }
      },

      removeItem: async (itemId: string) => {
        set({ isLoading: true, error: null });
        try {
          await cartService.removeFromCart(itemId);
          const currentItems = get().items;
          const updatedItems = currentItems.filter(item => item.id !== itemId);

          const subtotal = updatedItems.reduce((sum, item) => sum + item.totalPrice, 0);
          const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);

          set({
            items: updatedItems,
            subtotal,
            totalItems,
            total: subtotal,
            isLoading: false,
          });

          setToStorage('cart_items', updatedItems);
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to remove item from cart',
            isLoading: false,
          });
          throw error;
        }
      },

      clearCart: async () => {
        set({ isLoading: true, error: null });
        try {
          await cartService.clearCart();
          set({
            cart: null,
            items: [],
            totalItems: 0,
            subtotal: 0,
            total: 0,
            isLoading: false,
          });
          setToStorage('cart_items', []);
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to clear cart',
            isLoading: false,
          });
          throw error;
        }
      },

      moveToWishlist: async (itemId: string) => {
        set({ isLoading: true, error: null });
        try {
          await cartService.moveToWishlist(itemId);
          const currentItems = get().items;
          const updatedItems = currentItems.filter(item => item.id !== itemId);

          const subtotal = updatedItems.reduce((sum, item) => sum + item.totalPrice, 0);
          const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);

          set({
            items: updatedItems,
            subtotal,
            totalItems,
            total: subtotal,
            isLoading: false,
          });

          setToStorage('cart_items', updatedItems);
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to move item to wishlist',
            isLoading: false,
          });
          throw error;
        }
      },

      applyCoupon: async (code: string) => {
        set({ isLoading: true, error: null });
        try {
          const result = await cartService.applyCoupon(code);
          // Reload cart to get updated totals
          await get().loadCart();
          set({ isLoading: false });
          return { success: true, message: result.message };
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to apply coupon',
            isLoading: false,
          });
          return { success: false, message: error instanceof Error ? error.message : 'Failed to apply coupon' };
        }
      },

      removeCoupon: async () => {
        set({ isLoading: true, error: null });
        try {
          await cartService.removeCoupon();
          await get().loadCart();
          set({ isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to remove coupon',
            isLoading: false,
          });
          throw error;
        }
      },

      syncCart: async () => {
        const localItems = getFromStorage('cart_items', []);
        if (localItems.length === 0) return;

        set({ isLoading: true, error: null });
        try {
          const cart = await cartService.syncCart(localItems);
          set({
            cart,
            items: cart.items,
            totalItems: cart.totalItems,
            subtotal: cart.subtotal,
            total: cart.total,
            isLoading: false,
          });
          setToStorage('cart_items', cart.items);
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to sync cart',
            isLoading: false,
          });
        }
      },

      setError: (error: string | null) => set({ error }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        items: state.items,
        totalItems: state.totalItems,
        subtotal: state.subtotal,
        total: state.total,
      }),
    }
  )
);
