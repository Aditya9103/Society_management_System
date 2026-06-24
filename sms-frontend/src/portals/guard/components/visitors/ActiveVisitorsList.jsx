import React from 'react';
import { useGetGuardActiveVisitorsQuery, useGuardLogExitMutation, useGuardLogEntryMutation } from '../../../../store/api/staffApi';
import { LogOut, LogIn, User, Clock, MapPin } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import StatusBadge from '../../../../components/ui/StatusBadge';

export default function ActiveVisitorsList() {
    const { data, isLoading, isError, refetch } = useGetGuardActiveVisitorsQuery(undefined, {
        pollingInterval: 5000,
        refetchOnMountOrArgChange: true,
    });
    const [logExit, { isLoading: isLoggingExit }] = useGuardLogExitMutation();
    const [logEntry, { isLoading: isLoggingEntry }] = useGuardLogEntryMutation();

    const visitors = data?.data?.visitors || [];

    const handleLogExit = async (visitorId) => {
        try {
            await logExit({ id: visitorId }).unwrap();
            alert('Exit logged successfully!');
        } catch (err) {
            alert('Failed to log exit: ' + (err.data?.message || err.message));
        }
    };

    const handleLogEntry = async (visitorId) => {
        try {
            await logEntry({ id: visitorId }).unwrap();
            alert('Entry logged successfully!');
        } catch (err) {
            alert('Failed to log entry: ' + (err.data?.message || err.message));
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
                {visitors.map(visitor => (
                    <div key={visitor._id} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="shrink-0 h-10 w-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold">
                                    <User className="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-bold text-slate-900 truncate" title={visitor.visitorName}>{visitor.visitorName}</h3>
                                    <p className="text-xs font-semibold text-slate-500">{visitor.visitorType}</p>
                                </div>
                            </div>
                            <StatusBadge 
                                status={visitor.status === 'APPROVED' ? 'PENDING' : 'INSIDE'} 
                                className={visitor.status === 'APPROVED' ? 'bg-amber-100 text-amber-800 ring-amber-200' : 'bg-emerald-100 text-emerald-800 ring-emerald-200'}
                            />
                        </div>

                        <div className="space-y-2 mt-4 text-sm text-slate-600">
                            {visitor.hostResidentId && visitor.hostResidentId.residentCode && (
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                                    <span className="truncate">Host: Unit {visitor.hostUnitId?.unitNumber || visitor.hostResidentId.residentCode}</span>
                                </div>
                            )}
                            {visitor.status === 'INSIDE' && visitor.entryTime && (
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                                    <span>Entered: {new Date(visitor.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            )}
                            {visitor.status === 'APPROVED' && (
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                                    <span>Waiting for Entry</span>
                                </div>
                            )}
                        </div>

                        {visitor.status === 'APPROVED' ? (
                            <Button 
                                onClick={() => handleLogEntry(visitor._id)}
                                disabled={isLoggingEntry}
                                isLoading={isLoggingEntry}
                                className="mt-5 w-full bg-emerald-600 hover:bg-emerald-700 text-white border-0"
                            >
                                <LogIn className="h-4 w-4 mr-2" /> Grant Entry
                            </Button>
                        ) : (
                            <Button 
                                variant="secondary"
                                onClick={() => handleLogExit(visitor._id)}
                                disabled={isLoggingExit}
                                isLoading={isLoggingExit}
                                className="mt-5 w-full"
                            >
                                <LogOut className="h-4 w-4 mr-2" /> Log Exit
                            </Button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
