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

export default function Modal({ isOpen, onClose, title, description, size = 'md', children, className }) {
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
      <div className={cn('relative z-10 w-full overflow-hidden rounded-3xl bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] flex flex-col max-h-[90vh]', SIZES[size], className)}>
        {title && (
          <div className="flex shrink-0 items-start justify-between border-b border-slate-100 px-6 py-5">
            <div>
              <h2 className="text-lg font-bold text-slate-800">{title}</h2>
              {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        <div className="overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>,
    document.body
  );
}
