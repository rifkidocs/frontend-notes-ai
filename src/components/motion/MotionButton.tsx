'use client';

import * as React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*="size-"])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5',
        destructive:
          'bg-destructive text-white shadow-lg shadow-destructive/25 hover:bg-destructive/90 hover:shadow-xl hover:-translate-y-0.5',
        outline:
          'border-2 border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground hover:border-accent',
        secondary:
          'bg-secondary text-secondary-foreground shadow-md hover:bg-secondary/80 hover:-translate-y-0.5',
        ghost:
          'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        glass:
          'glass-effect text-foreground shadow-md hover:shadow-lg hover:-translate-y-0.5',
        gradient:
          'bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] text-primary-foreground shadow-lg hover:shadow-xl hover:-translate-y-0.5 animate-gradient',
      },
      size: {
        default: 'h-10 px-5 py-2.5 has-[>svg]:px-4',
        sm: 'h-9 rounded-lg gap-1.5 px-4 has-[>svg]:px-3',
        lg: 'h-12 rounded-xl px-8 has-[>svg]:px-5 text-base',
        icon: 'size-10',
        'icon-sm': 'size-9',
        'icon-lg': 'size-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface MotionButtonProps
  extends React.ComponentProps<'button'>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

// Animation variants for buttons
export const buttonTapVariants = {
  tap: { scale: 0.97 },
  hover: { scale: 1.02 },
};

function MotionButton({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: MotionButtonProps) {
  const Comp = asChild ? Slot : motion.button;

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      whileTap="tap"
      whileHover="hover"
      variants={buttonTapVariants}
      transition={{
        type: 'spring' as const,
        stiffness: 400,
        damping: 17,
      }}
      {...(props as any)}
    />
  );
}

export { MotionButton, buttonVariants };
