import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { PRIORITY_STYLES, STATUS_STYLES } from './constants';
import { Button } from '../../../../components/ui/Button';
import { useChangeComplaintStatusMutation } from '../../../../store/api/residentApi';
import Modal from '../../../../components/ui/Modal';
import { Textarea } from '../../../../components/ui/Textarea';
import { Droplet, Lightbulb, Sparkles, Box, ShieldAlert, Wrench, ChevronRight, ArrowUp, ArrowDown, Minus } from 'lucide-react';

const CATEGORY_ICONS = {
    PLUMBING: { icon: Droplet, color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/30' },
    ELECTRICAL: { icon: Lightbulb, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' },
    HOUSEKEEPING: { icon: Sparkles, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
    SECURITY: { icon: ShieldAlert, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
    LIFT_ELEVATOR: { icon: Wrench, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
    OTHER: { icon: Box, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' }
};

const getPriorityIcon = (priority) => {
    switch(priority) {
        case 'HIGH': return <ArrowUp className="h-3 w-3 text-red-400" />;
        case 'URGENT': return <ArrowUp className="h-3 w-3 text-rose-500" />;
        case 'LOW': return <ArrowDown className="h-3 w-3 text-emerald-400" />;
        default: return <Minus className="h-3 w-3 text-orange-400" />;
    }
};

export function ComplaintCard({ complaint }) {
    const c = complaint;
    const [changeStatus, { isLoading }] = useChangeComplaintStatusMutation();
    const [actionModal, setActionModal] = useState({ open: false, type: null }); // type: 'respond', 'reopen'
    const [notes, setNotes] = useState('');

    const handleQuickAction = async (status) => {
        try {
            await changeStatus({ id: c._id, status }).unwrap();
        } catch (e) {
            toast.error('Failed to update complaint status');
        }
    };

    const handleModalSubmit = async (e) => {
        e.preventDefault();
        try {
            const status = actionModal.type === 'respond' ? 'IN_PROGRESS' : 'REOPENED';
            await changeStatus({ id: c._id, status, notes }).unwrap();
            setActionModal({ open: false, type: null });
            setNotes('');
        } catch (e) {
            toast.error('Failed to update complaint');
        }
    };

    const catTheme = CATEGORY_ICONS[c.category] || CATEGORY_ICONS.OTHER;
    const statusStyle = STATUS_STYLES[c.status] || STATUS_STYLES.DRAFT;

    return (
        <>
            <div className="relative overflow-hidden rounded-[20px] bg-[#0f111a] border border-slate-800 p-4 transition-all duration-300 hover:border-slate-700 hover:bg-[#151722] group flex flex-col md:flex-row gap-4">
                
                {/* Category Icon */}
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 border ${catTheme.bg} ${catTheme.border}`}>
                    <catTheme.icon className={`h-6 w-6 ${catTheme.color}`} />
                </div>

                {/* Main Content */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-bold text-[15px] text-white break-words whitespace-normal">{c.title}</h3>
                        <span className={`text-[10px] font-bold tracking-wider uppercase ${catTheme.color}`}>
                            {c.category === 'OTHER' ? c.customCategory || 'OTHER' : c.category}
                        </span>
                    </div>
                    <p className="text-[12px] text-white font-bold line-clamp-1 mb-2">{c.description}</p>
                    <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500">
                        <span>{new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} • {new Date(c.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                        <span>#{c.complaintNumber}</span>
                    </div>
                    
                    {/* Updates */}
                    {(c.latestNote || c.resolutionNotes) && (
                        <div className="mt-3 space-y-1">
                            {c.latestNote && c.status !== 'RESOLVED' && c.status !== 'CLOSED' && (
                                <p className="text-[11px] text-indigo-400"><span className="font-bold">Update:</span> {c.latestNote}</p>
                            )}
                            {c.resolutionNotes && (
                                <p className="text-[11px] text-emerald-400"><span className="font-bold">Resolution:</span> {c.resolutionNotes}</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Area (Status, Priority, Actions) */}
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 shrink-0">
                    <div className="flex flex-col items-end gap-1">
                        <span className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wide ${statusStyle.cls}`}>
                            {statusStyle.label}
                        </span>
                        <div className={`flex items-center gap-1 text-[11px] font-bold ${PRIORITY_STYLES[c.priority] || ''}`}>
                            {getPriorityIcon(c.priority)} {c.priority}
                        </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-600 group-hover:text-white font-bold transition-colors hidden md:block" />
                </div>

                {/* Mobile chevron */}
                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600 group-hover:text-white font-bold transition-colors md:hidden" />
                
                {/* Actions (if actionable) */}
                    {(c.status === 'DRAFT' || c.status === 'RESOLVED' || c.status === 'PENDING_RESIDENT') && (
                        <div className="w-full md:w-auto flex flex-wrap gap-2 justify-end mt-2 md:mt-0 pt-3 md:pt-0 border-t border-slate-800 md:border-none">
                            {c.status === 'DRAFT' && (
                                <button className="px-4 py-2 rounded-lg bg-purple-600 text-white text-[11px] font-bold" onClick={() => handleQuickAction('OPEN')} disabled={isLoading}>
                                    Submit
                                </button>
                            )}
                            {c.status === 'PENDING_RESIDENT' && (
                                <button className="px-4 py-2 rounded-lg bg-pink-600/20 text-pink-400 border border-pink-500/30 text-[11px] font-bold" onClick={() => setActionModal({ open: true, type: 'respond' })}>
                                    Respond
                                </button>
                            )}
                            {c.status === 'RESOLVED' && (
                                <>
                                    <button className="px-4 py-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[11px] font-bold" onClick={() => setActionModal({ open: true, type: 'reopen' })}>
                                        Reject
                                    </button>
                                    <button className="px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold" onClick={() => handleQuickAction('CLOSED')} disabled={isLoading}>
                                        Confirm Close
                                    </button>
                                </>
                            )}
                        </div>
                    )}
            </div>

            <Modal 
                isOpen={actionModal.open} 
                onClose={() => setActionModal({ open: false, type: null })} 
                title={actionModal.type === 'respond' ? 'Respond to Handler' : 'Reject Resolution & Reopen'}
            >
                <form onSubmit={handleModalSubmit} className="space-y-4">
                    <Textarea 
                        label="Notes *" 
                        value={notes} 
                        onChange={e => setNotes(e.target.value)} 
                        rows={4}
                        placeholder={actionModal.type === 'respond' ? "Provide requested information..." : "Why is the resolution not satisfactory?"} 
                        required
                    />
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="secondary" onClick={() => setActionModal({ open: false, type: null })}>Cancel</Button>
                        <Button type="submit" isLoading={isLoading}>Submit</Button>
                    </div>
                </form>
            </Modal>
        </>
    );
}
