import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useGetStaffComplaintsQuery } from '../../../store/api/staffApi';
import { MessageSquareWarning, Plus } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import Alert from '../../../components/ui/Alert';
import EmptyState from '../../../components/ui/EmptyState';
import PageHeader from '../../../components/ui/PageHeader';
import ComplaintCard from '../components/complaints/ComplaintCard';
import RaiseComplaintModal from '../components/complaints/RaiseComplaintModal';

export default function StaffComplaintsPage() {
    const { user } = useSelector(state => state.auth);
    const role = user?.role;
    const { data, isLoading, isError, refetch, isFetching } = useGetStaffComplaintsQuery();
    const [showModal, setShowModal] = useState(false);
    
    const complaints = data?.data ?? [];
    const canRaise = ['COMMITTEE_MEMBER','ACCOUNTANT','FACILITY_MANAGER','HELP_DESK'].includes(role);

    return (
        <div className="space-y-5">
            <PageHeader 
                title="Complaints" 
                subtitle="Society-wide maintenance and issue tracking"
                onRefresh={refetch}
                isFetching={isFetching}
                action={canRaise && (
                    <Button onClick={() => setShowModal(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                        <Plus className="h-4 w-4 mr-2" /> Raise Complaint
                    </Button>
                )}
            />

            {isError && <Alert type="error">Failed to load complaints. <button onClick={refetch} className="underline ml-1">Retry</button></Alert>}

            {isLoading ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => <div key={i} className="h-32 animate-pulse rounded-xl bg-slate-100" />)}
                </div>
            ) : complaints.length === 0 ? (
                <EmptyState 
                    icon={MessageSquareWarning} 
                    title="No complaints found" 
                    description="There are currently no active complaints." 
                />
            ) : (
                <div className="space-y-4">
                    {complaints.map(c => <ComplaintCard key={c._id} complaint={c} />)}
                </div>
            )}
            
            <RaiseComplaintModal isOpen={showModal} onClose={() => { setShowModal(false); refetch(); }} />
        </div>
    );
}
