import React from 'react';
import { motion } from 'framer-motion';

interface InteractiveCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  gradient?: boolean;
  stats?: { label: string; value: string }[];
  className?: string;
}

export const InteractiveCard: React.FC<InteractiveCardProps> = ({
  title,
  description,
  icon,
  onClick,
  gradient = true,
  stats,
  className = '',
}) => {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      whileTap={{ scale: 0.98 }}
      className={`relative rounded-2xl bg-card border border-border/50 shadow-lg overflow-hidden cursor-pointer group ${className}`}
      onClick={onClick}
    >
      {/* Background Gradient */}
      {gradient && (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-teal-500/5 group-hover:from-purple-500/10 group-hover:to-teal-500/10 transition-colors duration-500" />
      )}

      {/* Animated Border Glow */}
      <div className="absolute inset-0 rounded-2xl border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 p-6">
        {/* Icon */}
        {icon && (
          <motion.div
            initial={{ scale: 0.9 }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="mb-4 text-4xl inline-block"
          >
            {icon}
          </motion.div>
        )}

        {/* Title */}
        <h3 className="text-xl font-bold text-foreground group-hover:text-purple-600 transition-colors mb-2">{title}</h3>

        {/* Description */}
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{description}</p>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border/50">
            {stats.map((stat, i) => (
              <div key={i}>
                <div className="text-lg font-bold text-foreground group-hover:text-purple-600 transition-colors">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hover Light Effect */}
      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </motion.div>
  );
};
