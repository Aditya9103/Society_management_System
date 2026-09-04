import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Mic, UserPlus, CheckCircle, MapPin, ExternalLink, Activity, Clock, Users, Shield, Calendar, Phone, Share2, Info } from 'lucide-react';
import { useGetEmergencyByIdQuery, useUpdateEmergencyStatusMutation } from '../../../store/api/emergencyApi';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import toast from 'react-hot-toast';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function StaffEmergencyDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const { data: res, isLoading } = useGetEmergencyByIdQuery(id);
    const [updateStatus, { isLoading: isUpdating }] = useUpdateEmergencyStatusMutation();
    
    const emergency = res?.data?.emergency;

    if (isLoading) {
        return <div className="flex items-center justify-center min-h-[600px] text-slate-500 animate-pulse">Loading Emergency Details...</div>;
    }

    if (!emergency) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[600px] text-slate-500">
                <ShieldAlert className="w-16 h-16 text-slate-700 mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">Emergency Not Found</h2>
                <button onClick={() => navigate('/staff/emergencies')} className="text-[#6338f0] hover:underline">Back to Emergencies</button>
            </div>
        );
    }

    const emId = `EMG-${new Date(emergency.createdAt).toISOString().slice(2,7).replace('-','')}-${emergency._id.slice(-3).toUpperCase()}`;

    const handleResolve = async () => {
        try {
            await updateStatus({ id, status: 'RESOLVED', resolutionNotes: 'Resolved by staff on-site' }).unwrap();
            toast.success('Emergency marked as resolved');
        } catch (error) {
            toast.error(error.data?.message || 'Failed to resolve emergency');
        }
    };

    const handleRespond = async () => {
        try {
            await updateStatus({ id, status: 'RESPONDING' }).unwrap();
            toast.success('You are now responding to this emergency');
        } catch (error) {
            toast.error(error.data?.message || 'Failed to update status');
        }
    };

    const getPriorityInfo = (type) => {
        const high = ['MEDICAL', 'FIRE', 'SECURITY_BREACH', 'GAS_LEAK', 'NATURAL_DISASTER'];
        const medium = ['WATER_CRISIS', 'ACCIDENT', 'PANIC'];
        if (high.includes(type)) return { label: 'HIGH PRIORITY', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', gradient: 'from-[#2a1318] to-[#1a0e13]' };
        if (medium.includes(type)) return { label: 'MEDIUM PRIORITY', color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20', gradient: 'from-[#2e1d14] to-[#1d140f]' };
        return { label: 'LOW PRIORITY', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', gradient: 'from-[#142338] to-[#0e1724]' };
    };

    const priorityInfo = getPriorityInfo(emergency.emergencyType);

    // Timeline calculation
    const timeline = [];
    timeline.push({
        type: 'SOS',
        title: 'SOS Alert Triggered',
        desc: `Emergency SOS button pressed by ${emergency.triggeredBy?.firstName}`,
        time: emergency.createdAt,
        icon: ShieldAlert,
        color: 'text-red-500', bg: 'bg-red-500/20'
    });

    if (emergency.responders?.length > 0) {
        timeline.push({
            type: 'ASSIGNED',
            title: 'Staff Responding',
            desc: `${emergency.responders[0]?.userId?.firstName} & ${emergency.responders.length - 1} more staff assigned`,
            time: emergency.responders[0].respondedAt,
            icon: Users,
            color: 'text-orange-500', bg: 'bg-orange-500/20'
        });
    }

    if (emergency.updates?.length > 0) {
        emergency.updates.forEach(up => {
            let icon = Info;
            let color = 'text-blue-500';
            let bg = 'bg-blue-500/20';

            if (up.type === 'BROADCAST') {
                icon = Mic; color = 'text-purple-500'; bg = 'bg-purple-500/20';
            } else if (up.type === 'STATUS_CHANGE') {
                icon = Activity; color = 'text-emerald-500'; bg = 'bg-emerald-500/20';
            }

            timeline.push({
                type: up.type,
                title: up.type === 'BROADCAST' ? 'Broadcast Sent' : 'Update',
                desc: up.message,
                time: up.timestamp,
                icon, color, bg
            });
        });
    }

    if (emergency.status === 'RESOLVED') {
        timeline.push({
            type: 'RESOLVED',
            title: 'Emergency Resolved',
            desc: 'The emergency situation has been handled.',
            time: emergency.resolvedAt,
            icon: CheckCircle,
            color: 'text-emerald-500', bg: 'bg-emerald-500/20'
        });
    }

    timeline.sort((a, b) => new Date(a.time) - new Date(b.time));

    const responseTimeCalc = emergency.responders?.length > 0 
        ? Math.round((new Date(emergency.responders[0].respondedAt) - new Date(emergency.createdAt)) / 60000)
        : 0;

    return (
        <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
            {/* Header section */}
            <div>
                <button onClick={() => navigate('/staff/emergencies')} className="flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Emergencies
                </button>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-3 mb-1">
                            Emergency #{emId}
                            {emergency.status === 'ACTIVE' && (
                                <span className="flex items-center gap-2 px-2 py-0.5 rounded border border-red-500/30 bg-red-900/50 text-red-500 text-[10px] uppercase tracking-wider font-bold">
                                    Live <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                                </span>
                            )}
                        </h1>
                        <p className="text-slate-400 text-sm">
                            Reported on {new Date(emergency.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}, {new Date(emergency.createdAt).toLocaleTimeString()}
                            {emergency.status === 'RESPONDING' && <span className="ml-3 text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded">Response in Progress</span>}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {emergency.status === 'ACTIVE' && (
                            <button onClick={handleRespond} disabled={isUpdating} className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50">
                                <Activity className="w-4 h-4" /> Acknowledge & Respond
                            </button>
                        )}
                        {emergency.status !== 'RESOLVED' && emergency.status !== 'FALSE_ALARM' && (
                            <button onClick={handleResolve} disabled={isUpdating} className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50">
                                <CheckCircle className="w-4 h-4" /> Mark as Resolved
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Top Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div 
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-[#2a1318] to-[#1a0e13] border border-white/5 p-5 flex flex-col gap-3 shadow-lg cursor-pointer hover:scale-[1.02] hover:shadow-xl transition-all duration-300 ring-1 ring-white/5 hover:ring-white/20"
                >
                    <div className="absolute right-0 bottom-0 opacity-20 pointer-events-none">
                        <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0 80C30 50 60 80 120 20L120 80H0Z" fill="currentColor" className="text-white" />
                            <path d="M20 80C50 40 80 70 120 0L120 80H20Z" fill="currentColor" className="text-white opacity-50" />
                        </svg>
                    </div>
                    <div className="relative z-10 flex flex-col gap-3">
                        <div className="w-11 h-11 rounded-xl bg-red-900/20 border border-red-500/20 flex items-center justify-center relative backdrop-blur-md">
                            <div className="absolute inset-1 rounded-full border border-red-500/20 animate-ping"></div>
                            <span className="text-red-500 font-bold text-[10px] tracking-widest">SOS</span>
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold text-white/80 mb-1 uppercase tracking-wider">Emergency Status</p>
                            <div className="text-2xl font-bold text-white tracking-tight mb-1">{emergency.status === 'ACTIVE' ? 'LIVE ALERT' : emergency.status.replace('_', ' ')}</div>
                            <p className="text-[10px] text-red-500/80 font-medium uppercase">{priorityInfo.label}</p>
                        </div>
                    </div>
                </div>
                
                <div 
                    onClick={() => document.getElementById('details-section')?.scrollIntoView({ behavior: 'smooth' })}
                    className={`relative overflow-hidden rounded-[20px] bg-gradient-to-br ${priorityInfo.gradient} border border-white/5 p-5 flex flex-col gap-3 shadow-lg cursor-pointer hover:scale-[1.02] hover:shadow-xl transition-all duration-300 ring-1 ring-white/5 hover:ring-white/20`}
                >
                    <div className="absolute right-0 bottom-0 opacity-20 pointer-events-none">
                        <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0 80C30 50 60 80 120 20L120 80H0Z" fill="currentColor" className="text-white" />
                            <path d="M20 80C50 40 80 70 120 0L120 80H20Z" fill="currentColor" className="text-white opacity-50" />
                        </svg>
                    </div>
                    <div className="relative z-10 flex flex-col gap-3">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${priorityInfo.bg} ${priorityInfo.border} backdrop-blur-md`}>
                            <Activity className={`w-5 h-5 ${priorityInfo.color}`} />
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold text-white/80 mb-1 uppercase tracking-wider">Priority Level</p>
                            <div className={`text-2xl font-bold tracking-tight mb-1 ${priorityInfo.color}`}>{priorityInfo.label.split(' ')[0]}</div>
                            <p className="text-[10px] text-white/50 font-medium uppercase">{emergency.emergencyType.replace('_', ' ')}</p>
                        </div>
                    </div>
                </div>

                <div 
                    onClick={() => document.getElementById('timeline-section')?.scrollIntoView({ behavior: 'smooth' })}
                    className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-[#142338] to-[#0e1724] border border-white/5 p-5 flex flex-col gap-3 shadow-lg cursor-pointer hover:scale-[1.02] hover:shadow-xl transition-all duration-300 ring-1 ring-white/5 hover:ring-white/20"
                >
                    <div className="absolute right-0 bottom-0 opacity-20 pointer-events-none">
                        <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0 80C30 50 60 80 120 20L120 80H0Z" fill="currentColor" className="text-white" />
                            <path d="M20 80C50 40 80 70 120 0L120 80H20Z" fill="currentColor" className="text-white opacity-50" />
                        </svg>
                    </div>
                    <div className="relative z-10 flex flex-col gap-3">
                        <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center backdrop-blur-md">
                            <Clock className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold text-white/80 mb-1 uppercase tracking-wider">Response Time</p>
                            <div className="text-2xl font-bold text-white tracking-tight mb-1">{responseTimeCalc.toString().padStart(2, '0')}:00</div>
                            <p className="text-[10px] text-white/50 font-medium">Minutes from trigger</p>
                        </div>
                    </div>
                </div>

                <div 
                    onClick={() => document.getElementById('team-section')?.scrollIntoView({ behavior: 'smooth' })}
                    className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-[#241530] to-[#160f1f] border border-white/5 p-5 flex flex-col gap-3 shadow-lg cursor-pointer hover:scale-[1.02] hover:shadow-xl transition-all duration-300 ring-1 ring-white/5 hover:ring-white/20"
                >
                    <div className="absolute right-0 bottom-0 opacity-20 pointer-events-none">
                        <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0 80C30 50 60 80 120 20L120 80H0Z" fill="currentColor" className="text-white" />
                            <path d="M20 80C50 40 80 70 120 0L120 80H20Z" fill="currentColor" className="text-white opacity-50" />
                        </svg>
                    </div>
                    <div className="relative z-10 flex flex-col gap-3">
                        <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center backdrop-blur-md">
                            <Users className="w-5 h-5 text-purple-500" />
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold text-white/80 mb-1 uppercase tracking-wider">Assigned Staff</p>
                            <div className="text-2xl font-bold text-white tracking-tight mb-1">{emergency.responders?.length || 0}</div>
                            <p className="text-[10px] text-white/50 font-medium">Active personnel</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div id="details-section" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column (Map & Location) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Map Card */}
                    <div className="bg-[#1a1c29] border border-slate-800/50 rounded-2xl overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-slate-800/50 flex justify-between items-center bg-[#131525]/30">
                            <h3 className="font-bold text-white">Live Location</h3>
                            {emergency.latitude && emergency.longitude && (
                                <a 
                                    href={`https://www.google.com/maps?q=${emergency.latitude},${emergency.longitude}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-slate-400 hover:text-white flex items-center gap-1.5 text-xs bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700"
                                >
                                    <ExternalLink className="w-3 h-3" /> Open in Maps
                                </a>
                            )}
                        </div>
                        <div className="relative h-[400px] w-full bg-[#131525]">
                            {emergency.latitude && emergency.longitude ? (
                                <MapContainer center={[emergency.latitude, emergency.longitude]} zoom={15} scrollWheelZoom={false} className="w-full h-full z-0">
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    />
                                    <Marker position={[emergency.latitude, emergency.longitude]}>
                                        <Popup>
                                            <div className="text-slate-900 font-bold">{emergency.locationDescription}</div>
                                        </Popup>
                                    </Marker>
                                </MapContainer>
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-slate-500">
                                    <div className="text-center">
                                        <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        <p>No exact coordinates provided.</p>
                                    </div>
                                </div>
                            )}

                            {/* Overlay Card */}
                            <div className="absolute top-4 left-4 z-10 w-64 bg-[#1a1c29]/90 backdrop-blur-xl border border-slate-800 rounded-xl p-4 shadow-xl">
                                <h4 className="text-white font-bold text-lg mb-2">{emergency.locationUnitId?.towerId?.name || 'Location'} - {emergency.locationUnitId?.unitNumber || 'N/A'}</h4>
                                <div className="text-slate-400 text-xs space-y-1 mb-4">
                                    {emergency.locationUnitId?.unitNumber && <p>Unit {emergency.locationUnitId.unitNumber}, {emergency.locationUnitId.floorId?.floorName || 'Floor'}</p>}
                                    <p>{emergency.locationDescription}</p>
                                </div>
                                {emergency.latitude && emergency.longitude ? (
                                    <a 
                                        href={`https://www.google.com/maps/dir/?api=1&destination=${emergency.latitude},${emergency.longitude}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="w-full py-2 bg-[#6338f0] hover:bg-[#5225e2] text-white rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
                                    >
                                        <Share2 className="w-4 h-4" /> Get Directions
                                    </a>
                                ) : (
                                    <button disabled className="w-full py-2 bg-slate-700 text-slate-400 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 opacity-50 cursor-not-allowed">
                                        <Share2 className="w-4 h-4" /> Directions Unavailable
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Emergency Details */}
                        <div className="bg-[#1a1c29] border border-slate-800/50 rounded-2xl p-6">
                            <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                                <ShieldAlert className="w-5 h-5 text-red-500" /> Emergency Details
                            </h3>
                            <div className="space-y-4">
                                <div className="grid grid-cols-3 gap-2 border-b border-slate-800 pb-3">
                                    <div className="text-slate-500 text-sm">Emergency ID</div>
                                    <div className="col-span-2 text-white text-sm font-medium">: {emId}</div>
                                </div>
                                <div className="grid grid-cols-3 gap-2 border-b border-slate-800 pb-3">
                                    <div className="text-slate-500 text-sm">Type</div>
                                    <div className="col-span-2 text-red-500 text-sm font-medium">: {emergency.emergencyType.replace('_', ' ')}</div>
                                </div>
                                <div className="grid grid-cols-3 gap-2 border-b border-slate-800 pb-3">
                                    <div className="text-slate-500 text-sm">Reported By</div>
                                    <div className="col-span-2 text-white text-sm font-medium">
                                        : {emergency.triggeredBy?.firstName} {emergency.triggeredBy?.lastName} <span className="text-slate-500 text-xs ml-1">({emergency.triggeredBy?.phone || 'N/A'})</span>
                                        <div className="text-slate-400 text-xs mt-1 ml-2 leading-relaxed">
                                            at Unit {emergency.locationUnitId?.unitNumber}, {emergency.locationUnitId?.floorId?.floorName || 'Floor'}, {emergency.locationUnitId?.towerId?.name || 'Tower'}
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div className="text-slate-500 text-sm mb-1">Description :</div>
                                    <p className="text-slate-300 text-sm leading-relaxed">{emergency.locationDescription}</p>
                                </div>
                            </div>
                        </div>

                        {/* Assigned Response Team */}
                        <div id="team-section" className="bg-[#1a1c29] border border-slate-800/50 rounded-2xl flex flex-col">
                            <div className="p-6 border-b border-slate-800/50 flex justify-between items-center bg-[#131525]/30 rounded-t-2xl">
                                <h3 className="font-bold text-white flex items-center gap-2">
                                    <Users className="w-5 h-5 text-indigo-500" /> Assigned Response Team
                                </h3>
                            </div>
                            <div className="p-4 flex-1 space-y-3">
                                {emergency.responders?.length > 0 ? (
                                    emergency.responders.map((resp, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-[#131525] border border-slate-800/80">
                                            <div className="flex items-center gap-3">
                                                {resp.userId?.profilePhotoUrl ? (
                                                    <img src={resp.userId.profilePhotoUrl} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold">
                                                        {resp.userId?.firstName?.[0] || 'S'}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="text-white text-sm font-bold">{resp.userId?.firstName} {resp.userId?.lastName}</div>
                                                    <div className="text-slate-500 text-xs">{resp.userId?.role?.replace('_', ' ')}</div>
                                                    <div className="text-slate-400 text-xs flex items-center gap-1 mt-0.5">
                                                        <Phone className="w-3 h-3" /> {resp.userId?.phone || 'N/A'}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="px-2 py-1 bg-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase rounded tracking-wider border border-indigo-500/20">
                                                ON SITE
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center p-6 text-slate-500">
                                        <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
                                        <p>No staff assigned yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column (Timeline & Status) */}
                <div className="space-y-6">
                    {/* Emergency Timeline */}
                    <div id="timeline-section" className="bg-[#1a1c29] border border-slate-800/50 rounded-2xl p-6">
                        <h3 className="font-bold text-white mb-6">Emergency Timeline</h3>
                        <div className="relative pl-6 border-l border-slate-800 space-y-8">
                            {timeline.map((item, index) => (
                                <div key={index} className="relative">
                                    <div className={`absolute -left-[37px] w-7 h-7 rounded-full ${item.bg} border border-slate-800 flex items-center justify-center ring-4 ring-[#1a1c29]`}>
                                        <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
                                    </div>
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="text-sm font-bold text-white">{item.title}</h4>
                                        <span className="text-xs text-slate-500 whitespace-nowrap ml-2">
                                            {new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Incident Status */}
                    <div className="bg-[#1a1c29] border border-slate-800/50 rounded-2xl p-6">
                        <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-blue-500" /> Incident Status
                        </h3>
                        <div className="flex justify-center mb-6">
                            <div className="relative w-32 h-32 rounded-full border-[8px] border-slate-800 flex items-center justify-center">
                                {/* SVG for circular progress could go here, simulating with CSS */}
                                <div className="absolute inset-0 rounded-full border-[8px] border-[#6338f0] border-r-transparent border-t-transparent rotate-45"></div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-white">{emergency.status === 'RESOLVED' ? '100%' : '60%'}</div>
                                    <div className="text-[10px] text-slate-500 uppercase tracking-widest">Progress</div>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2 text-emerald-500">
                                    <CheckCircle className="w-4 h-4" /> Alert Received
                                </div>
                                <div className="text-slate-500">{new Date(emergency.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <div className={`flex items-center gap-2 ${emergency.responders?.length > 0 ? 'text-emerald-500' : 'text-slate-500'}`}>
                                    <CheckCircle className="w-4 h-4" /> Team Assigned
                                </div>
                                <div className="text-slate-500">{emergency.responders?.[0] ? new Date(emergency.responders[0].respondedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</div>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <div className={`flex items-center gap-2 ${emergency.responders?.length > 0 ? 'text-[#6338f0]' : 'text-slate-400 opacity-50'}`}>
                                    <div className={`w-4 h-4 rounded-full border-2 ${emergency.responders?.length > 0 ? 'border-[#6338f0]' : 'border-slate-600'} flex items-center justify-center`}>
                                        {emergency.responders?.length > 0 && <div className="w-1.5 h-1.5 rounded-full bg-[#6338f0]"></div>}
                                    </div>
                                    Team On The Way
                                </div>
                                <div className="text-slate-500">{emergency.responders?.[0] ? new Date(emergency.responders[0].respondedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</div>
                            </div>
                            <div className={`flex justify-between items-center text-sm ${emergency.status === 'RESOLVED' ? '' : 'opacity-50'}`}>
                                <div className={`flex items-center gap-2 ${emergency.status === 'RESOLVED' ? 'text-emerald-500' : 'text-slate-400'}`}>
                                    {emergency.status === 'RESOLVED' ? <CheckCircle className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full border-2 border-slate-600"></div>}
                                    Emergency Resolved
                                </div>
                                <div className="text-slate-500">{emergency.resolvedAt ? new Date(emergency.resolvedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* High Priority Banner */}
            {emergency.status === 'ACTIVE' && priorityInfo.label === 'High Priority' && (
                <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-4 mt-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center animate-pulse">
                            <ShieldAlert className="w-6 h-6 text-red-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-red-500">High Priority Emergency</h3>
                            <p className="text-sm text-slate-400">This is a high priority emergency. Please ensure quick action and keep all stakeholders updated.</p>
                        </div>
                    </div>
                    <button onClick={handleRespond} className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition whitespace-nowrap shadow-lg shadow-red-900/50 flex items-center gap-2">
                        <Activity className="w-5 h-5" /> Respond Immediately
                    </button>
                </div>
            )}
        </div>
    );
}
