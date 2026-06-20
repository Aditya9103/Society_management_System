/**
 * TowersPage.jsx — Manage society towers and their floors.
 * Components are extracted following the super-admin portal architecture.
 */
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Building2, Plus, ChevronDown, ChevronRight, Layers } from 'lucide-react';
import {
    useListTowersQuery,
    useCreateFloorMutation,
    useUpdateFloorMutation,
    useDeleteTowerMutation,
    useDeleteFloorMutation,
} from '../../../store/api/societyAdminApi';
import { Button } from '../../../components/ui/Button';
import PageHeader from '../../../components/ui/PageHeader';
import Alert from '../../../components/ui/Alert';
import EmptyState from '../../../components/ui/EmptyState';
import Modal from '../../../components/ui/Modal';
import FormField from '../../../components/ui/FormField';
import { Input } from '../../../components/ui/Input';
import CreateTowerModal from '../components/CreateTowerModal';

// ── Sub-component: TowerCard ─────────────────────────────────────────────────

import { Edit2, Trash2 } from 'lucide-react';

function TowerCard({ tower, onAddFloor, onEditTower, onDeleteTower, onEditFloor, onDeleteFloor }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 transition-all hover:shadow-md">
            {/* Header row */}
            <div className="flex items-center justify-between p-5">
                <div
                    role="button"
                    tabIndex={0}
                    className="flex cursor-pointer items-center gap-4 flex-1"
                    onClick={() => setExpanded((e) => !e)}
                    onKeyDown={(e) => e.key === 'Enter' && setExpanded((v) => !v)}
                >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow">
                        <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <p className="font-semibold text-slate-900">{tower.name}</p>
                        <p className="text-xs text-slate-500">
                            Code: <span className="font-mono font-medium">{tower.code}</span>
                            {' · '}{tower.totalFloors} floors
                            {' · '}{tower.totalUnits ?? 0} units
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {tower.amenities?.slice(0, 2).map((a) => (
                        <span key={a} className="hidden rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500 sm:inline">
                            {a}
                        </span>
                    ))}

                    <button
                        onClick={(e) => { e.stopPropagation(); onEditTower(tower); }}
                        className="text-slate-400 hover:text-violet-600 transition-colors p-1"
                        title="Edit Tower"
                    >
                        <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDeleteTower(tower); }}
                        className="text-slate-400 hover:text-red-600 transition-colors p-1"
                        title="Delete Tower"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>

                    <button
                        className="p-1 text-slate-400 hover:text-slate-600"
                        onClick={() => setExpanded(!expanded)}
                    >
                        {expanded
                            ? <ChevronDown className="h-4 w-4" />
                            : <ChevronRight className="h-4 w-4" />
                        }
                    </button>
                </div>
            </div>

            {/* Floors list */}
            {expanded && (
                <div className="border-t border-slate-100 px-5 pb-5 pt-4">
                    <div className="mb-3 flex items-center justify-between">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Floors ({tower.floors?.length ?? 0})
                        </p>
                        <button
                            onClick={(e) => { e.stopPropagation(); onAddFloor(tower); }}
                            className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-violet-600 transition-colors hover:bg-violet-50"
                        >
                            <Plus className="h-3.5 w-3.5" /> Add Floor
                        </button>
                    </div>

                    {!tower.floors?.length ? (
                        <p className="text-xs text-slate-400">No floors yet. Click "Add Floor" to create one.</p>
                    ) : (
                        <div className="grid gap-1.5 sm:grid-cols-3 lg:grid-cols-4">
                            {tower.floors.map((floor) => (
                                <div
                                    key={floor._id}
                                    className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 ring-1 ring-slate-200 group"
                                >
                                    <div className="flex items-center gap-2">
                                        <Layers className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                                        <div>
                                            <p className="text-xs font-medium text-slate-700">{floor.floorName}</p>
                                            <p className="text-[10px] text-slate-400">{floor.totalUnits} units</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onEditFloor(tower, floor); }}
                                            className="text-slate-400 hover:text-violet-600 p-0.5"
                                        >
                                            <Edit2 className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onDeleteFloor(tower, floor); }}
                                            className="text-slate-400 hover:text-red-600 p-0.5"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ── Sub-component: FloorModal ─────────────────────────────────────────────

function FloorModal({ tower, initialData, isOpen, onClose }) {
    const isEdit = !!initialData;
    const [createFloor, { isLoading: isCreating }] = useCreateFloorMutation();
    const [updateFloor, { isLoading: isUpdating }] = useUpdateFloorMutation();
    const isLoading = isCreating || isUpdating;

    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const [errorMsg, setErrorMsg] = useState(null);

    React.useEffect(() => {
        if (isOpen) {
            if (initialData) {
                reset({
                    floorNumber: initialData.floorNumber,
                    floorName: initialData.floorName,
                });
            } else {
                reset({ floorNumber: '', floorName: '' });
            }
        }
    }, [isOpen, initialData, reset]);

    const onSubmit = async (formData) => {
        setErrorMsg(null);
        try {
            if (isEdit) {
                await updateFloor({
                    towerId: tower._id,
                    floorId: initialData._id,
                    floorNumber: Number(formData.floorNumber),
                    floorName: formData.floorName,
                }).unwrap();
            } else {
                await createFloor({
                    towerId: tower._id,
                    floorNumber: Number(formData.floorNumber),
                    floorName: formData.floorName,
                }).unwrap();
            }
            reset();
            onClose(true); // true indicates success
        } catch (err) {
            setErrorMsg(err?.data?.message ?? `Failed to ${isEdit ? 'update' : 'add'} floor.`);
        }
    };

    const handleClose = () => { reset(); setErrorMsg(null); onClose(false); };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={isEdit ? `Edit Floor — ${tower?.name ?? ''}` : `Add Floor — ${tower?.name ?? ''}`}
            description={isEdit ? "Update floor metadata." : "Add a new floor to this tower."}
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {errorMsg && <Alert type="error">{errorMsg}</Alert>}
                <div className="grid gap-4 sm:grid-cols-2">
                    <FormField label="Floor Number (negative = basement)" error={errors.floorNumber?.message}>
                        <Input
                            type="number"
                            placeholder="e.g. 13 or -1"
                            {...register('floorNumber', { required: 'Required' })}
                        />
                    </FormField>
                    <FormField label="Floor Name" error={errors.floorName?.message}>
                        <Input
                            placeholder="e.g. Floor 13"
                            {...register('floorName', { required: 'Required' })}
                        />
                    </FormField>
                </div>
                <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                    <Button type="button" variant="secondary" onClick={handleClose}>Cancel</Button>
                    <Button type="submit" isLoading={isLoading}>{isEdit ? 'Save Changes' : 'Add Floor'}</Button>
                </div>
            </form>
        </Modal>
    );
}

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
