/**
 * Select.jsx — Reusable dropdown using cn utility.
 *
 * Props:
 *   label      string    — optional above-field label
 *   error      string    — optional error message shown below
 *   className  string    — merged via cn() for overrides
 *   ...props             — forwarded to <select>
 */
import { cn } from './Button';

export const Select = ({ className, label, error, children, ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-slate-800 mb-1.5">
          {label}
        </label>
      )}
      <select
        className={cn(
          'flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 font-medium shadow-sm transition-all duration-200 hover:border-slate-300',
          'focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-red-500 focus:ring-red-500/10 focus:border-red-500 bg-red-50/30',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export default Select;
