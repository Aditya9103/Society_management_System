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
        <label className="block text-sm font-semibold text-slate-800 mb-1.5">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        rows={rows}
        className={cn(
          'flex w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 font-medium shadow-sm transition-all duration-200 hover:border-slate-300',
          'placeholder:text-slate-400',
          'focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'resize-y',
          error && 'border-red-500 focus:ring-red-500/10 focus:border-red-500 bg-red-50/30',
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
