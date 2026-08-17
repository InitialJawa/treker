import React from 'react';

interface FieldProps {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const Field: React.FC<FieldProps> = ({ label, hint, required, children, className }) => (
  <div className={className || ''}>
    {label && (
      <label className="block text-xs font-bold text-gray-custom mb-1.5">
        {label}
        {required && <span className="text-primary-pink ml-0.5">*</span>}
      </label>
    )}
    {children}
    {hint && <p className="text-[11px] text-gray-custom mt-1">{hint}</p>}
  </div>
);
