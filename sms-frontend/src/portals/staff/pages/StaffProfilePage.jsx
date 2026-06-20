/**
 * StaffProfilePage.jsx — Staff member's own profile.
 */
import React from 'react';
import { useSelector } from 'react-redux';
import { User, Mail, Phone, Shield, Lock, CheckCircle2 } from 'lucide-react';
import { useGetStaffMeQuery } from '../../../store/api/staffApi';
import PageHeader from '../../../components/ui/PageHeader';
import Alert from '../../../components/ui/Alert';
import Card from '../../../components/ui/Card';
import StatusBadge from '../../../components/ui/StatusBadge';
import { cn } from '../../../components/ui/Button';

const ROLE_LABELS = {
  COMMITTEE_MEMBER: 'Committee Member',
  ACCOUNTANT: 'Accountant',
  FACILITY_MANAGER: 'Facility Manager',
  SECURITY_GUARD: 'Security Guard',
};

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100">
        <Icon className="h-4 w-4 text-gray-500" />
      </div>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-medium text-gray-800">{value}</p>
      </div>
    </div>
  );
}

export default function StaffProfilePage() {
  const { user: authUser } = useSelector((s) => s.auth);
  const { data, isLoading, isError } = useGetStaffMeQuery();
  const profile = data?.data?.user ?? authUser;

  const role = profile?.role ?? '';
  const roleLabel = ROLE_LABELS[role] ?? role;
  const initials = `${profile?.firstName?.[0] ?? ''}${profile?.lastName?.[0] ?? ''}`;

  return (
    <div className="space-y-5">
      <PageHeader title="My Profile" subtitle="Your account details and role information" />

      {isError && <Alert type="error">Failed to load profile.</Alert>}

      {isLoading ? (
        <div className="h-64 animate-pulse rounded-xl bg-gray-100" />
      ) : (
        <div className="space-y-4">
          {/* Avatar card */}
          <Card>
            <Card.Body className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-2xl font-bold text-white shadow-lg">
                {initials}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {profile?.firstName} {profile?.lastName}
                </h2>
                <StatusBadge status={role} className="mt-1" />
                <p className="mt-2 flex items-center gap-1.5 text-sm text-gray-500">
                  <CheckCircle2 className="h-4 w-4 text-green-500" /> Account Active
                </p>
              </div>
            </Card.Body>
          </Card>

          {/* Details */}
          <Card>
            <Card.Header title="Account Details" />
            <Card.Body className="space-y-4">
              <DetailRow icon={User} label="Full Name" value={`${profile?.firstName} ${profile?.lastName}`} />
              <DetailRow icon={Mail} label="Email Address" value={profile?.email} />
              {profile?.phone && <DetailRow icon={Phone} label="Phone" value={profile.phone} />}
              <DetailRow icon={Shield} label="Role" value={roleLabel} />
            </Card.Body>
          </Card>

          {/* Security note */}
          <Alert type="info">
            <div className="flex gap-2">
              <Lock className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Password Security</p>
                <p className="mt-0.5">To change your password, use <strong>Forgot Password</strong> from the login page.</p>
              </div>
            </div>
          </Alert>
        </div>
      )}
    </div>
  );
}
