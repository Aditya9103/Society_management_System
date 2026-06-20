import React from 'react';
import { cn } from './Button';

export function AuthCard({ title, subtitle, children, className }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className={cn('w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl', className)}>
        <div>
          {title && (
            <h2 className="text-center text-3xl font-extrabold tracking-tight text-gray-900">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="mt-2 text-center text-sm text-gray-600">{subtitle}</p>
          )}
        </div>
        <div className="mt-8 space-y-6">{children}</div>
      </div>
    </div>
  );
}

export default AuthCard;
