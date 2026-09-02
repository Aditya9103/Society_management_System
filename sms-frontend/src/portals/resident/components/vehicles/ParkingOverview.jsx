import React from 'react';
import { Car, ChevronDown } from 'lucide-react';

export default function ParkingOverview({ vehicles, parkingData = [] }) {
    
    // Calculate stats dynamically from parkingData
    const occupiedCount = parkingData.filter(slot => slot.status === 'OCCUPIED' || slot.assignedVehicleId).length;
    const reservedCount = parkingData.filter(slot => slot.status === 'RESERVED').length;
    const availableCount = parkingData.filter(slot => slot.status === 'AVAILABLE' && !slot.assignedVehicleId).length;
    const totalSlots = parkingData.length || 1; // Prevent division by zero

    const stats = {
        occupied: { count: occupiedCount, percentage: Math.round((occupiedCount / totalSlots) * 100) || 0, color: 'text-indigo-500', bg: 'bg-indigo-500' },
        available: { count: availableCount, percentage: Math.round((availableCount / totalSlots) * 100) || 0, color: 'text-sky-500', bg: 'bg-sky-500' },
        reserved: { count: reservedCount, percentage: Math.round((reservedCount / totalSlots) * 100) || 0, color: 'text-pink-500', bg: 'bg-pink-500' }
    };

    // Calculate conic gradient for the donut chart based on percentages
    const total = stats.occupied.percentage + stats.available.percentage + stats.reserved.percentage || 1;
    const p1 = (stats.occupied.percentage / total) * 100;
    const p2 = p1 + (stats.available.percentage / total) * 100;
    const gradient = `conic-gradient(from 0deg, #6366f1 0% ${p1}%, #0ea5e9 ${p1}% ${p2}%, #ec4899 ${p2}% 100%)`;

    return (
        <div className="bg-[#131525] rounded-xl border border-white/5 p-6 shadow-xl flex flex-col md:flex-row gap-8 items-center relative overflow-hidden mt-6">
            {/* Left side: Stats & Chart */}
            <div className="flex items-center gap-6 w-full md:w-auto mt-4 md:mt-0">
                <div className="relative w-32 h-32 flex-shrink-0">
                    <div 
                        className="absolute inset-0 rounded-full"
                        style={{ background: gradient }}
                    ></div>
                    <div className="absolute inset-3 bg-[#131525] rounded-full"></div>
                </div>
                <div className="space-y-3 flex-1 min-w-[140px]">
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]"></span>
                            <span className="text-white font-bold">Occupied</span>
                        </div>
                        <span className="text-white font-bold tabular-nums">{stats.occupied.count} ({stats.occupied.percentage}%)</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.6)]"></span>
                            <span className="text-white font-bold">Available</span>
                        </div>
                        <span className="text-white font-bold tabular-nums">{stats.available.count} ({stats.available.percentage}%)</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.6)]"></span>
                            <span className="text-white font-bold">Reserved</span>
                        </div>
                        <span className="text-white font-bold tabular-nums">{stats.reserved.count} ({stats.reserved.percentage}%)</span>
                    </div>
                </div>
            </div>

            {/* Right side: Graphical Grid */}
            <div className="flex-1 w-full flex flex-col items-end relative">
                <button className="flex items-center gap-2 text-xs font-bold text-white font-bold bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors mb-4 mt-8 md:mt-0">
                    Basement Floor 1 <ChevronDown className="w-3.5 h-3.5" />
                </button>
                
                <div className="w-full max-w-[400px] h-32 relative border-t border-b border-dashed border-white/10">
                    {/* Parking Slots Representation */}
                    <div className="absolute inset-0 flex justify-between px-2">
                        {/* Top row */}
                        <div className="flex gap-2">
                            {[...Array(5)].map((_, i) => (
                                <div key={`t-${i}`} className="w-10 h-14 border-b-0 border-l border-r border-t border-white/5 rounded-t-lg relative mt-1 overflow-hidden">
                                    {i === 1 && <div className="absolute inset-1 bg-white/5 rounded flex items-center justify-center opacity-30"><Car size={16} /></div>}
                                    {i === 3 && <div className="absolute inset-1 bg-emerald-500/10 rounded flex items-center justify-center text-emerald-500"><Car size={16} /></div>}
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Road line */}
                    <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 border-t border-dashed border-white/10 opacity-50"></div>
                    {/* Bottom row */}
                    <div className="absolute inset-0 flex justify-between px-2 items-end">
                        <div className="flex gap-2">
                            {[...Array(5)].map((_, i) => (
                                <div key={`b-${i}`} className={`w-10 h-14 border-t-0 border-l border-r border-b rounded-b-lg relative mb-1 overflow-hidden transition-all
                                    ${i === 3 ? 'border-indigo-500/50 bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'border-white/5'}`}>
                                    {i === 0 && <div className="absolute inset-1 bg-white/5 rounded flex items-center justify-center opacity-30"><Car size={16} /></div>}
                                    {i === 2 && <div className="absolute inset-1 bg-emerald-500/10 rounded flex items-center justify-center text-emerald-500"><Car size={16} /></div>}
                                    {i === 3 && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-indigo-400 p-1">
                                            <Car size={20} className="mb-0.5 drop-shadow-[0_0_5px_rgba(99,102,241,0.8)]" />
                                            <span className="text-[8px] font-bold">B1-45</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Top left title overlay */}
            <div className="absolute top-4 left-6 flex items-center gap-2 text-sm font-semibold text-white">
                <Car className="w-4 h-4 text-indigo-400" /> Parking Overview
            </div>
        </div>
    );
}
