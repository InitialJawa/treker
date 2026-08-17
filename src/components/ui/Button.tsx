import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
  loading?: boolean;
}

const base =
  'inline-flex items-center justify-center gap-2 font-bold transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed active:scale-95 select-none';

const variants = {
  primary: 'bg-primary-pink hover:bg-primary-pink/90 text-white shadow-md',
  secondary: 'border border-card-pink bg-white hover:bg-gray-50 text-dark',
  ghost: 'text-gray-custom hover:bg-soft-pink hover:text-dark',
  danger: 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200',
};

const sizes = {
  sm: 'px-4 py-2 text-xs rounded-xl',
  md: 'px-5 py-2.5 text-sm rounded-2xl',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading,
  className,
  children,
  disabled,
  ...rest
}) => (
  <button
    className={`${base} ${variants[variant]} ${sizes[size]} ${className || ''}`}
    disabled={disabled || loading}
    {...rest}
  >
    {loading && (
      <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin shrink-0" />
    )}
    {children}
  </button>
);
