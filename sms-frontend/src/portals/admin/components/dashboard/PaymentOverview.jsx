import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function PaymentOverview({ payment }) {
    // Generate some mock historical data for the chart to look like the image,
    // scaling up to the current collected amount over the month.
    const collected = payment?.collectedThisMonth || 124500;
    const expected = payment?.expectedThisMonth || 160000;
    const percent = expected ? ((collected / expected) * 100).toFixed(1) : 0;
    
    // Mocking 30 days of gradual increase for the visual
    const data = Array.from({ length: 15 }, (_, i) => {
        const day = (i * 2) + 1;
        return {
            name: `${day} May`,
            Collected: Math.round((collected / 15) * (i + 1) + (Math.random() * 5000 - 2500)),
            Expected: Math.round((expected / 15) * (i + 1))
        };
    });
    
    // Fix the last point to exact collected amount
    if (data.length > 0) {
        data[data.length - 1].Collected = collected;
    }

    const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
    const formatYAxis = (val) => {
        if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`;
        if (val >= 1000) return `₹${(val / 1000).toFixed(0)}K`;
        return `₹${val}`;
    };

    return (
        <div className="bg-[#13151a] border border-white/5 rounded-2xl p-5 lg:col-span-1 h-80 flex flex-col relative overflow-hidden">
            <div className="flex justify-between items-start mb-2 relative z-10">
                <div>
                    <h2 className="text-white font-semibold mb-1">Payment Overview</h2>
                    <p className="text-xs text-gray-300 flex items-center gap-2">
                        {formatCurrency(collected)} collected of {formatCurrency(expected)}
                        <span className="text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded text-[12px]">↑ {percent}% vs last month</span>
                    </p>
                </div>
                <select className="bg-[#1a1d24] text-xs text-gray-200 border border-white/10 rounded-lg px-2 py-1 outline-none focus:border-indigo-500 cursor-pointer hover:bg-white/5 transition-colors">
                    <option>This Month</option>
                    <option>Last Month</option>
                    <option>This Year</option>
                </select>
            </div>

            <div className="flex-1 mt-4 relative z-10 w-[calc(100%+2rem)] -ml-4">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#9ca3af', fontSize: 10 }}
                            dy={10}
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#9ca3af', fontSize: 10 }} 
                            tickFormatter={formatYAxis}
                        />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#1f222b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
                            itemStyle={{ color: '#e5e7eb' }}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="Collected" 
                            stroke="#8b5cf6" 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#colorCollected)" 
                            activeDot={{ r: 6, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="flex justify-center gap-6 mt-2 relative z-10">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-1 bg-violet-500 rounded-full"></div>
                    <span className="text-[12px] text-gray-300">Collected</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-1 bg-gray-500 border border-gray-400 border-dashed rounded-full bg-transparent"></div>
                    <span className="text-[12px] text-gray-300">Expected</span>
                </div>
            </div>
            
            {/* Background ambient glow matching the image */}
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl -mr-20 -mb-20"></div>
        </div>
    );
}
