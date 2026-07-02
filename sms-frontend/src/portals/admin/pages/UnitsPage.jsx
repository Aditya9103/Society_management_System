/**
 * UnitsPage.jsx — List and create units across towers and floors.
 */
import React, { useState } from 'react';
import { Grid3X3, Plus, Edit2, Trash2 } from 'lucide-react';
import { useListUnitsQuery, useListTowersQuery, useDeleteUnitMutation } from '../../../store/api/societyAdminApi';
import { Button } from '../../../components/ui/Button';
import PageHeader from '../../../components/ui/PageHeader';
import Alert from '../../../components/ui/Alert';
import EmptyState from '../../../components/ui/EmptyState';
import StatusBadge from '../../../components/ui/StatusBadge';
import Pagination from '../../../components/ui/Pagination';
import { Select } from '../../../components/ui/Select';
import Table from '../../../components/ui/Table';
import Modal from '../../../components/ui/Modal';
import CreateUnitModal from '../components/CreateUnitModal';

export default function UnitsPage() {
    const [page, setPage] = useState(1);
    const [filterTower, setFilterTower] = useState('');
    
    const [deleteUnit] = useDeleteUnitMutation();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUnit, setEditingUnit] = useState(null);
    const [deleteConfirmModal, setDeleteConfirmModal] = useState({ open: false, unit: null });

    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const { data: towersData } = useListTowersQuery();
    const towers = Array.isArray(towersData?.data) ? towersData.data : [];

    const { data, isLoading, isError, refetch, isFetching } = useListUnitsQuery({
        page, limit: 20,
        ...(filterTower && { towerId: filterTower }),
    });

    const units = Array.isArray(data?.data) ? data.data : [];
    const pagination = data?.pagination;

    const showSuccess = (msg) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 4000); };
    const showError = (msg) => { setErrorMsg(msg); setTimeout(() => setErrorMsg(''), 4000); };

    const handleCreateUnit = () => {
        setEditingUnit(null);
        setIsModalOpen(true);
    };

    const handleEditUnit = (unit) => {
        setEditingUnit(unit);
        setIsModalOpen(true);
    };

    const handleDeleteUnitConfirm = async () => {
        try {
            await deleteUnit(deleteConfirmModal.unit._id).unwrap();
            showSuccess('Unit deleted successfully!');
        } catch (err) {
            showError(err?.data?.message || 'Failed to delete unit.');
        } finally {
            setDeleteConfirmModal({ open: false, unit: null });
        }
    };

    return (
        <div className="space-y-5">
            <PageHeader
                title="Units"
                subtitle="Manage all residential and commercial units"
                onRefresh={refetch}
                isFetching={isFetching}
                actions={
                    <Button onClick={handleCreateUnit}>
                        <Plus className="mr-1.5 h-4 w-4" /> New Unit
                    </Button>
                }
            />

            {successMsg && <Alert type="success">{successMsg}</Alert>}
            {errorMsg && <Alert type="error">{errorMsg}</Alert>}
            {isError && <Alert type="error">Failed to load units. Please refresh.</Alert>}

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
                <Select
                    value={filterTower}
                    onChange={(e) => { setFilterTower(e.target.value); setPage(1); }}
                    className="w-48"
                >
                    <option value="">All Towers</option>
                    {towers.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
                </Select>
                {pagination && (
                    <p className="text-sm text-slate-500">
                        <span className="font-semibold text-slate-700">{pagination.total}</span> units total
                    </p>
                )}
            </div>

            {/* Table */}
            {!isError && units.length === 0 && !isLoading ? (
                <EmptyState
                    icon={Grid3X3}
                    title="No units found"
                    description="Create towers and floors first, then add units."
                    action={
                        <Button onClick={handleCreateUnit}>
                            <Plus className="mr-1.5 h-4 w-4" /> Create Unit
                        </Button>
                    }
                />
            ) : (
                <Table>
                    <Table.Head>
                        <Table.HeadCell>Unit</Table.HeadCell>
                        <Table.HeadCell className="hidden sm:table-cell">Tower / Floor</Table.HeadCell>
                        <Table.HeadCell className="hidden md:table-cell">Type</Table.HeadCell>
                        <Table.HeadCell className="hidden lg:table-cell">Area</Table.HeadCell>
                        <Table.HeadCell className="hidden lg:table-cell">Maintenance</Table.HeadCell>
                        <Table.HeadCell>Status</Table.HeadCell>
                        <Table.HeadCell align="right">Actions</Table.HeadCell>
                    </Table.Head>
                    {isLoading ? (
                        <Table.Loader rows={6} cols={7} />
                    ) : (
                        <Table.Body>
                            {units.map((unit) => (
                                <Table.Row key={unit._id}>
                                    <Table.Cell className="whitespace-normal min-w-[200px]">
                                        <p className="font-semibold text-slate-900">{unit.unitNumber}</p>
                                        {unit.bhkType && <p className="text-xs text-slate-400">{unit.bhkType}</p>}
                                        {/* Mobile extra info */}
                                        <div className="mt-1 sm:hidden text-[11px] text-slate-500 space-y-0.5">
                                            <p>{unit.towerId?.name ?? '—'} • {unit.floorId?.floorName ?? '—'}</p>
                                            <p>{unit.unitType}{unit.carpetAreaSqft > 0 ? ` • ${unit.carpetAreaSqft} sqft` : ''}</p>
                                        </div>
                                    </Table.Cell>
                                    <Table.Cell className="hidden sm:table-cell">
                                        <p className="text-slate-700">{unit.towerId?.name ?? '—'}</p>
                                        <p className="text-xs text-slate-400">{unit.floorId?.floorName ?? '—'}</p>
                                    </Table.Cell>
                                    <Table.Cell className="hidden md:table-cell"><StatusBadge status={unit.unitType} /></Table.Cell>
                                    <Table.Cell className="text-slate-500 hidden lg:table-cell">
                                        {unit.carpetAreaSqft > 0 ? `${unit.carpetAreaSqft} sqft` : '—'}
                                    </Table.Cell>
                                    <Table.Cell className="font-medium hidden lg:table-cell">
                                        {unit.maintenanceAmount > 0 ? `₹${unit.maintenanceAmount.toLocaleString('en-IN')}` : '—'}
                                    </Table.Cell>
                                    <Table.Cell><StatusBadge status={unit.ownershipStatus} /></Table.Cell>
                                    <Table.Cell align="right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                className="text-slate-400 hover:text-violet-600 p-1 transition-colors"
                                                onClick={() => handleEditUnit(unit)}
                                                title="Edit Unit"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button 
                                                className="text-slate-400 hover:text-red-600 p-1 transition-colors"
                                                onClick={() => setDeleteConfirmModal({ open: true, unit })}
                                                title="Delete Unit"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    )}
                </Table>
            )}

            <Pagination pagination={pagination} page={page} onPageChange={setPage} />

            <CreateUnitModal
                isOpen={isModalOpen}
                initialData={editingUnit}
                onClose={() => { 
                    setIsModalOpen(false); 
                    setEditingUnit(null);
                    showSuccess(editingUnit ? 'Unit updated successfully!' : 'Unit created successfully!'); 
                }}
            />

            <Modal
                isOpen={deleteConfirmModal.open}
                onClose={() => setDeleteConfirmModal({ open: false, unit: null })}
                title="Delete Unit"
            >
                <div className="p-4 space-y-4">
                    <p className="text-slate-600">
                        Are you sure you want to delete unit <strong>{deleteConfirmModal.unit?.unitNumber}</strong>?
                        <br/><br/>
                        <strong>Warning:</strong> You can only delete a unit if it is currently vacant (not occupied). This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="secondary" onClick={() => setDeleteConfirmModal({ open: false, unit: null })}>Cancel</Button>
                        <Button 
                            variant="danger" 
                            onClick={handleDeleteUnitConfirm}
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

