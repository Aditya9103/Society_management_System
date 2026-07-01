import React from 'react';
import IdCardScanner from '../components/dashboard/IdCardScanner';
import { ScanLine } from 'lucide-react';

export default function VerifyIdCardPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <ScanLine className="h-6 w-6 text-amber-500" /> Verify ID Card
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Scan resident digital ID cards to verify their identity and status.
                    </p>
                </div>
            </div>

            <IdCardScanner />
        </div>
    );
}
