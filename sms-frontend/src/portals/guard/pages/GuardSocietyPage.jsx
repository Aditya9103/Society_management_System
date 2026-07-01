/**
 * GuardSocietyPage.jsx — Society emergency contacts for security guard.
 * Read-only view focused on emergency contacts and basic society info.
 *
 * Uses global components: PageHeader, Alert, Card, EmptyState.
 */
import React from 'react';
import { Shield, Phone, Building2, MapPin, Flame, Ambulance } from 'lucide-react';
import { useGetStaffSocietyProfileQuery } from '../../../store/api/staffApi';
import PageHeader from '../../../components/ui/PageHeader';
import Alert from '../../../components/ui/Alert';
import Card from '../../../components/ui/Card';
import EmptyState from '../../../components/ui/EmptyState';
import { cn } from '../../../components/ui/Button';

const EMERGENCY_COLOR = {
    POLICE:           'bg-blue-100 text-blue-700',
    FIRE:             'bg-red-100 text-red-700',
    AMBULANCE:        'bg-green-100 text-green-700',
    HOSPITAL:         'bg-green-100 text-green-700',
    SECURITY_AGENCY:  'bg-amber-100 text-amber-700',
    OTHER:            'bg-gray-100 text-gray-600',
};

export default function GuardSocietyPage() {
    const { data, isLoading, isError, refetch, isFetching } = useGetStaffSocietyProfileQuery();
    const profile = data?.data?.profile;

    // Helper to get icon for contact type
    const getContactIcon = (type) => {
        switch (type) {
            case 'POLICE': return <Shield className="w-5 h-5 text-blue-500" />;
            case 'FIRE': return <Flame className="w-5 h-5 text-orange-500" />;
            case 'AMBULANCE': return <Ambulance className="w-5 h-5 text-red-500" />;
            case 'HOSPITAL': return <MapPin className="w-5 h-5 text-emerald-500" />;
            default: return <Phone className="w-5 h-5 text-slate-500" />;
        }
    };

    return (
        <div className="space-y-5">
            <PageHeader
                title="Society Info"
                subtitle="Emergency contacts and society details"
                onRefresh={refetch}
                isFetching={isFetching}
            />

            {isError && <Alert type="error">Failed to load society info.</Alert>}

            {isLoading ? (
                <div className="h-64 animate-pulse rounded-xl bg-gray-100" />
            ) : profile && (
                <div className="space-y-4">
                    {/* Society header */}
                    <Card>
                        <Card.Body className="flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
                                <Building2 className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">{profile.name}</h2>
                                {(profile.city || profile.state) && (
                                    <p className="flex items-center gap-1.5 text-sm text-gray-500 mt-0.5">
                                        <MapPin className="h-3.5 w-3.5" />
                                        {[profile.address, profile.city, profile.state].filter(Boolean).join(', ')}
                                    </p>
                                )}
                            </div>
                        </Card.Body>
                    </Card>

                    {/* Emergency contacts */}
                    {profile.emergencyContacts?.length > 0 ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                                    <Shield className="h-4 w-4 text-red-600" /> Quick Contacts
                                </h3>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {profile.emergencyContacts.map((contact, idx) => (
                                    <a 
                                        key={idx} 
                                        href={`tel:${contact.phone}`}
                                        className="flex items-center justify-between p-4 hover:bg-slate-50 transition active:bg-slate-100"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100">
                                                {getContactIcon(contact.type)}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900 flex items-center gap-2">
                                                    {contact.name}
                                                    {contact.type && (
                                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 uppercase tracking-wider">
                                                            {(contact.type === 'OTHER' ? contact.customContactType || 'OTHER' : contact.type).replace(/_/g, ' ')}
                                                        </span>
                                                    )}
                                                </p>
                                                <p className="text-sm text-slate-500 mt-0.5">{contact.phone}</p>
                                            </div>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                            <Phone className="w-4 h-4" />
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <Alert type="warning">No emergency contacts configured. Contact the Society Admin.</Alert>
                    )}
                </div>
            )}
        </div>
    );
}
