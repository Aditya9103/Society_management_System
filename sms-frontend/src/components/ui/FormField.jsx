/**
 * FormField.jsx — Label + hint + error wrapper for form inputs.
 * Uses cn utility.
 */
import { cn } from './Button';

export default function FormField({ label, error, required, hint, children, className }) {
  return (
    <div className={cn('space-y-1', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
