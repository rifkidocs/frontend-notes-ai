import { create } from 'zustand';
import { User, AuthTokens } from '@/lib/types';
import { apiClient } from '@/lib/api/client';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setAuth: (tokens: AuthTokens, user: User) => void;
  setUser: (user: User | null) => void;
  clearAuth: () => void;
  refreshAccessToken: () => Promise<void>;
  fetchUser: () => Promise<void>;
  initAuth: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  setAuth: (tokens, user) => {
    apiClient.setAuth(tokens);
    set({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user,
      isAuthenticated: true,
      error: null,
    });
  },

  setUser: (user) => set({ user }),

  clearAuth: () => {
    apiClient.clearAuth();
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      error: null,
    });
  },

  refreshAccessToken: async () => {
    const currentRefreshToken = get().refreshToken;
    if (!currentRefreshToken) {
      throw new Error('No refresh token available');
    }

    set({ isLoading: true, error: null });

    try {
      const tokens = await apiClient.post<{ accessToken: string; refreshToken: string }>(
        '/auth/refresh',
        { refreshToken: currentRefreshToken }
      );

      apiClient.setAuth(tokens);
      set({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to refresh token',
        isLoading: false,
      });
      get().clearAuth();
      throw error;
    }
  },

  fetchUser: async () => {
    set({ isLoading: true, error: null });

    try {
      const user = await apiClient.get<User>('/auth/me');
      set({ user, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch user',
        isLoading: false,
      });
    }
  },

  initAuth: () => {
    // Check if tokens exist in localStorage (handled by apiClient)
    const isAuthenticated = apiClient.isAuthenticated();
    if (isAuthenticated) {
      set({ isAuthenticated: true });
      get().fetchUser();
    }
  },
}));
