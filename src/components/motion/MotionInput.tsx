'use client';

import * as React from 'react';
import { motion, HTMLMotionProps, useAnimation } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface MotionInputProps
  extends React.ComponentProps<'input'> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  onIconClick?: () => void;
}

export function MotionInput({
  className,
  type,
  label,
  error,
  icon,
  onIconClick,
  ...props
}: MotionInputProps) {
  const controls = useAnimation();
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <div className="space-y-1.5">
      {label && (
        <motion.label
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm font-medium text-foreground/80"
        >
          {label}
        </motion.label>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={controls}
        className="relative"
      >
        <motion.input
          type={type}
          data-slot="input"
          onFocus={() => {
            setIsFocused(true);
            controls.start({ scale: 1.01 });
          }}
          onBlur={() => {
            setIsFocused(false);
            controls.start({ scale: 1 });
          }}
          className={cn(
            'flex h-10 w-full rounded-xl border-2 border-border bg-background px-4 py-2.5 text-base shadow-sm transition-colors file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
            isFocused && 'border-primary ring-4 ring-primary/10',
            error && 'border-destructive ring-4 ring-destructive/10',
            icon && 'pr-10',
            className
          )}
          transition={{ duration: 0.2 }}
          {...(props as any)}
        />

        {icon && (
          <motion.button
            type="button"
            onClick={onIconClick}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.1 }}
          >
            {icon}
          </motion.button>
        )}
      </motion.div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-destructive"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}

// Textarea variant
export interface MotionTextareaProps
  extends React.ComponentProps<'textarea'> {
  label?: string;
  error?: string;
  rows?: number;
}

export function MotionTextarea({
  className,
  label,
  error,
  rows = 4,
  ...props
}: MotionTextareaProps) {
  const controls = useAnimation();
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <div className="space-y-1.5">
      {label && (
        <motion.label
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm font-medium text-foreground/80"
        >
          {label}
        </motion.label>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={controls}
        className="relative"
      >
        <motion.textarea
          rows={rows}
          data-slot="textarea"
          onFocus={() => {
            setIsFocused(true);
            controls.start({ scale: 1.01 });
          }}
          onBlur={() => {
            setIsFocused(false);
            controls.start({ scale: 1 });
          }}
          className={cn(
            'flex min-h-[80px] w-full rounded-xl border-2 border-border bg-background px-4 py-3 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-y',
            isFocused && 'border-primary ring-4 ring-primary/10',
            error && 'border-destructive ring-4 ring-destructive/10',
            className
          )}
          transition={{ duration: 0.2 }}
          {...(props as any)}
        />
      </motion.div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-destructive"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}
