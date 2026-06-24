/**
 * TowersPage.jsx — Manage society towers and their floors.
 * Components are extracted following the super-admin portal architecture.
 */
import React, { useState } from 'react';
import { Building2, Plus } from 'lucide-react';
import {
    useListTowersQuery,
    useDeleteTowerMutation,
    useDeleteFloorMutation,
} from '../../../store/api/societyAdminApi';
import { Button } from '../../../components/ui/Button';
import PageHeader from '../../../components/ui/PageHeader';
import Alert from '../../../components/ui/Alert';
import EmptyState from '../../../components/ui/EmptyState';
import Modal from '../../../components/ui/Modal';
import CreateTowerModal from '../components/CreateTowerModal';
import TowerCard from '../components/towers/TowerCard';
import FloorModal from '../components/towers/FloorModal';

// ── Page Component ────────────────────────────────────────────────────────────

export default function TowersPage() {
    const { data, isLoading, isError, refetch, isFetching } = useListTowersQuery();
    const [deleteTower] = useDeleteTowerMutation();
    const [deleteFloor] = useDeleteFloorMutation();

    const [isTowerModalOpen, setIsTowerModalOpen] = useState(false);
    const [editingTower, setEditingTower] = useState(null);

    const [floorModal, setFloorModal] = useState({ open: false, tower: null, floor: null });
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const [deleteConfirmModal, setDeleteConfirmModal] = useState({ open: false, type: null, tower: null, floor: null });

    const towers = Array.isArray(data?.data) ? data.data : [];

    const showSuccess = (msg) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(''), 4000);
    };

    const showError = (msg) => {
        setErrorMsg(msg);
        setTimeout(() => setErrorMsg(''), 4000);
    }

    const handleCreateTower = () => {
        setEditingTower(null);
        setIsTowerModalOpen(true);
    };

    const handleEditTower = (tower) => {
        setEditingTower(tower);
        setIsTowerModalOpen(true);
    };

    const handleDeleteTowerConfirm = async () => {
        try {
            await deleteTower(deleteConfirmModal.tower._id).unwrap();
            showSuccess('Tower deleted successfully!');
        } catch (err) {
            showError(err?.data?.message || 'Failed to delete tower.');
        } finally {
            setDeleteConfirmModal({ open: false, type: null, tower: null, floor: null });
        }
    };

    const handleDeleteFloorConfirm = async () => {
        try {
            await deleteFloor({
                towerId: deleteConfirmModal.tower._id,
                floorId: deleteConfirmModal.floor._id
            }).unwrap();
            showSuccess('Floor deleted successfully!');
        } catch (err) {
            showError(err?.data?.message || 'Failed to delete floor.');
        } finally {
            setDeleteConfirmModal({ open: false, type: null, tower: null, floor: null });
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Towers & Floors"
                subtitle="Manage the building structure of your society"
                onRefresh={refetch}
                isFetching={isFetching}
                actions={
                    <Button onClick={handleCreateTower}>
                        <Plus className="mr-1.5 h-4 w-4" /> New Tower
                    </Button>
                }
            />

            {successMsg && <Alert type="success">{successMsg}</Alert>}
            {errorMsg && <Alert type="error">{errorMsg}</Alert>}
            {isError && <Alert type="error">Failed to load towers. Please refresh.</Alert>}

            {/* Tower List */}
            {isLoading ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-20 animate-pulse rounded-2xl bg-slate-200" />
                    ))}
                </div>
            ) : towers.length === 0 && !isError ? (
                <EmptyState
                    icon={Building2}
                    title="No towers yet"
                    description="Create your first tower to start managing floors and units."
                    action={
                        <Button onClick={handleCreateTower}>
                            <Plus className="mr-1.5 h-4 w-4" /> Create Tower
                        </Button>
                    }
                />
            ) : (
                <div className="space-y-4">
                    {towers.map((tower) => (
                        <TowerCard
                            key={tower._id}
                            tower={tower}
                            onAddFloor={(t) => setFloorModal({ open: true, tower: t, floor: null })}
                            onEditTower={handleEditTower}
                            onDeleteTower={(t) => setDeleteConfirmModal({ open: true, type: 'tower', tower: t, floor: null })}
                            onEditFloor={(t, f) => setFloorModal({ open: true, tower: t, floor: f })}
                            onDeleteFloor={(t, f) => setDeleteConfirmModal({ open: true, type: 'floor', tower: t, floor: f })}
                        />
                    ))}
                </div>
            )}

            {/* Modals */}
            <CreateTowerModal
                isOpen={isTowerModalOpen}
                initialData={editingTower}
                onClose={() => {
                    setIsTowerModalOpen(false);
                    setEditingTower(null);
                }}
            />

            <FloorModal
                tower={floorModal.tower}
                initialData={floorModal.floor}
                isOpen={floorModal.open}
                onClose={(success) => {
                    setFloorModal({ open: false, tower: null, floor: null });
                    if (success) {
                        showSuccess(floorModal.floor ? 'Floor updated successfully!' : 'Floor added successfully!');
                    }
                }}
            />

            <Modal
                isOpen={deleteConfirmModal.open}
                onClose={() => setDeleteConfirmModal({ open: false, type: null, tower: null, floor: null })}
                title={`Delete ${deleteConfirmModal.type === 'tower' ? 'Tower' : 'Floor'}`}
            >
                <div className="p-4 space-y-4">
                    <p className="text-slate-600">
                        Are you sure you want to delete {deleteConfirmModal.type === 'tower' ? 'this tower' : 'this floor'}?
                        <br /><br />
                        <strong>Warning:</strong> You can only delete a {deleteConfirmModal.type === 'tower' ? 'tower' : 'floor'} if it has <strong>NO occupied units</strong>. Vacant units and floors will be permanently cascade-deleted.
                    </p>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="secondary" onClick={() => setDeleteConfirmModal({ open: false, type: null, tower: null, floor: null })}>Cancel</Button>
                        <Button
                            variant="danger"
                            onClick={deleteConfirmModal.type === 'tower' ? handleDeleteTowerConfirm : handleDeleteFloorConfirm}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Confirm Delete
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
