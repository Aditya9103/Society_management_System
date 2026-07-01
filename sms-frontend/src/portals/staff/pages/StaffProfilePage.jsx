/**
 * StaffProfilePage.jsx — Staff member's own profile.
 */
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { User, Mail, Phone, Shield, Lock, CheckCircle2, Plus, RefreshCw } from 'lucide-react';
import { useGetStaffMeQuery, useUpdateMyAvatarMutation } from '../../../store/api/staffApi';
import { setCredentials } from '../../../store/slices/authSlice';
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
  const dispatch = useDispatch();
  const { data, isLoading, isError } = useGetStaffMeQuery();
  const [updateMyAvatar, { isLoading: isUpdatingAvatar }] = useUpdateMyAvatarMutation();
  
  const profile = data?.data?.user ?? authUser;

  const role = profile?.role ?? '';
  const roleLabel = ROLE_LABELS[role] ?? role;
  const initials = `${profile?.firstName?.[0] ?? ''}${profile?.lastName?.[0] ?? ''}`;

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
        const formData = new FormData();
        formData.append('avatar', file);
        const res = await updateMyAvatar(formData).unwrap();
        
        // Instantly update Redux auth state so the header navigation image also updates
        if (res?.data?.user) {
            dispatch(setCredentials({ user: res.data.user, accessToken: localStorage.getItem('accessToken') }));
        }
    } catch (error) {
        console.error('Failed to update avatar:', error);
        alert('Failed to update avatar.');
    }
  };

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
              <div className="relative group flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-2xl font-bold text-white shadow-lg overflow-hidden cursor-pointer">
                {profile?.profilePhotoUrl ? (
                    <img src={profile.profilePhotoUrl} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                    <>{initials}</>
                )}
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Plus className="h-6 w-6 text-white" />
                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} disabled={isUpdatingAvatar} />
                </label>
                {isUpdatingAvatar && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                        <RefreshCw className="h-5 w-5 animate-spin text-white" />
                    </div>
                )}
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
