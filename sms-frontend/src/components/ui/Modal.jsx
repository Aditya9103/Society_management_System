/**
 * Modal.jsx — Accessible dialog overlay using cn utility.
 *
 * Props:
 *   isOpen      bool
 *   onClose     fn
 *   title       string
 *   description string  (optional)
 *   size        'sm' | 'md' | 'lg' | 'xl'  (default 'md')
 *   children    ReactNode
 *   className   string
 */
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from './Button';

const SIZES = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export default function Modal({ isOpen, onClose, title, description, size = 'md', children, className, theme = 'light' }) {
  useEffect(() => {
    document.body.classList.toggle('modal-open', isOpen);
    return () => document.body.classList.remove('modal-open');
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 flex items-end justify-center p-4 sm:items-center" style={{ zIndex: 9999 }} role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Panel */}
      <div className={cn(
        'relative z-10 w-full overflow-hidden rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] flex flex-col max-h-[90vh]', 
        SIZES[size], 
        theme === 'dark' ? 'bg-[#131525] text-white border border-white/10' : 'bg-white text-slate-800',
        className
      )}>
        {title && (
          <div className={cn(
            "flex shrink-0 items-start justify-between border-b px-6 py-5",
            theme === 'dark' ? 'border-white/10' : 'border-slate-100'
          )}>
            <div>
              <h2 className={cn("text-lg font-bold", theme === 'dark' ? 'text-white' : 'text-slate-800')}>{title}</h2>
              {description && <p className={cn("mt-1 text-sm", theme === 'dark' ? 'text-slate-400' : 'text-slate-500')}>{description}</p>}
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className={cn(
                "ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                theme === 'dark' ? 'text-slate-400 hover:bg-white/10 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              )}
            >
              <X size={20} strokeWidth={2.5} />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">{children}</div>
      </div>
    </div>,
    document.body
  );
}
