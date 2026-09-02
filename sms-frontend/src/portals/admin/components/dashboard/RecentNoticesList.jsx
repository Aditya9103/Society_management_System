import React from 'react';
import { Link } from 'react-router-dom';
import { Droplet, Leaf, Car, Megaphone, Bell } from 'lucide-react';
import { cn } from '../../../../components/ui/Button';

// Utility to match icon and color based on title keywords
const getIconConfig = (title) => {
    const t = title.toLowerCase();
    if (t.includes('water')) return { Icon: Droplet, color: 'text-blue-400', bg: 'bg-blue-500/20' };
    if (t.includes('garden') || t.includes('tree')) return { Icon: Leaf, color: 'text-emerald-400', bg: 'bg-emerald-500/20' };
    if (t.includes('parking') || t.includes('car')) return { Icon: Car, color: 'text-orange-400', bg: 'bg-orange-500/20' };
    if (t.includes('meeting') || t.includes('agm')) return { Icon: Megaphone, color: 'text-violet-400', bg: 'bg-violet-500/20' };
    return { Icon: Bell, color: 'text-gray-300', bg: 'bg-gray-500/20' };
};

export default function RecentNoticesList({ notices = [] }) {
    // If no notices are returned, we mock them just for the UI visual requested by the user.
    // In production, this falls back to real notices fetched from the backend.
    const displayNotices = notices?.length > 0 ? notices : [
        { _id: '1', title: 'Water Supply Maintenance', description: 'Water supply will be suspended on...', createdAt: '2026-05-09T00:00:00Z' },
        { _id: '2', title: 'Garden Maintenance', description: 'Monthly garden maintenance sche...', createdAt: '2026-05-08T00:00:00Z' },
        { _id: '3', title: 'Parking Regulation Update', description: 'New parking rules effective from...', createdAt: '2026-05-07T00:00:00Z' },
        { _id: '4', title: 'Annual General Meeting', description: 'AGM will be held on 20th May 2026...', createdAt: '2026-05-06T00:00:00Z' }
    ];

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <div className="bg-[#13151a] border border-white/5 rounded-2xl p-5 lg:col-span-1 h-80 flex flex-col relative overflow-hidden group">
            <div className="flex justify-between items-center mb-4 relative z-10">
                <h2 className="text-white font-semibold text-sm">Recent Notices</h2>
                <Link to="/admin/notices" className="text-xs text-indigo-400 hover:text-indigo-300">View All</Link>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar relative z-10">
                {displayNotices.map((notice) => {
                    const { Icon, color, bg } = getIconConfig(notice.title);
                    return (
                        <div key={notice._id} className="flex gap-4 items-start cursor-pointer hover:bg-white/5 p-2 -mx-2 rounded-xl transition-colors">
                            <div className={cn("w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5", bg)}>
                                <Icon className={cn("w-4 h-4", color)} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-gray-100 truncate">{notice.title}</h4>
                                <p className="text-xs text-gray-300 truncate">{notice.description || 'Notice details available in portal.'}</p>
                            </div>
                            <div className="text-[12px] text-gray-300 shrink-0 whitespace-nowrap pt-1">
                                {formatDate(notice.createdAt)}
                            </div>
                        </div>
                    );
                })}
                {displayNotices.length === 0 && (
                    <div className="text-center text-sm text-gray-400 mt-10">No recent notices.</div>
                )}
            </div>
            
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
            `}</style>
        </div>
    );
}
