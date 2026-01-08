'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FileText, Sparkles, ArrowRight } from 'lucide-react';
import { authApi } from '@/lib/api/auth';
import { MotionButton } from '@/components/motion';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 24,
    },
  },
};

const floatingVariants = {
  float: {
    y: [-10, 10, -10],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: 'easeInOut' as const,
    },
  },
};

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    if (authApi.isAuthenticated()) {
      router.replace('/dashboard');
    }
  }, [router]);

  const handleGoogleLogin = () => {
    const url = authApi.googleUrl();
    window.location.href = url;
  };

  const handleGithubLogin = () => {
    const url = authApi.githubUrl();
    window.location.href = url;
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient orbs */}
        <motion.div
          variants={floatingVariants}
          animate="float"
          className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-[120px]"
        />
        <motion.div
          variants={floatingVariants}
          animate="float"
          transition={{ delay: 2 }}
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/20 rounded-full blur-[120px]"
        />
        <motion.div
          variants={floatingVariants}
          animate="float"
          transition={{ delay: 4 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-start/10 rounded-full blur-[140px]"
        />

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:48px_48px]" />
      </div>

      {/* Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md relative z-10 px-4"
      >
        {/* Logo and Title */}
        <motion.div
          variants={itemVariants}
          className="text-center mb-10"
        >
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-accent shadow-2xl shadow-primary/25 mb-6 relative overflow-hidden group"
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
            <FileText className="h-10 w-10 text-primary-foreground relative z-10" />
            <motion.div
              className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent"
              animate={{
                x: ['-100%', '200%'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          </motion.div>

          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-foreground via-display to-foreground bg-clip-text text-transparent animate-gradient">
            Welcome to Notes AI
          </h1>

          <p className="text-muted-foreground text-lg flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            <span>Where ideas meet intelligence</span>
          </p>
        </motion.div>

        {/* Login Card */}
        <motion.div
          variants={itemVariants}
          className="glass-card rounded-2xl p-8 shadow-2xl"
        >
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">Sign in to continue</h2>
            <p className="text-muted-foreground text-sm">
              Choose your preferred method to get started
            </p>
          </div>

          <div className="space-y-3">
            {/* Google Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <button
                onClick={handleGoogleLogin}
                className="w-full h-12 px-4 rounded-xl border-2 border-border bg-background hover:bg-accent hover:border-accent transition-all duration-200 flex items-center justify-center gap-3 group shadow-sm hover:shadow-md"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="font-medium">Continue with Google</span>
                <ArrowRight className="h-4 w-4 ml-auto opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
              </button>
            </motion.div>

            {/* GitHub Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <button
                onClick={handleGithubLogin}
                className="w-full h-12 px-4 rounded-xl border-2 border-border bg-background hover:bg-accent hover:border-accent transition-all duration-200 flex items-center justify-center gap-3 group shadow-sm hover:shadow-md"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                <span className="font-medium">Continue with GitHub</span>
                <ArrowRight className="h-4 w-4 ml-auto opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
              </button>
            </motion.div>
          </div>

          {/* Features */}
          <motion.div
            variants={itemVariants}
            className="mt-8 pt-6 border-t border-border/50"
          >
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <div className="h-8 w-8 mx-auto rounded-lg bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <p className="text-xs font-medium">AI-Powered</p>
              </div>
              <div className="space-y-1">
                <div className="h-8 w-8 mx-auto rounded-lg bg-accent/10 flex items-center justify-center">
                  <svg className="h-4 w-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <p className="text-xs font-medium">Real-time Sync</p>
              </div>
              <div className="space-y-1">
                <div className="h-8 w-8 mx-auto rounded-lg bg-secondary flex items-center justify-center">
                  <svg className="h-4 w-4 text-secondary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <p className="text-xs font-medium">Secure</p>
              </div>
            </div>
          </motion.div>

          <motion.p
            variants={itemVariants}
            className="text-xs text-center text-muted-foreground mt-6"
          >
            By continuing, you agree to our{' '}
            <a href="#" className="text-primary hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-primary hover:underline">Privacy Policy</a>
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
}
