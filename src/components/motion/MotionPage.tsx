'use client';

import * as React from 'react';
import { motion, HTMLMotionProps, Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

// Page transition variants
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

// Staggered content variants
export const contentVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

// Fade up animation for sections
export const fadeUpVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

interface MotionPageProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'fade' | 'slide' | 'scale';
}

export function MotionPage({
  children,
  className,
  variant = 'default',
  ...props
}: MotionPageProps) {
  const variants = {
    default: pageVariants,
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    slide: {
      initial: { x: 50, opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: -50, opacity: 0 },
    },
    scale: {
      initial: { scale: 0.95, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      exit: { scale: 0.95, opacity: 0 },
    },
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants[variant]}
      className={cn('w-full', className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Motion section wrapper for staggered animations
interface MotionSectionProps extends HTMLMotionProps<'section'> {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function MotionSection({
  children,
  className,
  delay = 0,
  ...props
}: MotionSectionProps) {
  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={fadeUpVariants}
      transition={{ delay }}
      className={cn('w-full', className)}
      {...props}
    >
      {children}
    </motion.section>
  );
}

// Motion container for list items
interface MotionListProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function MotionList({
  children,
  className,
  staggerDelay = 0.05,
  ...props
}: MotionListProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={cn('space-y-4', className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Motion list item
interface MotionListItemProps {
  children: React.ReactNode;
  className?: string;
  index?: number;
}

export function MotionListItem({ children, className, index = 0, ...props }: MotionListItemProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            delay: index * 0.05,
            type: 'spring' as const,
            stiffness: 300,
            damping: 24,
          },
        },
      }}
      className={cn('', className)}
      {...(props as any)}
    >
      {children}
    </motion.div>
  );
}
