import React from 'react';
import { cn } from './Button'; // reuse cn utility

export const Input = React.forwardRef(({ className, label, error, leftIcon: LeftIcon, RightElement, theme = 'light', ...props }, ref) => {
  const isDark = theme === 'dark';
  return (
    <div className="w-full relative">
      {label && (
        <label className={cn("block text-sm font-semibold mb-1.5", isDark ? "text-slate-300" : "text-slate-800")}>
          {label}
        </label>
      )}
      <div className="relative">
        {LeftIcon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <LeftIcon size={18} />
          </div>
        )}
        <input
          className={cn(
            "flex h-11 w-full rounded-xl border px-3.5 py-2 text-sm font-medium focus:outline-none focus:ring-4 transition-all duration-200 shadow-sm",
            LeftIcon && "pl-10",
            RightElement && "pr-10",
            isDark 
              ? "border-white/10 bg-[#0B0D17]/50 text-white placeholder:text-slate-500 focus:ring-indigo-500/20 focus:border-indigo-500 hover:border-white/20"
              : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white hover:border-slate-300",
            error && (isDark ? "border-red-500 focus:ring-red-500/20 bg-red-500/10" : "border-red-500 focus:ring-red-500/10 bg-red-50/30"),
            "disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          ref={ref}
          {...props}
        />
        {RightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {RightElement}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
});
Input.displayName = 'Input';
