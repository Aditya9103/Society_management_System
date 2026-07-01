import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import { getSocket } from '../../socket/socketClient';
import { vehicleApi } from '../../store/api/vehicleApi';
import { pollApi } from '../../store/api/pollApi';
import { facilityApi } from '../../store/api/facilityApi';

import UrgentNoticeToast from './UrgentNoticeToast';

let sharedAudioCtx = null;

const playShortSiren = async () => {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;

        if (!sharedAudioCtx) {
            sharedAudioCtx = new AudioContext();
        }
        const ctx = sharedAudioCtx;

        if (ctx.state === 'suspended') {
            await ctx.resume();
        }

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(1000, ctx.currentTime + 0.5);
        osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 1.0);
        osc.frequency.linearRampToValueAtTime(1000, ctx.currentTime + 1.5);
        osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 2.0);
        osc.frequency.linearRampToValueAtTime(1000, ctx.currentTime + 2.5);
        osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 3.0);

        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, ctx.currentTime + 2.9);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 3.0);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 3.0);
    } catch (err) {
        console.warn("Audio autoplay blocked by browser until user interacts.", err);
    }
};

export default function GlobalSocketListener() {
    const { isAuthenticated } = useSelector(state => state.auth);
    const dispatch = useDispatch();

    useEffect(() => {
        if (!isAuthenticated) return;

        const token = localStorage.getItem('accessToken');
        if (token) {
            import('../../socket/socketClient').then(({ updateSocketToken }) => {
                updateSocketToken(token);
            });
        }

        const socket = getSocket();
        if (!socket) return;

        const handleUrgentNotice = (data) => {
            console.log('🚨 Received URGENT_NOTICE:', data);
            playShortSiren();
            toast.custom(
                (t) => <UrgentNoticeToast t={t} data={data} />,
                { duration: 15000, position: 'top-center' }
            );
        };

        const handleNewNotification = (data) => {
            console.log('🔔 Received NEW_NOTIFICATION:', data);

            // Invalidate relevant RTK Query caches to trigger automatic UI refreshes
            if (data.type?.startsWith('VEHICLE_')) {
                dispatch(vehicleApi.util.invalidateTags(['Vehicle', 'Parking']));
            }
            if (data.type?.startsWith('POLL_')) {
                dispatch(pollApi.util.invalidateTags(['Poll']));
            }

            toast(
                (t) => (
                    <div className="relative pr-6">
                        <button
                            onClick={() => toast.dismiss(t.id)}
                            className="absolute -top-1 -right-4 p-1 text-slate-400 hover:text-slate-700 rounded-full cursor-pointer transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <strong>{data.title}</strong>
                        <p className="text-sm">{data.message}</p>
                    </div>
                ),
                { icon: '🔔', duration: 4000, position: 'top-center' }
            );
        };

        socket.on('URGENT_NOTICE', handleUrgentNotice);
        socket.on('NEW_NOTIFICATION', handleNewNotification);

        const handleEmergencyAlarm = (data) => {
            playShortSiren();
            toast.custom(
                (t) => (
                    <div className="bg-red-600 text-white p-6 rounded-2xl shadow-2xl border-4 border-red-500/50 min-w-[320px] animate-pulse relative">
                        <button
                            onClick={() => toast.dismiss(t.id)}
                            className="absolute top-2 right-2 p-1.5 text-white/70 hover:text-white bg-red-800/50 hover:bg-red-800 rounded-full transition-colors cursor-pointer"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <div className="flex items-center gap-4 mb-4 mt-2">
                            <span className="text-4xl">🚨</span>
                            <div>
                                <h3 className="font-extrabold text-xl uppercase tracking-widest text-red-50">SOS TRIGGERED</h3>
                                <p className="font-medium text-red-100">{data.type} ALERT</p>
                            </div>
                        </div>
                        <div className="bg-red-700/50 p-4 rounded-xl mb-4">
                            <p className="text-sm font-semibold">{data.location}</p>
                        </div>
                        <button
                            onClick={() => toast.dismiss(t.id)}
                            className="w-full bg-white text-red-700 hover:bg-red-50 font-bold py-3 rounded-xl transition-all active:scale-95"
                        >
                            Acknowledge Alert
                        </button>
                    </div>
                ),
                { duration: Infinity, position: 'top-center', id: `emergency-${data.emergencyId}` } // Never auto-close emergency alarms
            );
        };

        const handleEmergencyUpdated = (data) => {
            // Dismiss the loud alarm if it's resolved or responding
            toast.dismiss(`emergency-${data.emergencyId}`);
            toast.success(
                (t) => (
                    <div className="flex items-center justify-between w-full gap-4">
                        <span>Emergency status updated to {data.status}</span>
                        <button
                            onClick={() => toast.dismiss(t.id)}
                            className="text-slate-400 hover:text-slate-700 p-1 -mr-2 rounded-full transition-colors cursor-pointer"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                ),
                { icon: '🛡️' }
            );
        };

        const handlePollEvent = (data) => {
            console.log('📊 Poll event received:', data);
            dispatch(pollApi.util.invalidateTags(['Poll']));
        };

        const handleAmenityUpdated = () => {
            console.log('🏢 Amenity/Booking update received');
            dispatch(facilityApi.util.invalidateTags(['Booking', 'Amenity']));
        };

        socket.on('EMERGENCY_ALARM', handleEmergencyAlarm);
        socket.on('EMERGENCY_UPDATED', handleEmergencyUpdated);
        socket.on('POLL_CREATED', handlePollEvent);
        socket.on('POLL_UPDATED', handlePollEvent);
        socket.on('POLL_CLOSED', handlePollEvent);
        socket.on('AMENITY_UPDATED', handleAmenityUpdated);

        return () => {
            socket.off('URGENT_NOTICE', handleUrgentNotice);
            socket.off('NEW_NOTIFICATION', handleNewNotification);
            socket.off('EMERGENCY_ALARM', handleEmergencyAlarm);
            socket.off('EMERGENCY_UPDATED', handleEmergencyUpdated);
            socket.off('POLL_CREATED', handlePollEvent);
            socket.off('POLL_UPDATED', handlePollEvent);
            socket.off('POLL_CLOSED', handlePollEvent);
            socket.off('AMENITY_UPDATED', handleAmenityUpdated);
        };
    }, [isAuthenticated]);

    return null; // This component doesn't render anything visible
}
