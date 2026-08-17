import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, children }) => (
  <div className="bg-white rounded-3xl border border-card-pink p-12 text-center shadow-sm">
    {icon && <div className="mx-auto mb-3 flex items-center justify-center">{icon}</div>}
    <h3 className="font-bold text-base text-dark">{title}</h3>
    {description && <p className="text-xs text-gray-custom mt-1 mb-4">{description}</p>}
    {children}
  </div>
);
