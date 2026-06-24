import React from 'react';
import { Clock } from 'lucide-react';

export function PendingApprovalScreen() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100">
                <Clock className="h-10 w-10 text-amber-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Pending Approval</h2>
            <p className="mt-3 max-w-md text-sm text-slate-500 leading-relaxed">
                Your registration has been submitted successfully. The Society Admin is reviewing your
                documents. You'll receive an email once you're approved — this typically takes 1–2 business days.
            </p>
            <div className="mt-6 rounded-xl bg-amber-50 px-5 py-3 ring-1 ring-amber-200">
                <p className="text-sm font-medium text-amber-700">Nothing to do here — sit tight! 🎉</p>
            </div>
        </div>
    );
}
