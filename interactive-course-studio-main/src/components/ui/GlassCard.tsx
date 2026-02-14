import React from 'react';
import { cn } from '@/lib/utils';
import './GlassCard.css';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'interactive';
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  variant = 'default',
  onClick,
}) => {
  const variantClass = `glass-card-${variant}`;

  return (
    <div
      className={cn(
        'glass-card rounded-2xl border border-white/10 shadow-2xl transition-all duration-300',
        variantClass,
        onClick && 'cursor-pointer hover:border-white/20 hover:shadow-3xl',
        className
      )}
      onClick={onClick}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/10 via-transparent to-teal-500/10 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};
