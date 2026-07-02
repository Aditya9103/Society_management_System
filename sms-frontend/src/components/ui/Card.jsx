/**
 * Card.jsx — Surface container with compound sub-components.
 * Uses cn utility for class merging.
 *
 * Compound sub-components:
 *   Card          — outer container
 *   Card.Header   — title + optional subtitle + optional actions slot
 *   Card.Body     — padded content area
 *   Card.Footer   — bottom bar (actions / summary)
 *   Card.Section  — labelled group inside a Body
 *
 * All sub-components also accessible as named exports:
 *   CardHeader, CardBody, CardFooter, CardSection
 */
import { cn } from './Button';

function Card({ children, className, padding = 'none', as: Tag = 'div' }) {
  return (
    <Tag className={cn('rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60 transition-shadow duration-200 hover:shadow-md', className)}>
      {children}
    </Tag>
  );
}

Card.Header = function CardHeader({ title, subtitle, actions, className }) {
  return (
    <div className={cn('flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/60 px-5 py-4 sm:px-6', className)}>
      <div className="min-w-0">
        {title && <p className="text-base font-bold text-slate-800">{title}</p>}
        {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
};

Card.Body = function CardBody({ children, className }) {
  return <div className={cn('px-5 py-5 sm:px-6', className)}>{children}</div>;
};

Card.Footer = function CardFooter({ children, className }) {
  return (
    <div className={cn('border-t border-slate-200/60 bg-slate-50 px-5 py-4 sm:px-6', className)}>
      {children}
    </div>
  );
};

Card.Section = function CardSection({ label, children, className }) {
  return (
    <div className={cn('space-y-3', className)}>
      {label && (
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</p>
      )}
      {children}
    </div>
  );
};

/* Named exports for pages that destructure: import { Card } from '...' */
export { Card };
export const CardHeader  = Card.Header;
export const CardBody    = Card.Body;
export const CardFooter  = Card.Footer;
export const CardSection = Card.Section;

export default Card;
