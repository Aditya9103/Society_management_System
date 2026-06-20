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
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <select
        className={cn(
          'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm',
          'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-red-500 focus:ring-red-500',
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
