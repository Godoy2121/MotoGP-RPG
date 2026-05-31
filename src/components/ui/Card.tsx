import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = '', glow = false, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-motogp-card border border-white/10 rounded-xl p-4 ${glow ? 'shadow-glow' : ''} ${onClick ? 'cursor-pointer hover:border-motogp-red/40 transition-colors' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
