import { useState, useEffect, useRef } from 'react';
import { Bell, Check, Trash2, CheckCircle2 } from 'lucide-react';
import { 
    useGetNotificationsQuery, 
    useMarkAsReadMutation, 
    useMarkAllAsReadMutation,
    useDeleteNotificationMutation 
} from '../../store/api/notificationApi';
import { cn } from '../ui/Button';

export default function NotificationDropdown({ align = 'right' }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // RTK Query: automatically listens to cache updates and socket events we setup earlier
    const { data: notifData, isLoading } = useGetNotificationsQuery({ page: 1, limit: 10 });
    const rawData = notifData?.data;
    const notifications = Array.isArray(rawData?.data) ? rawData.data : (Array.isArray(rawData) ? rawData : []);
    const unreadCount = rawData?.unreadCount ?? 0;

    const [markAsRead] = useMarkAsReadMutation();
    const [markAllAsRead] = useMarkAllAsReadMutation();
    const [deleteNotification] = useDeleteNotificationMutation();

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkAsRead = (e, id) => {
        e.stopPropagation();
        markAsRead(id);
    };

    const handleDelete = (e, id) => {
        e.stopPropagation();
        deleteNotification(id);
    };

    const handleMarkAllRead = () => {
        markAllAsRead();
    };

    const handleNotificationClick = (notif) => {
        if (!notif.readAt) {
            markAsRead(notif._id);
        }
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* ── Bell Button ──────────────────────────────────────────── */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-800 hover:text-white"
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm ring-2 ring-slate-900">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* ── Dropdown Panel ───────────────────────────────────────── */}
            {isOpen && (
                <div className={cn(
                    "absolute top-12 z-50 w-80 md:w-96 rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/5 animate-in fade-in slide-in-from-top-2 overflow-hidden",
                    align === 'right' ? 'right-0' : 'left-0'
                )}>
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 bg-slate-50">
                        <div>
                            <h3 className="font-semibold text-slate-800">Notifications</h3>
                            <p className="text-xs text-slate-500">{unreadCount} unread</p>
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-indigo-600 transition hover:bg-indigo-50"
                            >
                                <CheckCircle2 className="h-3 w-3" />
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div className="max-h-[60vh] overflow-y-auto">
                        {isLoading ? (
                            <div className="flex h-32 items-center justify-center text-sm text-slate-400">Loading...</div>
                        ) : notifications.length === 0 ? (
                            <div className="flex h-32 items-center justify-center text-sm text-slate-400">No notifications</div>
                        ) : (
                            <ul className="divide-y divide-slate-100">
                                {notifications.map(notif => (
                                    <li 
                                        key={notif._id}
                                        onClick={() => handleNotificationClick(notif)}
                                        className={cn(
                                            "group relative flex cursor-pointer gap-3 p-4 transition hover:bg-slate-50",
                                            !notif.readAt && "bg-blue-50/50"
                                        )}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className={cn("text-sm mb-0.5", !notif.readAt ? "font-semibold text-slate-900" : "font-medium text-slate-700")}>
                                                {notif.title}
                                            </p>
                                            {notif.type === 'NOTICE_PUBLISHED' && (
                                                <p className="text-[10px] font-semibold text-indigo-600 mb-0.5 uppercase tracking-wider">
                                                    A new {notif.priority || 'NORMAL'} priority notice has been published.
                                                </p>
                                            )}
                                            <p className="text-xs text-slate-500 line-clamp-3">{notif.body}</p>
                                            <span className="text-[10px] text-slate-400 mt-1 block">
                                                {new Date(notif.createdAt).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex flex-col gap-2 shrink-0 opacity-0 transition group-hover:opacity-100">
                                            {!notif.readAt && (
                                                <button
                                                    onClick={(e) => handleMarkAsRead(e, notif._id)}
                                                    className="p-1 text-slate-400 hover:text-indigo-600 rounded-md hover:bg-indigo-50"
                                                    title="Mark as read"
                                                >
                                                    <Check className="h-4 w-4" />
                                                </button>
                                            )}
                                            <button
                                                onClick={(e) => handleDelete(e, notif._id)}
                                                className="p-1 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50"
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    
                    {/* Footer */}
                    <div className="border-t border-slate-100 px-4 py-2 text-center bg-slate-50">
                        <button 
                            className="text-xs font-medium text-slate-500 hover:text-slate-700"
                            onClick={() => setIsOpen(false)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
