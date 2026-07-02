import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const Button = React.forwardRef(({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm hover:shadow active:shadow-none focus-visible:ring-indigo-600',
    secondary: 'bg-white text-slate-800 hover:bg-slate-50 border border-slate-300 shadow-sm hover:shadow active:shadow-none focus-visible:ring-slate-500',
    ghost: 'hover:bg-slate-100 text-slate-700 hover:text-slate-900 focus-visible:ring-slate-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow active:shadow-none focus-visible:ring-red-600',
  };

  const sizes = {
    sm: 'min-h-[2rem] px-3 py-1.5 text-sm',
    md: 'min-h-[2.5rem] px-4 py-2',
    lg: 'min-h-[3rem] px-8 py-3 text-lg',
  };

  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center text-center leading-tight cursor-pointer rounded-lg font-semibold transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : null}
      {children}
    </button>
  );
});
Button.displayName = 'Button';
