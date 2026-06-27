import React, { useState, useEffect, useRef } from 'react';
import { ShieldAlert, CheckCircle, Mic, Info, Volume2, VolumeX } from 'lucide-react';
import { useGetActiveEmergenciesQuery, useUpdateEmergencyStatusMutation, useBroadcastUpdateMutation } from '../../../store/api/emergencyApi';
import toast from 'react-hot-toast';
import { getSocket } from '../../../socket/socketClient';

export default function AdminEmergencyPage() {
    const { data: res, isLoading, refetch } = useGetActiveEmergenciesQuery();
    const [updateStatus, { isLoading: isUpdating }] = useUpdateEmergencyStatusMutation();
    const [broadcastUpdate, { isLoading: isBroadcasting }] = useBroadcastUpdateMutation();

    const [broadcastMsg, setBroadcastMsg] = useState('');
    const [showBroadcastModal, setShowBroadcastModal] = useState(false);
    const [isMuted, setIsMuted] = useState(false);

    const audioCtxRef = useRef(null);
    const intervalRef = useRef(null);

    const emergencies = res?.data?.emergencies || [];

    // Listen for socket events to automatically refetch the dashboard!
    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;

        const handleEmergencyEvent = () => {
            refetch();
        };

        socket.on('EMERGENCY_ALARM', handleEmergencyEvent);
        socket.on('EMERGENCY_UPDATED', handleEmergencyEvent);

        return () => {
            socket.off('EMERGENCY_ALARM', handleEmergencyEvent);
            socket.off('EMERGENCY_UPDATED', handleEmergencyEvent);
        };
    }, [refetch]);

    // Play siren if there are active emergencies
    const hasActiveEmergency = emergencies.some(em => em.status === 'ACTIVE');

    useEffect(() => {
        if (hasActiveEmergency && !isMuted) {
            if (!intervalRef.current) {
                intervalRef.current = setInterval(() => {
                    try {
                        const AudioContext = window.AudioContext || window.webkitAudioContext;
                        if (!AudioContext) return;
                        if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();

                        const ctx = audioCtxRef.current;
                        if (ctx.state === 'suspended') ctx.resume();

                        const osc = ctx.createOscillator();
                        const gain = ctx.createGain();

                        osc.type = 'square';
                        osc.frequency.setValueAtTime(600, ctx.currentTime);
                        osc.frequency.linearRampToValueAtTime(1000, ctx.currentTime + 0.3);
                        osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.6);

                        gain.gain.setValueAtTime(0, ctx.currentTime);
                        gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.1);
                        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);

                        osc.connect(gain);
                        gain.connect(ctx.destination);

                        osc.start();
                        osc.stop(ctx.currentTime + 0.6);
                    } catch (err) {
                        console.warn("Audio autoplay blocked by browser until user interacts.", err);
                    }
                }, 1000);
            }
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [hasActiveEmergency, isMuted]);

    const handleUpdateStatus = async (id, status) => {
        try {
            await updateStatus({ id, status }).unwrap();
            toast.success(`Emergency marked as ${status}`);
        } catch (error) {
            toast.error(error.data?.message || 'Failed to update status');
        }
    };

    const handleBroadcast = async () => {
        if (!broadcastMsg) return;
        try {
            await broadcastUpdate({ message: broadcastMsg }).unwrap();
            toast.success('Broadcast sent to all residents');
            setShowBroadcastModal(false);
            setBroadcastMsg('');
        } catch (error) {
            toast.error(error.data?.message || 'Failed to send broadcast');
        }
    };

    if (isLoading) return <div className="p-8 text-center text-slate-500">Loading Dashboard...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <ShieldAlert className="w-8 h-8 text-red-600 animate-pulse" />
                        Live Emergency Dashboard
                    </h1>
                    <p className="text-sm text-slate-500">Monitor and respond to active emergencies</p>
                </div>
                <div className="flex gap-3">
                    {hasActiveEmergency && (
                        <button
                            onClick={() => setIsMuted(!isMuted)}
                            className={`btn flex items-center gap-2 px-4 py-2 rounded-lg transition ${isMuted ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-red-100 text-red-700 hover:bg-red-200 animate-pulse'
                                }`}
                        >
                            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                            {isMuted ? 'Unmute Siren' : 'Mute Siren'}
                        </button>
                    )}
                    <button
                        onClick={() => setShowBroadcastModal(true)}
                        className="btn btn-primary flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg transition"
                    >
                        <Mic className="w-5 h-5" />
                        Broadcast Update
                    </button>
                </div>
            </div>

            {/* Active Emergencies List */}
            {emergencies.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
                    <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-slate-700">All Clear</h2>
                    <p className="text-slate-500">There are no active emergencies right now.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {emergencies.map(em => (
                        <div key={em._id} className={`bg-white rounded-2xl shadow-sm border-2 overflow-hidden ${em.status === 'ACTIVE' ? 'border-red-500 animate-pulse-border' : 'border-orange-400'}`}>
                            <div className={`px-6 py-4 border-b ${em.status === 'ACTIVE' ? 'bg-red-50 border-red-100' : 'bg-orange-50 border-orange-100'} flex justify-between items-center`}>
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${em.status === 'ACTIVE' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                                        <ShieldAlert className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">
                                            {em.emergencyType} - {em.status}
                                        </h3>
                                        <p className="text-sm text-slate-600">
                                            Triggered by {em.triggeredBy?.firstName} {em.triggeredBy?.lastName} ({em.triggeredBy?.residentCode})
                                        </p>
                                    </div>
                                </div>
                                <div className="text-sm text-slate-500">
                                    {new Date(em.createdAt).toLocaleTimeString()}
                                </div>
                            </div>

                            <div className="p-6 flex flex-col md:flex-row justify-between gap-6">
                                <div className="space-y-4 flex-1">
                                    <div className="flex items-start gap-2">
                                        <Info className="w-5 h-5 text-slate-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-slate-700">Location</p>
                                            <p className="text-slate-900">{em.locationDescription}</p>
                                        </div>
                                    </div>

                                    {em.responders && em.responders.length > 0 && (
                                        <div>
                                            <p className="text-sm font-medium text-slate-700 mb-2">Responders</p>
                                            <div className="flex flex-wrap gap-2">
                                                {em.responders.map((r, idx) => (
                                                    <span key={idx} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
                                                        {r.userId?.firstName} {r.userId?.lastName} ({r.userId?.role?.replace('_', ' ')})
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col gap-3 min-w-[200px]">
                                    {em.status === 'ACTIVE' && (
                                        <button
                                            disabled={isUpdating}
                                            onClick={() => handleUpdateStatus(em._id, 'RESPONDING')}
                                            className="w-full px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition"
                                        >
                                            Mark as Responding
                                        </button>
                                    )}
                                    <button
                                        disabled={isUpdating}
                                        onClick={() => handleUpdateStatus(em._id, 'RESOLVED')}
                                        className="w-full px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition"
                                    >
                                        Mark as Resolved
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Broadcast Modal */}
            {showBroadcastModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100">
                            <h2 className="text-xl font-bold text-slate-900">Broadcast Security Update</h2>
                            <p className="text-sm text-slate-500 mt-1">This will send a high-priority push notification to all residents.</p>
                        </div>
                        <div className="p-6">
                            <textarea
                                value={broadcastMsg}
                                onChange={(e) => setBroadcastMsg(e.target.value)}
                                placeholder="E.g., Society under lockdown, please stay indoors."
                                className="w-full h-32 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                            />
                        </div>
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                            <button
                                onClick={() => setShowBroadcastModal(false)}
                                className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg font-medium transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleBroadcast}
                                disabled={!broadcastMsg || isBroadcasting}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition disabled:opacity-50"
                            >
                                {isBroadcasting ? 'Sending...' : 'Send Broadcast'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
