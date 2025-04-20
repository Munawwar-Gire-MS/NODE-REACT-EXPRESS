import React from 'react';

type ButtonVariant = 'primary' | 'outline' | 'ghost';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: React.ReactNode;
}

export function Button({ 
  variant = 'primary', 
  children, 
  className = '', 
  ...props 
}: ButtonProps) {
  // Base classes for all button variants
  const baseClasses = 'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50';
  
  // Variant-specific classes
  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-primary/80 cursor-pointer focus:ring-purple-500',
    outline: 'border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 focus:ring-gray-400',
    ghost: 'bg-transparent hover:bg-gray-100 focus:ring-gray-400',
  };
  
  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${className}`;
  
  return (
    <button className={combinedClasses} {...props}>
      {children}
    </button>
  );
} 