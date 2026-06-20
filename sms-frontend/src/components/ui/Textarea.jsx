/**
 * Textarea.jsx — Multi-line text input using cn utility.
 *
 * Props:
 *   label      string    — optional above-field label
 *   error      string    — optional error message shown below
 *   rows       number    — default 4
 *   className  string    — merged via cn() for overrides
 *   ref        ref       — forwarded ref
 *   ...props             — forwarded to <textarea>
 */
import { cn } from './Button';

export const Textarea = ({ className, label, error, rows = 4, ref, ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        rows={rows}
        className={cn(
          'flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm',
          'placeholder:text-gray-400',
          'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'resize-y',
          error && 'border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export default Textarea;
