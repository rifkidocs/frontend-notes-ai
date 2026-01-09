'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AlertCircle, Home, ArrowLeft } from 'lucide-react';
import { MotionButton } from '@/components/motion';

function AuthErrorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const errorMessage = searchParams.get('message') || 'An unknown error occurred';

  useEffect(() => {
    // Optionally auto-redirect after a few seconds
    const timer = setTimeout(() => {
      router.replace('/login');
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6"
          >
            <AlertCircle className="h-8 w-8 text-destructive" />
          </motion.div>

          <h1 className="text-2xl font-bold mb-2">Authentication Error</h1>
          <p className="text-muted-foreground mb-8">{errorMessage}</p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <MotionButton
              variant="default"
              onClick={() => router.push('/login')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </MotionButton>
            <MotionButton
              variant="outline"
              onClick={() => router.push('/')}
              className="gap-2"
            >
              <Home className="h-4 w-4" />
              Go to Dashboard
            </MotionButton>
          </div>

          <p className="text-sm text-muted-foreground mt-6">
            You will be redirected to the login page in 5 seconds...
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <AuthErrorContent />
    </Suspense>
  );
}
