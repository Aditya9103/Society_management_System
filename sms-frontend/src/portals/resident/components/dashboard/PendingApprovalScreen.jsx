import React from 'react';
import { Clock, FileText, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function PendingApprovalScreen() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100">
                <Clock className="h-10 w-10 text-amber-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Pending Approval</h2>
            <p className="mt-3 max-w-md text-sm text-slate-500 leading-relaxed">
                Your registration has been submitted successfully. The Society Admin is reviewing your profile.
                You'll receive an email once you're approved — this typically takes 1–2 business days.
            </p>
            
            <div className="mt-8 max-w-md w-full rounded-xl bg-white border border-slate-200 shadow-sm p-6 text-left">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 p-3 bg-indigo-50 rounded-lg">
                        <FileText className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-800">Action Required: Upload Documents</h3>
                        <p className="text-sm text-slate-500 mt-1 mb-4">
                            To speed up your approval, please ensure you have uploaded your Identity Proof (Aadhaar/PAN) and Residential Proof (Rent Agreement/Sale Deed).
                        </p>
                        <button 
                            onClick={() => navigate('/resident/documents')}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                            Go to Documents
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
