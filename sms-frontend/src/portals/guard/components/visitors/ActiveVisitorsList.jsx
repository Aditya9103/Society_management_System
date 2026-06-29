import React from 'react';
import { useGetGuardActiveVisitorsQuery, useGuardLogExitMutation, useGuardLogEntryMutation } from '../../../../store/api/staffApi';
import { LogOut, LogIn, User, Clock, MapPin } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import StatusBadge from '../../../../components/ui/StatusBadge';

export default function ActiveVisitorsList() {
    const { data, isLoading, isError, refetch } = useGetGuardActiveVisitorsQuery(undefined, {
        refetchOnMountOrArgChange: true,
    });
    const [logExit] = useGuardLogExitMutation();
    const [logEntry] = useGuardLogEntryMutation();
    const [loadingId, setLoadingId] = React.useState(null);

    const visitors = data?.data?.visitors || [];

    const handleLogExit = async (visitorId) => {
        setLoadingId(visitorId);
        try {
            await logExit({ id: visitorId }).unwrap();
            alert('Exit logged successfully!');
        } catch (err) {
            alert('Failed to log exit: ' + (err.data?.message || err.message));
        } finally {
            setLoadingId(null);
        }
    };

    const handleLogEntry = async (visitorId) => {
        setLoadingId(visitorId);
        try {
            await logEntry({ id: visitorId }).unwrap();
            alert('Entry logged successfully!');
        } catch (err) {
            alert('Failed to log entry: ' + (err.data?.message || err.message));
        } finally {
            setLoadingId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100 text-center py-10">
                <p className="text-slate-400">Loading active visitors...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100 text-center py-10">
                <p className="text-red-500 mb-2">Failed to load active visitors.</p>
                <button onClick={refetch} className="text-sm text-orange-600 font-semibold underline">Retry</button>
            </div>
        );
    }

    if (visitors.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100 text-center py-20">
                <h2 className="text-slate-400 font-medium text-lg">No Active Visitors</h2>
                <p className="text-slate-400 text-sm mt-1">There are currently no waiting or active visitors.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <h2 className="text-lg font-bold text-slate-800">Active Visitors ({visitors.length})</h2>
                <button onClick={refetch} className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition">
                    Refresh List
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {visitors.map(visitor => {
                    const initials = visitor.visitorName ? visitor.visitorName.charAt(0).toUpperCase() : 'V';
                    return (
                        <div key={visitor._id} className="group relative bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm hover:shadow-xl hover:shadow-orange-900/5 hover:-translate-y-1 hover:border-orange-200 transition-all duration-300 flex flex-col overflow-hidden">
                            {/* Decorative background glow on hover */}
                            <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 bg-orange-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

                            <div className="flex items-start justify-between mb-4 relative">
                                <div className="flex items-center gap-3.5 min-w-0">
                                    <div className="shrink-0 h-11 w-11 bg-gradient-to-br from-orange-100 to-orange-50 text-orange-600 rounded-full flex items-center justify-center font-bold ring-4 ring-orange-50 shadow-inner">
                                        {initials}
                                    </div>
                                    <div className="min-w-0 flex flex-col items-start">
                                        <h3 className="text-[15px] font-bold text-slate-900 truncate w-full" title={visitor.visitorName}>{visitor.visitorName}</h3>
                                        <span className="text-[10px] font-bold tracking-wider uppercase text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full mt-0.5">
                                            {visitor.visitorType === 'OTHER' ? visitor.customVisitorType || 'OTHER' : visitor.visitorType}
                                        </span>
                                    </div>
                                </div>
                                <StatusBadge 
                                    status={visitor.status === 'APPROVED' ? 'WAITING' : 'INSIDE'} 
                                    className={visitor.status === 'APPROVED' ? 'text-[10px] px-2 py-0 bg-amber-100 text-amber-800 border-amber-200/60' : 'text-[10px] px-2 py-0 bg-emerald-100 text-emerald-800 border-emerald-200/60'}
                                />
                            </div>

                            <div className="bg-slate-50/70 rounded-xl p-3.5 space-y-2.5 mt-auto mb-5 text-[13px] text-slate-600 border border-slate-100/80 relative">
                                {visitor.hostResidentId && visitor.hostResidentId.residentCode && (
                                    <div className="flex items-center gap-2.5">
                                        <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                                        <span className="truncate font-medium text-slate-700">Host: Unit {visitor.hostUnitId?.unitNumber || visitor.hostResidentId.residentCode}</span>
                                    </div>
                                )}
                                {visitor.status === 'INSIDE' && visitor.entryTime && (
                                    <div className="flex items-center gap-2.5">
                                        <Clock className="h-4 w-4 text-emerald-500 shrink-0" />
                                        <span className="font-medium text-slate-700">Entered at {new Date(visitor.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                )}
                                {visitor.status === 'APPROVED' && (
                                    <div className="flex items-center gap-2.5">
                                        <Clock className="h-4 w-4 text-amber-500 shrink-0" />
                                        <span className="font-medium text-slate-700">Waiting at Gate</span>
                                    </div>
                                )}
                            </div>

                            {visitor.status === 'APPROVED' ? (
                                <Button 
                                    size="sm"
                                    onClick={() => handleLogEntry(visitor._id)}
                                    disabled={loadingId === visitor._id}
                                    isLoading={loadingId === visitor._id}
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-900/20 text-white border-0 transition-all duration-300 group/btn"
                                >
                                    <LogIn className="h-4 w-4 mr-2 group-hover/btn:translate-x-1 transition-transform" /> Grant Entry
                                </Button>
                            ) : (
                                <Button 
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => handleLogExit(visitor._id)}
                                    disabled={loadingId === visitor._id}
                                    isLoading={loadingId === visitor._id}
                                    className="w-full bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 hover:shadow-sm text-slate-700 transition-all duration-300 group/btn"
                                >
                                    <LogOut className="h-4 w-4 mr-2 group-hover/btn:-translate-x-1 transition-transform text-slate-500" /> Log Exit
                                </Button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
