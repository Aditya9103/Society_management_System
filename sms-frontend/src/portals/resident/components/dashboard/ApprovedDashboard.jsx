import React from 'react';
import { CheckCircle2, Home, Building2, User, Phone, Mail } from 'lucide-react';
import StatusBadge from '../../../../components/ui/StatusBadge';

export function ApprovedDashboard({ profile, user }) {
    const unit = profile?.unitId;
    const society = profile?.societyId;

    return (
        <div className="space-y-6">
            {/* Welcome banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 p-6 text-white shadow-lg">
                <div className="relative z-10">
                    <div className="flex items-center gap-2 text-indigo-200 text-sm mb-1">
                        <CheckCircle2 className="h-4 w-4" /> Verified Resident
                    </div>
                    <h1 className="text-2xl font-bold">
                        Welcome, {user?.firstName}! 👋
                    </h1>
                    {society && (
                        <p className="mt-1 text-indigo-200 text-sm">
                            {society.name} · {society.city}
                        </p>
                    )}
                </div>
                {/* Decorative blob */}
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
                <div className="absolute -right-4 bottom-0 h-20 w-20 rounded-full bg-white/5" />
            </div>

            {/* Info cards */}
            <div className="grid gap-4 sm:grid-cols-3">
                {/* Unit */}
                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100">
                            <Home className="h-5 w-5 text-violet-600" />
                        </div>
                        <p className="font-semibold text-slate-800">My Unit</p>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{unit?.unitNumber ?? '—'}</p>
                    {unit?.bhkType && <p className="text-sm text-slate-500">{unit.bhkType}</p>}
                    <div className="mt-2">
                        <StatusBadge status={profile?.ownershipType} />
                    </div>
                </div>

                {/* Society */}
                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                            <Building2 className="h-5 w-5 text-blue-600" />
                        </div>
                        <p className="font-semibold text-slate-800">Society</p>
                    </div>
                    <p className="text-base font-semibold text-slate-900">{society?.name ?? '—'}</p>
                    <p className="text-sm text-slate-500">{society?.city}, {society?.state}</p>
                </div>

                {/* Resident code */}
                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                            <User className="h-5 w-5 text-emerald-600" />
                        </div>
                        <p className="font-semibold text-slate-800">Resident ID</p>
                    </div>
                    <p className="font-mono text-base font-bold text-slate-900 break-all">
                        {profile?.residentCode ?? '—'}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">Use this for maintenance requests</p>
                </div>
            </div>

            {/* Profile details */}
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
                <h3 className="mb-4 font-semibold text-slate-800">My Details</h3>
                <div className="grid gap-3 sm:grid-cols-2 text-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                        <Mail className="h-4 w-4 shrink-0 text-slate-400" />
                        {user?.email}
                    </div>
                    {user?.phone && (
                        <div className="flex items-center gap-2 text-slate-600">
                            <Phone className="h-4 w-4 shrink-0 text-slate-400" />
                            {user.phone}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
