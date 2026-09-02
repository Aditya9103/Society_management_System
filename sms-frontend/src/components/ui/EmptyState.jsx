/**
 * EmptyState.jsx — Empty data placeholder using cn utility.
 */
import { cn } from './Button';

export default function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center rounded-2xl bg-[#151722] border border-white/5 py-20 text-center shadow-lg transition-colors hover:border-white/10', className)}>
      {Icon && (
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10 shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]">
          <Icon className="h-8 w-8 text-white opacity-80" />
        </div>
      )}
      {title && <h3 className="text-lg font-bold text-white tracking-wide">{title}</h3>}
      {description && <p className="mt-2 max-w-sm text-sm font-bold text-gray-300">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
