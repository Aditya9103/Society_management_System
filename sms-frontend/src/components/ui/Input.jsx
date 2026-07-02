import React from 'react';
import { cn } from './Button'; // reuse cn utility

export const Input = React.forwardRef(({ className, label, error, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-slate-800 mb-1.5">
          {label}
        </label>
      )}
      <input
        className={cn(
          "flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 shadow-sm",
          error && "border-red-500 focus:ring-red-500/10 focus:border-red-500 bg-red-50/30",
          className
        )}
        ref={ref}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
});
Input.displayName = 'Input';
