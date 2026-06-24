import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { getSocket } from '../../socket/socketClient';

import UrgentNoticeToast from './UrgentNoticeToast';

export default function GlobalSocketListener() {
    const { isAuthenticated } = useSelector(state => state.auth);

    useEffect(() => {
        if (!isAuthenticated) return;

        const socket = getSocket();
        if (!socket) return;

        const handleUrgentNotice = (data) => {
            toast.custom(
                (t) => <UrgentNoticeToast t={t} data={data} />,
                { duration: 15000, position: 'top-center' }
            );
        };

        const handleNewNotification = (data) => {
            // Only toast if it's high priority or maybe just a subtle success
            if (data.priority === 'HIGH') {
                toast(
                    (t) => (
                        <div>
                            <strong>{data.title}</strong>
                            <p className="text-sm">{data.message}</p>
                        </div>
                    ),
                    { icon: '🔔', duration: 5000 }
                );
            }
        };

        socket.on('URGENT_NOTICE', handleUrgentNotice);
        socket.on('NEW_NOTIFICATION', handleNewNotification);

        return () => {
            socket.off('URGENT_NOTICE', handleUrgentNotice);
            socket.off('NEW_NOTIFICATION', handleNewNotification);
        };
    }, [isAuthenticated]);

    return null; // This component doesn't render anything visible
}
