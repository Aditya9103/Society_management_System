import React from 'react';

export default function Field({ label, children }) {
    return (
        <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                {label}
            </label>
            {children}
        </div>
    );
}
