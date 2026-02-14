import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import './AnimatedButton.css';

const buttonVariants = cva(
  'relative inline-flex items-center justify-center font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group',
  {
    variants: {
      variant: {
        primary: `
          bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700
          hover:from-purple-600 hover:via-purple-700 hover:to-purple-800
          text-white shadow-lg hover:shadow-xl hover:shadow-purple-500/50
          active:scale-95
        `,
        glass: `
          bg-white/10 backdrop-blur-md border border-white/20
          hover:bg-white/20 hover:border-white/30
          text-white shadow-xl
          before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-r
          before:from-white/0 before:via-white/20 before:to-white/0 before:opacity-0
          hover:before:opacity-100 before:animate-shimmer
        `,
        outline: `
          border-2 border-purple-500 text-purple-600
          hover:border-purple-600 hover:text-purple-700
          hover:shadow-lg hover:shadow-purple-500/30
          relative
          after:absolute after:inset-0 after:rounded-lg
          after:bg-purple-500 after:opacity-0 hover:after:opacity-10
          after:transition-opacity after:duration-300
        `,
        ghost: `
          text-purple-600 hover:bg-purple-50
          transition-colors duration-200
        `,
        secondary: `
          bg-secondary text-secondary-foreground hover:bg-secondary/80
          shadow-sm
        `,
        destructive: `
          bg-destructive text-destructive-foreground hover:bg-destructive/90
          shadow-sm
        `
      },
      size: {
        xs: 'px-2.5 py-1.5 text-xs rounded-md',
        sm: 'px-3 py-2 text-sm rounded-lg',
        md: 'px-4 py-2.5 text-base rounded-lg',
        lg: 'px-6 py-3 text-lg rounded-xl',
        xl: 'px-8 py-4 text-lg rounded-xl',
        icon: 'h-10 w-10',
      },
      animation: {
        none: '',
        pulse: 'animate-pulse',
        bounce: 'hover:animate-bounce',
        shimmer: 'animate-shimmer',
        float: 'animate-float',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      animation: 'none',
    },
  }
);

interface AnimatedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  children: React.ReactNode;
  icon?: React.ReactNode;
  loading?: boolean;
}

export const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ className, variant, size, animation, children, icon, loading, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, animation, className }))}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <svg
          className="w-4 h-4 animate-spin mr-2"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : icon ? (
        <span className="mr-2">{icon}</span>
      ) : null}

      <span className="relative z-10">{children}</span>

      {/* Shimmer overlay for premium effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none bg-white" />
    </button>
  )
);

AnimatedButton.displayName = 'AnimatedButton';
