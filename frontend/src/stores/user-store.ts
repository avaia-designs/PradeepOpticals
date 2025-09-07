import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Address, WishlistItem } from '@/types';
import { userService } from '@/lib/services/user-service';
import { getFromStorage, setToStorage, removeFromStorage } from '@/lib/utils';

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  addresses: Address[];
  wishlist: WishlistItem[];
  wishlistCount: number;
  
  // Actions
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (userData: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    acceptTerms: boolean;
  }) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  updateProfile: (profileData: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  confirmResetPassword: (token: string, newPassword: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  
  // Address actions
  loadAddresses: () => Promise<void>;
  addAddress: (address: Omit<Address, 'id'>) => Promise<void>;
  updateAddress: (addressId: string, address: Partial<Address>) => Promise<void>;
  deleteAddress: (addressId: string) => Promise<void>;
  setDefaultAddress: (addressId: string) => Promise<void>;
  
  // Wishlist actions
  loadWishlist: () => Promise<void>;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  clearWishlist: () => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  
  // Utility actions
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  clearError: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      addresses: [],
      wishlist: [],
      wishlistCount: 0,

      login: async (email: string, password: string, rememberMe = false) => {
        set({ isLoading: true, error: null });
        try {
          const { user, token } = await userService.login({ email, password, rememberMe });
          
          setToStorage(process.env.NEXT_PUBLIC_TOKEN_STORAGE_KEY || 'auth_token', token);
          setToStorage(process.env.NEXT_PUBLIC_USER_STORAGE_KEY || 'user_data', user);
          
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false,
          });
          throw error;
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const { user, token } = await userService.register(userData);
          
          setToStorage(process.env.NEXT_PUBLIC_TOKEN_STORAGE_KEY || 'auth_token', token);
          setToStorage(process.env.NEXT_PUBLIC_USER_STORAGE_KEY || 'user_data', user);
          
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Registration failed',
            isLoading: false,
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true, error: null });
        try {
          await userService.logout();
        } catch (error) {
          // Continue with logout even if API call fails
          console.error('Logout API call failed:', error);
        } finally {
          removeFromStorage(process.env.NEXT_PUBLIC_TOKEN_STORAGE_KEY || 'auth_token');
          removeFromStorage(process.env.NEXT_PUBLIC_USER_STORAGE_KEY || 'user_data');
          
          set({
            user: null,
            isAuthenticated: false,
            addresses: [],
            wishlist: [],
            wishlistCount: 0,
            isLoading: false,
            error: null,
          });
        }
      },

      loadUser: async () => {
        const token = getFromStorage(process.env.NEXT_PUBLIC_TOKEN_STORAGE_KEY || 'auth_token', null);
        if (!token) {
          set({ isAuthenticated: false, user: null });
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const user = await userService.getCurrentUser();
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          // Token might be expired, clear auth data
          removeFromStorage(process.env.NEXT_PUBLIC_TOKEN_STORAGE_KEY || 'auth_token');
          removeFromStorage(process.env.NEXT_PUBLIC_USER_STORAGE_KEY || 'user_data');
          
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      updateProfile: async (profileData) => {
        set({ isLoading: true, error: null });
        try {
          const updatedUser = await userService.updateProfile(profileData);
          set({
            user: updatedUser,
            isLoading: false,
            error: null,
          });
          setToStorage(process.env.NEXT_PUBLIC_USER_STORAGE_KEY || 'user_data', updatedUser);
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to update profile',
            isLoading: false,
          });
          throw error;
        }
      },

      changePassword: async (currentPassword: string, newPassword: string) => {
        set({ isLoading: true, error: null });
        try {
          await userService.changePassword(currentPassword, newPassword);
          set({ isLoading: false, error: null });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to change password',
            isLoading: false,
          });
          throw error;
        }
      },

      resetPassword: async (email: string) => {
        set({ isLoading: true, error: null });
        try {
          await userService.resetPassword(email);
          set({ isLoading: false, error: null });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to send reset email',
            isLoading: false,
          });
          throw error;
        }
      },

      confirmResetPassword: async (token: string, newPassword: string) => {
        set({ isLoading: true, error: null });
        try {
          await userService.confirmResetPassword(token, newPassword);
          set({ isLoading: false, error: null });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to reset password',
            isLoading: false,
          });
          throw error;
        }
      },

      verifyEmail: async (token: string) => {
        set({ isLoading: true, error: null });
        try {
          await userService.verifyEmail(token);
          set({ isLoading: false, error: null });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to verify email',
            isLoading: false,
          });
          throw error;
        }
      },

      resendVerificationEmail: async () => {
        set({ isLoading: true, error: null });
        try {
          await userService.resendVerificationEmail();
          set({ isLoading: false, error: null });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to resend verification email',
            isLoading: false,
          });
          throw error;
        }
      },

      loadAddresses: async () => {
        set({ isLoading: true, error: null });
        try {
          const addresses = await userService.getAddresses();
          set({
            addresses,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to load addresses',
            isLoading: false,
          });
        }
      },

      addAddress: async (address) => {
        set({ isLoading: true, error: null });
        try {
          const newAddress = await userService.addAddress(address);
          set(state => ({
            addresses: [...state.addresses, newAddress],
            isLoading: false,
            error: null,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to add address',
            isLoading: false,
          });
          throw error;
        }
      },

      updateAddress: async (addressId: string, address) => {
        set({ isLoading: true, error: null });
        try {
          const updatedAddress = await userService.updateAddress(addressId, address);
          set(state => ({
            addresses: state.addresses.map(addr =>
              addr.id === addressId ? updatedAddress : addr
            ),
            isLoading: false,
            error: null,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to update address',
            isLoading: false,
          });
          throw error;
        }
      },

      deleteAddress: async (addressId: string) => {
        set({ isLoading: true, error: null });
        try {
          await userService.deleteAddress(addressId);
          set(state => ({
            addresses: state.addresses.filter(addr => addr.id !== addressId),
            isLoading: false,
            error: null,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to delete address',
            isLoading: false,
          });
          throw error;
        }
      },

      setDefaultAddress: async (addressId: string) => {
        set({ isLoading: true, error: null });
        try {
          await userService.setDefaultAddress(addressId);
          set(state => ({
            addresses: state.addresses.map(addr => ({
              ...addr,
              isDefault: addr.id === addressId,
            })),
            isLoading: false,
            error: null,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to set default address',
            isLoading: false,
          });
          throw error;
        }
      },

      loadWishlist: async () => {
        set({ isLoading: true, error: null });
        try {
          const wishlist = await userService.getWishlist();
          set({
            wishlist,
            wishlistCount: wishlist.length,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to load wishlist',
            isLoading: false,
          });
        }
      },

      addToWishlist: async (productId: string) => {
        set({ isLoading: true, error: null });
        try {
          const newItem = await userService.addToWishlist(productId);
          set(state => ({
            wishlist: [...state.wishlist, newItem],
            wishlistCount: state.wishlistCount + 1,
            isLoading: false,
            error: null,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to add to wishlist',
            isLoading: false,
          });
          throw error;
        }
      },

      removeFromWishlist: async (productId: string) => {
        set({ isLoading: true, error: null });
        try {
          await userService.removeFromWishlist(productId);
          set(state => ({
            wishlist: state.wishlist.filter(item => item.productId !== productId),
            wishlistCount: state.wishlistCount - 1,
            isLoading: false,
            error: null,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to remove from wishlist',
            isLoading: false,
          });
          throw error;
        }
      },

      clearWishlist: async () => {
        set({ isLoading: true, error: null });
        try {
          await userService.clearWishlist();
          set({
            wishlist: [],
            wishlistCount: 0,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to clear wishlist',
            isLoading: false,
          });
          throw error;
        }
      },

      isInWishlist: (productId: string) => {
        return get().wishlist.some(item => item.productId === productId);
      },

      setError: (error: string | null) => set({ error }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        addresses: state.addresses,
        wishlist: state.wishlist,
        wishlistCount: state.wishlistCount,
      }),
    }
  )
);
