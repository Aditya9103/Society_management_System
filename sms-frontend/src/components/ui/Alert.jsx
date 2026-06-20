/**
 * Alert.jsx — Inline status / feedback message using cn utility.
 * Types: info | success | warning | error
 */
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';
import { cn } from './Button';

const CONFIG = {
  info:    { icon: Info,          base: 'bg-blue-50 text-blue-800 ring-1 ring-blue-200'    },
  success: { icon: CheckCircle2,  base: 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200' },
  warning: { icon: AlertTriangle, base: 'bg-amber-50 text-amber-800 ring-1 ring-amber-200'  },
  error:   { icon: AlertCircle,   base: 'bg-red-50 text-red-700 ring-1 ring-red-200'        },
};

export default function Alert({ type = 'info', children, className }) {
  const { icon: Icon, base } = CONFIG[type] ?? CONFIG.info;
  return (
    <div className={cn('flex items-start gap-3 rounded-xl px-4 py-3 text-sm', base, className)}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="flex-1">{children}</div>
    </div>
  );
}
