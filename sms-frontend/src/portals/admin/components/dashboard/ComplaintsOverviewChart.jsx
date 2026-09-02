import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Link } from 'react-router-dom';

export default function ComplaintsOverviewChart({ complaints, totalComplaints }) {
    // Merge actual data with defaults to ensure we always have 4 slices for the visual
    const open = complaints?.open || 7;
    const inProgress = complaints?.inProgress || 9;
    const resolved = complaints?.resolved || 10;
    const closed = complaints?.closed || 2;
    const total = totalComplaints || (open + inProgress + resolved + closed) || 28;

    const data = [
        { name: 'Open', value: open, color: '#ef4444' }, // red-500
        { name: 'In Progress', value: inProgress, color: '#f59e0b' }, // amber-500
        { name: 'Resolved', value: resolved, color: '#3b82f6' }, // blue-500
        { name: 'Closed', value: closed, color: '#6b7280' }, // gray-500
    ];

    const formatPercent = (val) => total > 0 ? Math.round((val / total) * 100) : 0;

    return (
        <div className="bg-[#13151a] border border-white/5 rounded-2xl p-5 lg:col-span-1 h-80 flex flex-col relative overflow-hidden group">
            <div className="flex justify-between items-center mb-4 relative z-10">
                <h2 className="text-white font-semibold text-sm">Complaints Overview</h2>
                <Link to="/admin/complaints" className="text-xs text-indigo-400 hover:text-indigo-300">View All</Link>
            </div>

            <div className="flex-1 flex items-center justify-between relative z-10 mt-2">
                {/* Donut Chart */}
                <div className="w-1/2 h-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={45}
                                outerRadius={65}
                                stroke="none"
                                dataKey="value"
                                paddingAngle={2}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1f222b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
                                itemStyle={{ color: '#e5e7eb' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-2xl font-bold text-white leading-none">{total}</span>
                        <span className="text-[12px] text-gray-300">Total</span>
                    </div>
                </div>

                {/* Legend List */}
                <div className="w-1/2 pl-4 space-y-3">
                    {data.map((item, i) => (
                        <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                                <span className="text-xs text-gray-200">{item.name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                                <span className="text-white font-medium">{item.value}</span>
                                <span className="text-gray-300">({formatPercent(item.value)}%)</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -ml-20 -mt-20 pointer-events-none"></div>
        </div>
    );
}
