'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';
import { authApi } from '@/lib/api/auth';
import { apiClient } from '@/lib/api/client';
import { User } from '@/lib/types';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    const handleCallback = async () => {
      const accessToken = searchParams.get('accessToken');
      const refreshToken = searchParams.get('refreshToken');

      if (!accessToken || !refreshToken) {
        router.replace('/login?error=missing_tokens');
        return;
      }

      try {
        // Store tokens in localStorage
        const tokens = { accessToken, refreshToken };
        authApi.setTokens(tokens);

        // Set up API client with tokens
        apiClient.setAuth(tokens);

        // Fetch user data
        const user = await apiClient.get<User>('/auth/me');

        // Set auth state with tokens and user
        setAuth(tokens, user);

        // Redirect to dashboard
        router.replace('/dashboard');
      } catch (error) {
        console.error('Auth callback error:', error);
        authApi.clearTokens();
        router.replace('/login?error=fetch_user_failed');
      }
    };

    handleCallback();
  }, [searchParams, router, setAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Signing you in...</p>
      </motion.div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <AuthCallbackContent />
    </Suspense>
  );
}
