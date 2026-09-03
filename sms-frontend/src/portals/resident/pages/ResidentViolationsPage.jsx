import React from 'react';
import { useGetMyViolationsQuery } from '../../../store/api/residentApi';
import { ShieldAlert, Info, ExternalLink, IndianRupee, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import PageHeader from '../../../components/ui/PageHeader';
import Alert from '../../../components/ui/Alert';
import { toast } from 'react-hot-toast';

const STATUS_COLORS = {
    PENDING: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    PAID: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    APPEALED: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    DISMISSED: 'bg-slate-500/10 text-slate-400 border-slate-500/20'
};

const TYPE_LABELS = {
    WRONG_PARKING: 'Wrong Parking',
    SPEEDING: 'Speeding',
    OVERNIGHT_PARKING: 'Overnight Parking',
    NO_STICKER: 'No Sticker',
    NOISE: 'Noise Complaint',
    LITTERING: 'Littering',
    DAMAGE: 'Property Damage',
    PET_ISSUE: 'Pet Issue',
    UNAUTHORIZED_MODIFICATION: 'Unauthorized Modification',
    OTHER: 'Other'
};

export default function ResidentViolationsPage() {
    const { data, isLoading, isError } = useGetMyViolationsQuery();
    const violations = data?.data?.violations || [];

    const handlePayFine = (violation) => {
        // In a real app, this would open a payment gateway
        toast('Payment gateway integration coming soon!', { icon: '💳' });
    };

    const handleAppeal = (violation) => {
        // In a real app, this would open an appeal form modal
        toast('Appeal process coming soon!', { icon: '📝' });
    };

    return (
        <div className="space-y-6">
            <PageHeader 
                title="My Violations" 
                subtitle="View and manage rule violations and fines"
                icon={ShieldAlert}
            />

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6338f0]"></div>
                </div>
            ) : isError ? (
                <Alert type="error">Failed to load your violations.</Alert>
            ) : violations.length === 0 ? (
                <div className="text-center py-16 bg-[#1a1c29]/50 rounded-[24px] border border-slate-700/50">
                    <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-5 border border-emerald-500/20">
                        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-300 mb-2">No Violations Found</h3>
                    <p className="text-slate-500 max-w-sm mx-auto">Thank you for following the society rules and keeping our community safe and clean!</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {violations.map((violation) => (
                        <div key={violation._id} className="bg-[#1a1c29]/80 backdrop-blur-xl border border-slate-700/50 rounded-[20px] p-6 hover:border-[#6338f0]/50 transition-all shadow-lg overflow-hidden relative group">
                            {/* Decorative background glow */}
                            <div className="absolute -top-24 -right-24 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Left Side: Details */}
                                <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-3 mb-4">
                                        <span className={`px-3 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wider ${STATUS_COLORS[violation.status]}`}>
                                            {violation.status}
                                        </span>
                                        <span className="text-sm font-semibold text-slate-400 flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" />
                                            {new Date(violation.createdAt).toLocaleDateString('en-IN', {
                                                day: 'numeric', month: 'short', year: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                    
                                    <h3 className="text-xl font-bold text-white mb-2">
                                        {TYPE_LABELS[violation.type] || violation.type}
                                    </h3>

                                    {violation.description && (
                                        <p className="text-slate-400 leading-relaxed mb-4">
                                            {violation.description}
                                        </p>
                                    )}

                                    {violation.photoUrl && (
                                        <a 
                                            href={violation.photoUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 text-sm text-[#6338f0] hover:text-[#5b32dd] font-semibold transition-colors bg-[#6338f0]/10 px-3 py-1.5 rounded-lg"
                                        >
                                            <ImageIcon className="w-4 h-4" />
                                            View Evidence
                                            <ExternalLink className="w-3.5 h-3.5" />
                                        </a>
                                    )}
                                </div>

                                {/* Right Side: Fine & Actions */}
                                <div className="flex flex-col md:items-end justify-between border-t md:border-t-0 md:border-l border-slate-700/50 pt-4 md:pt-0 md:pl-6 min-w-[200px]">
                                    <div className="mb-4 md:mb-0 md:text-right">
                                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Fine Amount</div>
                                        <div className="flex items-center md:justify-end text-3xl font-bold text-white">
                                            <IndianRupee className="w-6 h-6 mr-1 text-slate-400" />
                                            {violation.fineAmount || 0}
                                        </div>
                                    </div>

                                    {violation.status === 'PENDING' && violation.fineAmount > 0 && (
                                        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto mt-4 md:mt-0">
                                            <button
                                                onClick={() => handleAppeal(violation)}
                                                className="px-5 py-2.5 rounded-[12px] font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors flex-1 md:flex-none text-center"
                                            >
                                                Appeal
                                            </button>
                                            <button
                                                onClick={() => handlePayFine(violation)}
                                                className="px-5 py-2.5 rounded-[12px] font-bold text-white bg-[#6338f0] hover:bg-[#5b32dd] transition-colors shadow-lg shadow-[#6338f0]/20 flex-1 md:flex-none text-center"
                                            >
                                                Pay Fine
                                            </button>
                                        </div>
                                    )}

                                    {violation.status === 'PAID' && (
                                        <div className="flex items-center gap-2 text-emerald-500 font-bold bg-emerald-500/10 px-4 py-2 rounded-[10px]">
                                            <CheckCircle2 className="w-5 h-5" />
                                            Paid
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
