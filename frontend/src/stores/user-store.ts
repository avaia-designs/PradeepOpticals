import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';
import { AuthService } from '@/lib/services/auth.service';

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; name: string; phone?: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: { name?: string; phone?: string; dateOfBirth?: string }) => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
  initialize: () => void;
  
  // Role-based helpers
  isAdmin: () => boolean;
  isStaff: () => boolean;
  isCustomer: () => boolean;
  isStaffOrAdmin: () => boolean;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await AuthService.login({ email, password });
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: error.response?.data?.message || 'Login failed',
          });
          throw error;
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await AuthService.register(data);
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: error.response?.data?.message || 'Registration failed',
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await AuthService.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      updateProfile: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await AuthService.updateProfile({
            name: data.name || '',
            phone: data.phone,
            dateOfBirth: data.dateOfBirth,
          });
          set({
            user: response.user,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Profile update failed',
          });
          throw error;
        }
      },

      refreshUser: async () => {
        set({ isLoading: true });
        try {
          const user = await AuthService.refreshUser();
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: error.response?.data?.message || 'Failed to refresh user',
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      initialize: () => {
        const token = AuthService.getToken();
        const user = AuthService.getUser();
        
        if (token && user) {
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      // Role-based helpers
      isAdmin: () => {
        const { user } = get();
        return user?.role === 'admin';
      },

      isStaff: () => {
        const { user } = get();
        return user?.role === 'staff';
      },

      isCustomer: () => {
        const { user } = get();
        return user?.role === 'user';
      },

      isStaffOrAdmin: () => {
        const { user } = get();
        return user?.role === 'staff' || user?.role === 'admin';
      },
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Initialize store on mount
if (typeof window !== 'undefined') {
  useUserStore.getState().initialize();
}