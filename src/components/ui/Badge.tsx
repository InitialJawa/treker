import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  tone?: 'primary' | 'soft' | 'neutral' | 'success' | 'warning';
  className?: string;
}

const tones = {
  primary: 'bg-primary-pink text-white',
  soft: 'bg-soft-pink text-primary-pink border border-primary-pink/20',
  neutral: 'bg-gray-100 text-gray-custom border border-card-pink',
  success: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
  warning: 'bg-amber-50 text-amber-600 border border-amber-200',
};

export const Badge: React.FC<BadgeProps> = ({ children, tone = 'soft', className }) => (
  <span
    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap ${tones[tone]} ${className || ''}`}
  >
    {children}
  </span>
);
