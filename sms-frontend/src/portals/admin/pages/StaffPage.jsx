import React, { useState } from 'react';
import { Users } from 'lucide-react';
import { useListStaffQuery, useDeactivateStaffMutation } from '../../../store/api/societyAdminApi';
import { Button } from '../../../components/ui/Button';
import PageHeader from '../../../components/ui/PageHeader';
import Alert from '../../../components/ui/Alert';
import EmptyState from '../../../components/ui/EmptyState';
import Pagination from '../../../components/ui/Pagination';
import SearchInput from '../../../components/ui/SearchInput';
import CreateStaffModal from '../components/CreateStaffModal';
import StaffCard from '../components/staff/StaffCard';

export default function StaffPage() {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [alertMsg, setAlertMsg] = useState({ type: '', msg: '' });

    const { data, isLoading, isError, refetch, isFetching } = useListStaffQuery({ page, limit: 15, search });
    const [deactivateStaff, { isLoading: isDeactivating }] = useDeactivateStaffMutation();

    const staff = data?.data ?? [];
    const pagination = data?.pagination;

    const showAlert = (type, msg) => {
        setAlertMsg({ type, msg });
        setTimeout(() => setAlertMsg({ type: '', msg: '' }), 5000);
    };

    const handleDeactivate = async (member) => {
        const name = `${member.firstName} ${member.lastName}`;
        if (!window.confirm(`Deactivate ${name}? They will lose portal access immediately.`)) return;
        try {
            await deactivateStaff(member._id).unwrap();
            showAlert('success', `${name} has been deactivated.`);
        } catch (err) {
            showAlert('error', err?.data?.message ?? 'Failed to deactivate. Please try again.');
        }
    };

    return (
        <div className="space-y-5">
            <PageHeader
                title="Staff"
                subtitle="Manage your society's staff team"
                onRefresh={refetch}
                isFetching={isFetching}
                actions={
                    <Button onClick={() => setIsModalOpen(true)}>
                        <Users className="mr-1.5 h-4 w-4" /> Add Staff
                    </Button>
                }
            />

            {alertMsg.msg && <Alert type={alertMsg.type}>{alertMsg.msg}</Alert>}
            {isError && <Alert type="error">Failed to load staff. Please refresh.</Alert>}

            <SearchInput
                value={search}
                onChange={(v) => { setSearch(v); setPage(1); }}
                placeholder="Search by name or email…"
                className="w-full sm:max-w-xs"
            />

            {isLoading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-36 animate-pulse rounded-xl bg-slate-100" />
                    ))}
                </div>
            ) : !isError && staff.length === 0 ? (
                <EmptyState
                    icon={Users}
                    title="No staff members yet"
                    description="Add your first staff member to get started."
                    action={<Button onClick={() => setIsModalOpen(true)}>Add First Staff Member</Button>}
                />
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {staff.map((member) => (
                        <StaffCard key={member._id} member={member} onDeactivate={handleDeactivate} isDeactivating={isDeactivating} />
                    ))}
                </div>
            )}

            <Pagination pagination={pagination} page={page} onPageChange={setPage} />

            <CreateStaffModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    showAlert('success', 'Staff member created! Login credentials sent via email.');
                }}
            />
        </div>
    );
}
