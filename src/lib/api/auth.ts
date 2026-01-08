import { apiClient } from './client';
import { User, AuthTokens } from '@/lib/types';

export const authApi = {
  // OAuth URLs (for redirecting to OAuth providers)
  googleUrl: () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    return `${baseUrl}/auth/google`;
  },

  githubUrl: () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    return `${baseUrl}/auth/github`;
  },

  // Get current user
  getMe: () => apiClient.get<User>('/auth/me'),

  // Refresh tokens
  refreshTokens: (refreshToken: string) =>
    apiClient.post<{ accessToken: string; refreshToken: string }>('/auth/refresh', {
      refreshToken,
    }),

  // Logout (client-side token deletion)
  logout: () => apiClient.post<{ message: string }>('/auth/logout', {}),

  // Store tokens in localStorage
  setTokens: (tokens: AuthTokens) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
    }
  },

  // Clear tokens from localStorage
  clearTokens: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  },

  // Get stored tokens
  getTokens: (): AuthTokens | null => {
    if (typeof window === 'undefined') return null;
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    if (!accessToken || !refreshToken) return null;
    return { accessToken, refreshToken };
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!authApi.getTokens();
  },
};
