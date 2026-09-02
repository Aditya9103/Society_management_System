import React from 'react';
import { Activity, Clock } from 'lucide-react';
import Card from '../../../../../components/ui/Card';

export default function ActivityLogTab({ user }) {
    // Dummy activity log data since backend doesn't track this deeply yet
    const logs = [
        { id: 1, action: 'Logged into the system', time: new Date(Date.now() - 3600000).toLocaleString() },
        { id: 2, action: 'Updated profile information', time: new Date(Date.now() - 86400000).toLocaleString() },
        { id: 3, action: 'Account created', time: new Date(user.createdAt).toLocaleString() },
    ];

    return (
        <Card className="bg-[#151921] border-white/5">
            <Card.Body className="p-6">
                <div className="flex items-center gap-2 mb-6">
                    <Activity className="w-5 h-5 text-sky-500" />
                    <h3 className="text-lg font-bold text-white">Activity Log</h3>
                </div>
                
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
                    {logs.map((log, index) => (
                        <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-[#1a1f2c] text-sky-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                <Clock className="w-4 h-4" />
                            </div>
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-white/5 bg-white/[0.02] shadow">
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className="font-bold text-gray-200 text-sm">{log.action}</h4>
                                </div>
                                <div className="text-xs text-gray-200 font-bold">{log.time}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </Card.Body>
        </Card>
    );
}
