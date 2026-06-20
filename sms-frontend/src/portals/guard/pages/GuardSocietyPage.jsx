/**
 * GuardSocietyPage.jsx — Society emergency contacts for security guard.
 * Read-only view focused on emergency contacts and basic society info.
 *
 * Uses global components: PageHeader, Alert, Card, EmptyState.
 */
import React from 'react';
import { Shield, Phone, Building2, MapPin } from 'lucide-react';
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
                        <Card>
                            <Card.Header
                                title={
                                    <span className="flex items-center gap-2 text-red-600">
                                        <Shield className="h-4 w-4" /> Emergency Contacts
                                    </span>
                                }
                            />
                            <Card.Body className="space-y-3">
                                {profile.emergencyContacts.map((c, i) => (
                                    <div key={i} className="flex items-center justify-between rounded-xl bg-red-50 p-3.5 ring-1 ring-red-100">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100">
                                                <Phone className="h-5 w-5 text-red-600" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">{c.name}</p>
                                                <span className={cn('inline-block rounded-full px-2 py-0.5 text-xs font-semibold', EMERGENCY_COLOR[c.type] ?? 'bg-gray-100 text-gray-600')}>
                                                    {c.type?.replace(/_/g, ' ')}
                                                </span>
                                            </div>
                                        </div>
                                        <a
                                            href={`tel:${c.phone}`}
                                            className="flex items-center gap-1.5 rounded-xl bg-red-600 px-3 py-2 text-sm font-bold text-white shadow transition hover:bg-red-700"
                                        >
                                            <Phone className="h-3.5 w-3.5" /> {c.phone}
                                        </a>
                                    </div>
                                ))}
                            </Card.Body>
                        </Card>
                    ) : (
                        <Alert type="warning">No emergency contacts configured. Contact the Society Admin.</Alert>
                    )}
                </div>
            )}
        </div>
    );
}
