import React from 'react';
import { Shield, Key, Check } from 'lucide-react';
import Card from '../../../../../components/ui/Card';

const AVAILABLE_PERMISSIONS = [
    { id: 'view_residents', label: 'View Residents Directory', desc: 'Can view list of residents and their basic contact info.' },
    { id: 'manage_complaints', label: 'Manage Complaints', desc: 'Can update status and assign complaints to staff.' },
    { id: 'broadcast_notices', label: 'Broadcast Notices', desc: 'Can create and publish notices to residents.' },
    { id: 'gate_management', label: 'Gate Management (Logs)', desc: 'Can view visitor and vehicle entry logs.' },
    { id: 'view_finance', label: 'View Financials', desc: 'Can view invoices, payments and society ledger.' },
];

export default function PermissionsTab({ user, profile, updateProfile }) {
    // In a real app, permissions might be stored on the user or profile object.
    const userPermissions = profile?.permissions || [];
    
    // Auto-grant basic permissions based on role for demonstration
    const hasPermission = (id) => {
        if (user.role === 'SOCIETY_ADMIN') return true;
        if (user.role === 'SECURITY_GUARD' && id === 'gate_management') return true;
        if (user.role === 'ACCOUNTANT' && id === 'view_finance') return true;
        return userPermissions.includes(id);
    };

    return (
        <Card className="bg-[#151921] border-white/5">
            <Card.Body className="p-6">
                <div className="flex items-center gap-2 mb-6">
                    <Shield className="w-5 h-5 text-[#6338f0]" />
                    <h3 className="text-lg font-bold text-white">Access & Permissions</h3>
                </div>
                
                <p className="text-sm text-white font-bold mb-6">
                    Manage what this staff member can see and do within the society management portal. 
                    Note: As a <b>{user.role}</b>, some permissions are granted automatically.
                </p>

                <div className="space-y-3">
                    {AVAILABLE_PERMISSIONS.map((perm) => {
                        const isGranted = hasPermission(perm.id);
                        return (
                            <div key={perm.id} className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                                <div className="mt-0.5">
                                    <div className={`w-5 h-5 rounded flex items-center justify-center border ${isGranted ? 'bg-[#6338f0] border-[#6338f0]' : 'border-gray-600 bg-transparent'}`}>
                                        {isGranted && <Check className="w-3.5 h-3.5 text-white" />}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold text-gray-200">{perm.label}</h4>
                                    <p className="text-xs text-white font-bold mt-1">{perm.desc}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card.Body>
        </Card>
    );
}
