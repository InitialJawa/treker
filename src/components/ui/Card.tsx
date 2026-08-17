import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ hover, className, children, ...rest }) => (
  <div
    className={`bg-white rounded-3xl border border-card-pink shadow-xs ${
      hover ? 'hover:border-primary-pink hover:shadow-md transition-all' : ''
    } ${className || ''}`}
    {...rest}
  >
    {children}
  </div>
);
