import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Activity, Hourglass, CheckCircle, Archive, Search, Filter, ChevronDown, List, Grid, Mic, Plus, Eye, MoreVertical, Building2, User } from 'lucide-react';
import { useGetAllEmergenciesQuery } from '../../../store/api/emergencyApi';
import { getSocket } from '../../../socket/socketClient';

const StatCard = ({ icon: Icon, title, value, subtitle, iconBg, iconColor, gradient, onClick }) => (
    <div 
        onClick={onClick}
        className={`relative overflow-hidden rounded-[20px] bg-gradient-to-br ${gradient} border border-white/5 p-5 flex flex-col justify-between shadow-lg cursor-pointer hover:scale-[1.02] hover:shadow-xl transition-all duration-300 ring-1 ring-white/5 hover:ring-white/20`}
    >
        <div className="absolute right-0 bottom-0 opacity-20 pointer-events-none">
            <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 80C30 50 60 80 120 20L120 80H0Z" fill="currentColor" className="text-white" />
                <path d="M20 80C50 40 80 70 120 0L120 80H20Z" fill="currentColor" className="text-white opacity-50" />
            </svg>
        </div>
        <div className="relative z-10 flex flex-col gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBg} backdrop-blur-md border border-white/10`}>
                <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>
            <div>
                <p className="text-[11px] font-semibold text-white/80 mb-1 uppercase tracking-wider">{title}</p>
                <div className="text-3xl font-bold text-white tracking-tight mb-1">{value}</div>
                <p className="text-[10px] text-white/50 font-medium">{subtitle}</p>
            </div>
        </div>
    </div>
);

export default function StaffEmergencyPage() {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [isMuted, setIsMuted] = useState(false);

    const audioCtxRef = useRef(null);
    const intervalRef = useRef(null);
    const tableRef = useRef(null);

    const { data: res, isLoading, refetch } = useGetAllEmergenciesQuery({ page, limit: 10, status: statusFilter });

    const emergencies = res?.data?.emergencies || [];
    const stats = res?.data?.stats || { total: 0, live: 0, inProgress: 0, resolved: 0, closed: 0 };
    const pagination = res?.data?.pagination || { total: 0, totalPages: 1 };

    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;
        const handleEvent = () => refetch();
        socket.on('EMERGENCY_ALARM', handleEvent);
        socket.on('EMERGENCY_UPDATED', handleEvent);
        return () => {
            socket.off('EMERGENCY_ALARM', handleEvent);
            socket.off('EMERGENCY_UPDATED', handleEvent);
        };
    }, [refetch]);

    const hasActiveEmergency = stats.live > 0;

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
                    } catch (err) {}
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

    const filteredEmergencies = useMemo(() => {
        if (!searchQuery) return emergencies;
        return emergencies.filter(em => 
            em._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            em.emergencyType.toLowerCase().includes(searchQuery.toLowerCase()) ||
            em.locationDescription?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [emergencies, searchQuery]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'ACTIVE': return 'bg-red-900/50 text-red-500 border border-red-500/30';
            case 'RESPONDING': return 'bg-orange-900/50 text-orange-500 border border-orange-500/30';
            case 'UNDER_CONTROL': return 'bg-yellow-900/50 text-yellow-500 border border-yellow-500/30';
            case 'RESOLVED': return 'bg-emerald-900/50 text-emerald-500 border border-emerald-500/30';
            default: return 'bg-slate-800 text-slate-400 border border-slate-700';
        }
    };

    const getPriority = (type) => {
        const high = ['MEDICAL', 'FIRE', 'SECURITY_BREACH', 'GAS_LEAK', 'NATURAL_DISASTER'];
        const medium = ['WATER_CRISIS', 'ACCIDENT', 'PANIC'];
        if (high.includes(type)) return { label: 'High', color: 'text-red-500', dot: 'bg-red-500' };
        if (medium.includes(type)) return { label: 'Medium', color: 'text-orange-500', dot: 'bg-orange-500' };
        return { label: 'Low', color: 'text-blue-500', dot: 'bg-blue-500' };
    };

    const handleFilterClick = (status) => {
        setStatusFilter(status);
        tableRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-900/20 border border-red-500/30 flex items-center justify-center">
                        <ShieldAlert className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white mb-0.5">Emergencies (Staff)</h1>
                        <p className="text-slate-400 text-sm">Monitor, respond to, and manage emergency incidents</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button 
                        onClick={() => setIsMuted(!isMuted)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#131525] border border-slate-700 text-slate-300 px-4 py-2 rounded-lg text-sm hover:border-slate-600 transition-colors"
                    >
                        {isMuted ? 'Unmute Alarm' : 'Mute Alarm'}
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <StatCard 
                    icon={ShieldAlert} title="Total Emergencies" value={stats.total} subtitle="All time"
                    iconBg="bg-red-900/40" iconColor="text-red-500" gradient="from-[#2a1318] to-[#1a0e13]"
                    onClick={() => handleFilterClick('ALL')}
                />
                <StatCard 
                    icon={Activity} title="Live / Active" value={stats.live} subtitle="Require attention"
                    iconBg="bg-orange-900/40" iconColor="text-orange-500" gradient="from-[#2e1d14] to-[#1d140f]"
                    onClick={() => handleFilterClick('ACTIVE')}
                />
                <StatCard 
                    icon={Hourglass} title="In Progress" value={stats.inProgress} subtitle="Being handled"
                    iconBg="bg-purple-900/40" iconColor="text-purple-500" gradient="from-[#241530] to-[#160f1f]"
                    onClick={() => handleFilterClick('RESPONDING')}
                />
                <StatCard 
                    icon={CheckCircle} title="Resolved" value={stats.resolved} subtitle="Successfully resolved"
                    iconBg="bg-emerald-900/40" iconColor="text-emerald-500" gradient="from-[#12281d] to-[#0d1a14]"
                    onClick={() => handleFilterClick('RESOLVED')}
                />
                <StatCard 
                    icon={Archive} title="Closed" value={stats.closed} subtitle="Archived incidents"
                    iconBg="bg-blue-900/40" iconColor="text-blue-500" gradient="from-[#142338] to-[#0e1724]"
                    onClick={() => handleFilterClick('RESOLVED')}
                />
            </div>

            {/* Main Table Section */}
            <div ref={tableRef} className="bg-[#1a1c29] border border-slate-800/50 rounded-2xl overflow-hidden flex flex-col min-h-[500px]">
                {/* Toolbar */}
                <div className="p-4 border-b border-slate-800/50 flex flex-col xl:flex-row gap-4 justify-between items-center bg-[#1a1c29]">
                    <div className="relative w-full xl:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search by ID, location, reported by..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#131525] border border-slate-800 text-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-[#6338f0]"
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
                        <select 
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            className="appearance-none bg-[#131525] border border-slate-800 text-slate-300 px-4 py-2 rounded-lg text-sm hover:border-slate-700 focus:outline-none min-w-[120px]"
                        >
                            <option value="ALL">All Status</option>
                            <option value="ACTIVE">Active</option>
                            <option value="RESPONDING">Responding</option>
                            <option value="RESOLVED">Resolved</option>
                        </select>
                        <select className="appearance-none bg-[#131525] border border-slate-800 text-slate-300 px-4 py-2 rounded-lg text-sm hover:border-slate-700 focus:outline-none min-w-[120px]">
                            <option>All Priority</option>
                            <option>High</option>
                            <option>Medium</option>
                            <option>Low</option>
                        </select>
                        <select className="appearance-none bg-[#131525] border border-slate-800 text-slate-300 px-4 py-2 rounded-lg text-sm hover:border-slate-700 focus:outline-none min-w-[130px]">
                            <option>All Categories</option>
                            <option>Medical</option>
                            <option>Fire</option>
                            <option>Security</option>
                        </select>
                        <button className="flex items-center gap-2 bg-[#131525] border border-slate-800 text-slate-300 px-4 py-2 rounded-lg text-sm hover:border-slate-700">
                            <Filter className="w-4 h-4" /> Filters <ChevronDown className="w-3 h-3 ml-1" />
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="p-8 text-center text-slate-500 animate-pulse">Loading emergencies...</div>
                    ) : filteredEmergencies.length === 0 ? (
                        <div className="p-12 text-center flex flex-col items-center">
                            <ShieldAlert className="w-12 h-12 text-slate-600 mb-4" />
                            <h3 className="text-lg font-bold text-white mb-1">No Emergencies Found</h3>
                            <p className="text-sm text-slate-400">Everything looks good right now.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse min-w-[1100px]">
                            <thead>
                                <tr className="border-b border-slate-800/50 bg-[#131525]/50">
                                    <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Emergency ID</th>
                                    <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Details</th>
                                    <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Location</th>
                                    <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Reported By</th>
                                    <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Priority</th>
                                    <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Reported On</th>
                                    <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Assigned To</th>
                                    <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEmergencies.map((em, index) => {
                                    const priorityInfo = getPriority(em.emergencyType);
                                    
                                    // Extract components for the new design
                                    const emId = `EMG-${new Date(em.createdAt).toISOString().slice(2,7).replace('-','')}-${em._id.slice(-3).toUpperCase()}`;
                                    const reportedByInitials = em.triggeredBy?.firstName ? em.triggeredBy.firstName[0] + (em.triggeredBy.lastName?.[0] || '') : 'R';
                                    const locationParts = em.locationDescription?.split(',') || ['Unknown'];
                                    const assignedStaff = em.responders?.length > 0 ? em.responders[0].userId : null;
                                    
                                    // Row styles
                                    const rowClasses = em.status === 'ACTIVE' 
                                        ? 'border-l-2 border-l-red-500 bg-red-900/5 hover:bg-red-900/10' 
                                        : em.status === 'RESPONDING'
                                            ? 'border-l-2 border-l-orange-500 hover:bg-[#202236]/50'
                                            : 'hover:bg-[#202236]/50';

                                    return (
                                        <tr key={em._id} onClick={() => navigate(`/staff/emergencies/${em._id}`)} className={`border-b border-slate-800/30 cursor-pointer group transition-colors ${rowClasses}`}>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                                        em.status === 'ACTIVE' ? 'bg-red-500/20 text-red-500' :
                                                        em.status === 'RESPONDING' ? 'bg-orange-500/20 text-orange-500' :
                                                        'bg-slate-700/50 text-slate-400'
                                                    }`}>
                                                        <ShieldAlert className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-bold text-white mb-1">{emId}</div>
                                                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${getStatusColor(em.status)}`}>
                                                            {em.status === 'ACTIVE' ? 'LIVE' : em.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="text-sm font-semibold text-white mb-0.5">{em.emergencyType.replace('_', ' ')}</div>
                                                <div className="text-xs text-slate-400 line-clamp-1 max-w-[200px]">{em.locationDescription}</div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
                                                    <div>
                                                        <div className="text-sm font-medium text-slate-300">{locationParts[locationParts.length-1]?.trim() || 'Unknown'}</div>
                                                        {locationParts.length > 1 && (
                                                            <div className="text-xs text-slate-500">{locationParts[0]?.trim()}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2">
                                                    {em.triggeredBy?.profilePhotoUrl ? (
                                                        <img src={em.triggeredBy.profilePhotoUrl} alt="user" className="w-7 h-7 rounded-full object-cover shrink-0" />
                                                    ) : (
                                                        <div className="w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px] font-bold shrink-0">
                                                            {reportedByInitials}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="text-sm font-medium text-slate-300">{em.triggeredBy?.firstName} {em.triggeredBy?.lastName}</div>
                                                        <div className="text-[10px] text-slate-500 uppercase">Resident</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${priorityInfo.dot}`}></div>
                                                    <span className="text-sm text-slate-300">{priorityInfo.label}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`text-[10px] font-bold px-2 py-1 rounded border ${getStatusColor(em.status)}`}>
                                                    {em.status === 'ACTIVE' ? 'Live' : em.status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2 text-slate-300 text-xs">
                                                    <div>
                                                        <div>{new Date(em.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                                        <div className="text-slate-500 mt-0.5">{new Date(em.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                {assignedStaff ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
                                                            <User className="w-3 h-3 text-slate-300" />
                                                        </div>
                                                        <div>
                                                            <div className="text-xs font-medium text-slate-300">{assignedStaff.firstName} {assignedStaff.lastName}</div>
                                                            <div className="text-[9px] text-slate-500">{assignedStaff.role?.replace('_', ' ')}</div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-500 italic">Unassigned</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                                                    <button onClick={() => navigate(`/staff/emergencies/${em._id}`)} className="p-1.5 text-slate-500 hover:text-white bg-[#131525] hover:bg-slate-700 border border-slate-800 rounded transition-colors">
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
                
                {/* Pagination (Mock implementation for now) */}
                {!isLoading && filteredEmergencies.length > 0 && (
                    <div className="p-4 border-t border-slate-800/50 bg-[#131525]/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-400 mt-auto">
                        <div>Showing 1 to {filteredEmergencies.length} of {stats.total} emergencies</div>
                        <div className="flex items-center gap-2">
                            <button className="w-8 h-8 rounded border border-slate-700/50 flex items-center justify-center hover:bg-slate-800 hover:text-white">&lt;</button>
                            <button className="w-8 h-8 rounded bg-[#6338f0] text-white flex items-center justify-center font-bold">1</button>
                            <button className="w-8 h-8 rounded border border-slate-700/50 flex items-center justify-center hover:bg-slate-800 hover:text-white">2</button>
                            <button className="w-8 h-8 rounded border border-slate-700/50 flex items-center justify-center hover:bg-slate-800 hover:text-white">3</button>
                            <span className="px-1">...</span>
                            <button className="w-8 h-8 rounded border border-slate-700/50 flex items-center justify-center hover:bg-slate-800 hover:text-white">&gt;</button>
                            <select className="ml-4 bg-[#1a1c29] border border-slate-700/50 rounded-lg px-3 py-1.5 focus:outline-none">
                                <option>Rows per page: 10</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
