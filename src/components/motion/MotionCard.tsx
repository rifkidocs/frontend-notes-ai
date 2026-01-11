'use client';

import * as React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

// Animation variants for cards
export const cardVariants = {
  hidden: {
    opacity: 0,
    scale: 0.99,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'tween' as const,
      duration: 0.3,
      ease: 'easeOut' as const,
    },
  },
  hover: {
    scale: 1.01,
    transition: {
      type: 'tween' as const,
      duration: 0.2,
      ease: 'easeOut' as const,
    },
  },
  tap: {
    scale: 0.98,
    transition: {
      type: 'tween' as const,
      duration: 0.1,
    },
  },
};

// Stagger container variants
export const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.1,
    },
  },
};

interface MotionCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'gradient' | 'elevated';
  delay?: number;
  index?: number;
  skipAnimation?: boolean;
}

export function MotionCard({
  children,
  className,
  variant = 'default',
  delay = 0,
  index,
  skipAnimation = false,
  ...props
}: MotionCardProps) {
  // Calculate delay based on index if provided (smoother stagger)
  const animationDelay = index !== undefined ? index * 0.03 : delay;

  const variantStyles = {
    default: 'bg-card text-card-foreground border border-border shadow-sm',
    glass: 'glass-card',
    gradient: 'gradient-border bg-card',
    elevated:
      'bg-card text-card-foreground border border-border shadow-lg shadow-foreground/5',
  };

  return (
    <motion.div
      variants={skipAnimation ? undefined : cardVariants}
      initial={skipAnimation ? undefined : "hidden"}
      animate={skipAnimation ? undefined : "visible"}
      whileHover="hover"
      whileTap="tap"
      transition={skipAnimation ? undefined : { delay: animationDelay }}
      className={cn('rounded-xl', variantStyles[variant], className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Skeleton card for loading states
export function MotionCardSkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        'rounded-xl bg-blue-500/5 border border-blue-500/10 p-6 relative overflow-hidden',
        className
      )}
    >
      <div className="space-y-4 relative z-10">
        <div className="flex items-center gap-3">
          <motion.div 
            className="w-10 h-10 rounded-lg bg-blue-500/20"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className="h-5 w-3/4 rounded bg-blue-500/20"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
        <div className="space-y-2">
          <motion.div
            className="h-3 w-full rounded bg-blue-500/10"
            animate={{ opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
          />
          <motion.div
            className="h-3 w-2/3 rounded bg-blue-500/10"
            animate={{ opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
          />
        </div>
      </div>
      
      {/* Animated Blue Shimmer */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/10 to-transparent"
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </motion.div>
  );
}
