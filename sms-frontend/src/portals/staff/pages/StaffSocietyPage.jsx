/**
 * StaffSocietyPage.jsx — Read-only society info page for all staff roles.
 * Shows society name, address, contact info, settings, and emergency contacts.
 *
 * Uses global components: PageHeader, Alert, Card.
 */
import React from 'react';
import { Building2, Phone, Mail, MapPin, Shield } from 'lucide-react';
import { useGetStaffSocietyProfileQuery } from '../../../store/api/staffApi';
import PageHeader from '../../../components/ui/PageHeader';
import Alert from '../../../components/ui/Alert';
import Card from '../../../components/ui/Card';

// ── Info item ─────────────────────────────────────────────────────────────────
function InfoItem({ label, value, icon: Icon }) {
    if (!value) return null;
    return (
        <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                <Icon className="h-4 w-4 text-gray-500" />
            </div>
            <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
                <p className="mt-0.5 text-sm font-medium text-gray-700">{value}</p>
            </div>
        </div>
    );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function StaffSocietyPage() {
    const { data, isLoading, isError, refetch, isFetching } = useGetStaffSocietyProfileQuery();
    const profile = data?.data?.profile;

    const fullAddress = [profile?.address, profile?.city, profile?.state, profile?.zipCode]
        .filter(Boolean)
        .join(', ');

    return (
        <div className="space-y-5">
            <PageHeader
                title="Society Information"
                subtitle="Read-only view of your society's details"
                onRefresh={refetch}
                isFetching={isFetching}
            />

            {isError && (
                <Alert type="error">
                    Failed to load society profile.{' '}
                    <button onClick={refetch} className="underline">Retry</button>
                </Alert>
            )}

            {isLoading ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => <div key={i} className="h-32 animate-pulse rounded-xl bg-gray-100" />)}
                </div>
            ) : profile ? (
                <div className="space-y-4">
                    {/* Main society header card */}
                    <Card>
                        <Card.Body className="flex items-center gap-4">
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-lg">
                                <Building2 className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{profile.name}</h2>
                                {profile.description && (
                                    <p className="mt-1 text-sm text-gray-500">{profile.description}</p>
                                )}
                            </div>
                        </Card.Body>
                    </Card>

                    {/* Contact & Stats */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Card>
                            <Card.Header title="Contact & Location" />
                            <Card.Body className="space-y-3">
                                <InfoItem label="Address" value={fullAddress} icon={MapPin} />
                                <InfoItem label="Phone" value={profile.phone} icon={Phone} />
                                <InfoItem label="Email" value={profile.email} icon={Mail} />
                            </Card.Body>
                        </Card>

                        <Card>
                            <Card.Header title="Building Stats" />
                            <Card.Body>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { label: 'Towers', value: profile.totalTowers },
                                        { label: 'Units',  value: profile.totalUnits },
                                        {
                                            label: 'Maintenance Due',
                                            value: profile.settings?.maintenanceDueDay
                                                ? `Day ${profile.settings.maintenanceDueDay}`
                                                : '—',
                                        },
                                    ].map(({ label, value }) => (
                                        <div key={label} className="rounded-xl bg-gray-50 p-3 text-center ring-1 ring-gray-100">
                                            <p className="text-xl font-bold text-gray-800">{value ?? '—'}</p>
                                            <p className="mt-0.5 text-xs text-gray-400">{label}</p>
                                        </div>
                                    ))}
                                </div>
                            </Card.Body>
                        </Card>
                    </div>

                    {/* Emergency contacts */}
                    {profile.emergencyContacts?.length > 0 && (
                        <Card>
                            <Card.Header
                                title={
                                    <span className="flex items-center gap-2">
                                        <Shield className="h-3.5 w-3.5 text-red-400" /> Emergency Contacts
                                    </span>
                                }
                            />
                            <Card.Body>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {profile.emergencyContacts.map((c, i) => (
                                        <div key={i} className="flex items-center gap-3 rounded-xl bg-red-50 p-3 ring-1 ring-red-100">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100">
                                                <Phone className="h-4 w-4 text-red-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-800">{c.name}</p>
                                                <p className="text-xs text-gray-500">{c.phone} · {c.designation}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card.Body>
                        </Card>
                    )}
                </div>
            ) : null}
        </div>
    );
}
