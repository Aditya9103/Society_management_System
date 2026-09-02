import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, Eye, Edit2, Trash2, MoreVertical, Shield, Briefcase, UserCheck, UserX } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

// Utility for formatting role text
const formatRole = (role) => {
    if (!role) return '';
    return role.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
};

const getDepartmentLabel = (role) => {
    switch (role) {
        case 'SOCIETY_ADMIN': return 'ADMINISTRATION';
        case 'COMMITTEE_MEMBER': return 'COMMITTEE';
        case 'ACCOUNTANT': return 'ACCOUNTS';
        case 'FACILITY_MANAGER': return 'FACILITY';
        case 'HELP_DESK': return 'SUPPORT';
        case 'SECURITY_GUARD': return 'SECURITY';
        default: return 'MAINTENANCE';
    }
};

const getRoleIcon = (role) => {
    switch (role) {
        case 'SECURITY_GUARD': return <Shield className="w-4 h-4 text-amber-500" />;
        case 'ACCOUNTANT': return <Briefcase className="w-4 h-4 text-blue-500" />;
        case 'FACILITY_MANAGER': return <UserCheck className="w-4 h-4 text-emerald-500" />;
        default: return <Briefcase className="w-4 h-4 text-indigo-400" />;
    }
};

export default function StaffTable({ staff, onDeactivate, isDeactivating, onDelete, isDeleting }) {
    const navigate = useNavigate();
    return (
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#151921] shadow-2xl">
            <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-[#1a1f2c] border-b border-white/5 text-xs uppercase tracking-wider text-white font-bold font-semibold">
                    <tr>
                        <th className="px-6 py-5">STAFF MEMBER</th>
                        <th className="px-6 py-5">ROLE & DEPARTMENT</th>
                        <th className="px-6 py-5">CONTACT</th>
                        <th className="px-6 py-5">STATUS</th>
                        <th className="px-6 py-5">JOINED ON</th>
                        <th className="px-6 py-5 text-center">ACTIONS</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {staff.map((member) => {
                        const initials = `${member.firstName?.[0] ?? ''}${member.lastName?.[0] ?? ''}`;
                        const joinedDate = new Date(member.createdAt);
                        const joinedDuration = formatDistanceToNow(joinedDate);
                        
                        return (
                            <tr 
                                key={member._id} 
                                className="hover:bg-white/[0.02] transition-colors cursor-pointer"
                                onClick={() => navigate(`/admin/staff/${member._id}`)}
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6338f0] to-[#9333ea] flex items-center justify-center text-sm font-bold text-white shadow-sm shrink-0">
                                            {initials}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-100 flex items-center gap-2">
                                                {member.firstName} {member.lastName}
                                                <span className="text-[10px] font-bold bg-[#6338f0]/20 text-[#6338f0] px-1.5 py-0.5 rounded">
                                                    {initials}
                                                </span>
                                            </p>
                                            <p className="text-white font-bold text-xs mt-0.5">{member.email}</p>
                                        </div>
                                    </div>
                                </td>

                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 font-bold text-gray-200">
                                        {getRoleIcon(member.role)}
                                        {formatRole(member.role)}
                                    </div>
                                    <div className="mt-1.5">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider border border-white/10 text-indigo-400 bg-indigo-500/10">
                                            {getDepartmentLabel(member.role)}
                                        </span>
                                    </div>
                                </td>

                                <td className="px-6 py-4">
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-2 text-white font-bold">
                                            <Mail className="w-3.5 h-3.5 text-gray-200 font-bold" />
                                            {member.email}
                                        </div>
                                        {member.phone && (
                                            <div className="flex items-center gap-2 text-white font-bold">
                                                <Phone className="w-3.5 h-3.5 text-gray-200 font-bold" />
                                                {member.phone}
                                            </div>
                                        )}
                                    </div>
                                </td>

                                <td className="px-6 py-4">
                                    {member.isActive ? (
                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-bold">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                            Active
                                        </div>
                                    ) : (
                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-gray-500/20 bg-gray-500/10 text-white font-bold text-xs font-bold">
                                            <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                                            Inactive
                                        </div>
                                    )}
                                </td>

                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-white font-bold">
                                        <span className="font-bold text-gray-200">{format(joinedDate, 'dd MMM yyyy')}</span>
                                    </div>
                                    <div className="text-gray-200 font-bold text-xs mt-1">{joinedDuration}</div>
                                </td>

                                <td className="px-6 py-4 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <button 
                                            className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/10 text-white font-bold hover:text-indigo-400 hover:border-indigo-500/30 hover:bg-indigo-500/10 transition-colors"
                                            title="View Details"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button 
                                            className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/10 text-white font-bold hover:text-blue-400 hover:border-blue-500/30 hover:bg-blue-500/10 transition-colors"
                                            title="Edit Staff"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        
                                        {!member.isActive ? (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); onDelete(member); }}
                                                disabled={isDeleting || isDeactivating}
                                                className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/10 text-white font-bold hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                                                title="Delete Permanently"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); onDeactivate(member); }}
                                                disabled={isDeactivating || isDeleting}
                                                className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/10 text-white font-bold hover:text-orange-400 hover:border-orange-500/30 hover:bg-orange-500/10 transition-colors disabled:opacity-50"
                                                title="Deactivate Account"
                                            >
                                                <UserX className="w-4 h-4" />
                                            </button>
                                        )}
                                        
                                        <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/10 text-white font-bold hover:text-gray-200 hover:bg-white/5 transition-colors ml-1">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
