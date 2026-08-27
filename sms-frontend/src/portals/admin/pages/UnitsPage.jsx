import React, { useState } from 'react';
import {
    Grid3X3, Plus, Edit2, Trash2, Building2, User, Key, CheckCircle2,
    Wrench, Search, RefreshCw, MoreVertical, Eye, FileText
} from 'lucide-react';
import { useListUnitsQuery, useListTowersQuery, useDeleteUnitMutation } from '../../../store/api/societyAdminApi';
import { Button } from '../../../components/ui/Button';
import Alert from '../../../components/ui/Alert';
import EmptyState from '../../../components/ui/EmptyState';
import StatusBadge from '../../../components/ui/StatusBadge';
import Pagination from '../../../components/ui/Pagination';
import Modal from '../../../components/ui/Modal';
import CreateUnitModal from '../components/CreateUnitModal';

export default function UnitsPage() {
    const [page, setPage] = useState(1);
    const [filterTower, setFilterTower] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const [deleteUnit] = useDeleteUnitMutation();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUnit, setEditingUnit] = useState(null);
    const [deleteConfirmModal, setDeleteConfirmModal] = useState({ open: false, unit: null });

    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const { data: towersData } = useListTowersQuery();
    const towers = Array.isArray(towersData?.data) ? towersData.data : [];

    const { data, isLoading, isError, refetch, isFetching } = useListUnitsQuery({
        page, limit: 10,
        ...(filterTower && { towerId: filterTower }),
        ...(filterStatus && { isOccupied: filterStatus === 'OCCUPIED' ? true : false }), // This might need mapping to ownershipStatus but the backend uses isOccupied
    });

    const units = Array.isArray(data?.data) ? data.data : [];
    const pagination = data?.pagination;
    const stats = data?.stats || { total: 0, ownerOccupied: 0, rented: 0, vacant: 0, maintenance: 0 };

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

    const getStatusStyle = (status) => {
        switch (status) {
            case 'RENTED': return 'bg-pink-500/10 text-pink-500 border border-pink-500/20';
            case 'OWNER_OCCUPIED': return 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
            case 'VACANT': return 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20';
            default: return 'bg-gray-500/10 text-gray-500 border border-gray-500/20';
        }
    };

    const getTypeStyle = (type) => {
        switch (type) {
            case 'RESIDENTIAL': return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
            case 'COMMERCIAL': return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20';
            default: return 'bg-gray-500/10 text-gray-500 border border-gray-500/20';
        }
    };

    return (
        <div className="space-y-3 text-gray-200">

            {successMsg && <Alert type="success">{successMsg}</Alert>}
            {errorMsg && <Alert type="error">{errorMsg}</Alert>}
            {isError && <Alert type="error">Failed to load units. Please refresh.</Alert>}

            {/* Banner Overview */}
            <div className="w-full rounded-2xl border border-white/5 bg-[#13151a] p-6 flex flex-col xl:flex-row gap-6 xl:items-center justify-between relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-900/20 via-[#13151a] to-[#13151a] pointer-events-none" />

                <div className="relative flex items-center gap-5">
                    <div className="w-20 h-20 rounded-full bg-violet-600/20 border-4 border-violet-600/30 flex items-center justify-center relative shadow-[0_0_30px_rgba(139,92,246,0.3)]">
                        <div className="w-14 h-14 rounded-full bg-violet-600 flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-400">All Units Overview</p>
                        <p className="text-4xl font-bold text-white mt-1">{stats.total}</p>
                        <p className="text-xs text-gray-500 mt-1">Total Units</p>
                    </div>
                </div>

                <div className="relative flex flex-wrap lg:flex-nowrap gap-3 xl:gap-4 flex-1 xl:justify-end">
                    {/* Owner Occupied */}
                    <div className="bg-white/5 border border-white/5 rounded-xl px-5 py-4 flex items-center gap-4 flex-1 min-w-[160px]">
                        <div className="w-10 h-10 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-white">{stats.ownerOccupied}</p>
                            <p className="text-[11px] text-gray-400 uppercase tracking-wide">Owner Occupied</p>
                        </div>
                    </div>

                    {/* Rented */}
                    <div className="bg-white/5 border border-white/5 rounded-xl px-5 py-4 flex items-center gap-4 flex-1 min-w-[160px]">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                            <Key className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-white">{stats.rented}</p>
                            <p className="text-[11px] text-gray-400 uppercase tracking-wide">Rented</p>
                        </div>
                    </div>

                    {/* Vacant */}
                    <div className="bg-white/5 border border-white/5 rounded-xl px-5 py-4 flex items-center gap-4 flex-1 min-w-[160px]">
                        <div className="w-10 h-10 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5 text-yellow-500" />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-white">{stats.vacant}</p>
                            <p className="text-[11px] text-gray-400 uppercase tracking-wide">Vacant</p>
                        </div>
                    </div>

                    {/* Under Maintenance */}
                    <div className="bg-white/5 border border-white/5 rounded-xl px-5 py-4 flex items-center gap-4 flex-1 min-w-[160px]">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                            <Wrench className="w-5 h-5 text-purple-500" />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-white">{stats.maintenance}</p>
                            <p className="text-[11px] text-gray-400 uppercase tracking-wide">Under Maintenance</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters Row */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                    <div className="relative">
                        <select
                            value={filterTower}
                            onChange={(e) => { setFilterTower(e.target.value); setPage(1); }}
                            className="bg-[#13151a] border border-white/10 text-gray-300 text-sm rounded-lg block w-full md:w-44 px-3.5 py-2.5 appearance-none focus:outline-none focus:ring-1 focus:ring-violet-500"
                        >
                            <option value="">All Towers</option>
                            {towers.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>

                    <div className="relative">
                        <select
                            value={filterStatus}
                            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                            className="bg-[#13151a] border border-white/10 text-gray-300 text-sm rounded-lg block w-full md:w-44 px-3.5 py-2.5 appearance-none focus:outline-none focus:ring-1 focus:ring-violet-500"
                        >
                            <option value="">All Status</option>
                            <option value="OCCUPIED">Occupied</option>
                            <option value="VACANT">Vacant</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>

                    <div className="relative w-full md:w-64">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                            <Search className="w-4 h-4" />
                        </div>
                        <input
                            type="text"
                            className="bg-[#13151a] border border-white/10 text-white text-sm rounded-lg block w-full pl-10 px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-violet-500 placeholder-gray-500"
                            placeholder="Search units..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-gray-500 hover:text-white" onClick={refetch}>
                            <Search className="w-4 h-4" />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button
                        onClick={refetch}
                        className="bg-[#13151a] border border-white/10 text-gray-400 hover:text-white w-10 h-10 rounded-lg flex items-center justify-center transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={handleCreateUnit}
                        className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors w-full md:w-auto shadow-lg shadow-violet-600/20 border border-violet-500/50"
                    >
                        <Plus className="w-4 h-4" /> New Unit
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-[#13151a] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-[11px] text-gray-500 uppercase bg-[#0b0c10]/50 border-b border-white/5 font-semibold tracking-wider">
                            <tr>
                                <th className="px-6 py-4">UNIT</th>
                                <th className="px-6 py-4">TOWER / FLOOR</th>
                                <th className="px-6 py-4">TYPE</th>
                                <th className="px-6 py-4">STATUS</th>
                                <th className="px-6 py-4">OWNER / RESIDENT</th>
                                <th className="px-6 py-4 text-right">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <RefreshCw className="w-6 h-6 animate-spin mb-2" />
                                            <p>Loading units...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : units.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        <EmptyState
                                            icon={Grid3X3}
                                            title="No units found"
                                            description="Create towers and floors first, then add units."
                                            action={
                                                <Button onClick={handleCreateUnit} className="mt-4 bg-violet-600 text-white border-0 hover:bg-violet-700">
                                                    <Plus className="mr-1.5 h-4 w-4" /> Create Unit
                                                </Button>
                                            }
                                        />
                                    </td>
                                </tr>
                            ) : (
                                units.filter(u =>
                                    (u.unitNumber?.toLowerCase().includes(searchQuery.toLowerCase()))
                                ).map((unit) => (
                                    <tr key={unit._id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-200">{unit.unitNumber}</div>
                                            <div className="text-[11px] text-gray-500 mt-0.5">{unit.bhkType || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-gray-300">{unit.towerId?.name ?? '—'}</div>
                                            <div className="text-[11px] text-gray-500 mt-0.5">{unit.floorId?.floorName ?? '—'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 text-[10px] font-bold uppercase rounded-full ${getTypeStyle(unit.unitType)}`}>
                                                {unit.unitType || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 text-[10px] font-bold uppercase rounded-full ${getStatusStyle(unit.ownershipStatus)}`}>
                                                {unit.ownershipStatus?.replace('_', ' ') || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden border border-gray-700 shrink-0">
                                                    <User className="w-4 h-4 text-gray-500" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-200">
                                                        {unit.isOccupied ? 'Occupied' : '—'}
                                                    </div>
                                                    <div className="text-[11px] text-gray-500 mt-0.5">
                                                        {unit.ownershipStatus === 'RENTED' ? 'Tenant' : (unit.ownershipStatus === 'OWNER_OCCUPIED' ? 'Owner' : 'Vacant')}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-violet-400 hover:text-violet-300 flex items-center justify-center transition-colors">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEditUnit(unit)}
                                                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 flex items-center justify-center transition-colors"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirmModal({ open: true, unit })}
                                                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/20 text-red-400 hover:text-red-300 flex items-center justify-center transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <button className="w-8 h-8 rounded-lg text-gray-500 hover:bg-white/5 hover:text-gray-300 flex items-center justify-center transition-colors ml-1">
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Custom Dark Pagination Footer */}
                {pagination && pagination.total > 0 && (
                    <div className="border-t border-white/5 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-xs text-gray-500 font-medium">
                            Showing <span className="text-gray-300">{(pagination.page - 1) * pagination.limit + 1}</span> to <span className="text-gray-300">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="text-gray-300">{pagination.total}</span> units
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(Math.max(1, page - 1))}
                                disabled={page === 1}
                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                            >
                                «
                            </button>

                            {[...Array(pagination.totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPage(i + 1)}
                                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors ${page === i + 1
                                        ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20 border border-violet-500/50'
                                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}

                            <button
                                onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
                                disabled={page === pagination.totalPages}
                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                            >
                                »
                            </button>

                            <div className="ml-4 flex items-center gap-2">
                                <span className="text-xs text-gray-500">Rows per page:</span>
                                <select className="bg-transparent text-xs text-gray-300 border-none outline-none focus:ring-0 cursor-pointer">
                                    <option className="bg-[#1a1d24]" value="10">10</option>
                                    <option className="bg-[#1a1d24]" value="20">20</option>
                                    <option className="bg-[#1a1d24]" value="50">50</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <CreateUnitModal
                isOpen={isModalOpen}
                initialData={editingUnit}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingUnit(null);
                    showSuccess(editingUnit ? 'Unit updated successfully!' : 'Unit created successfully!');
                    refetch();
                }}
            />

            <Modal
                isOpen={deleteConfirmModal.open}
                onClose={() => setDeleteConfirmModal({ open: false, unit: null })}
                title={<span className="text-gray-100">Delete Unit</span>}
            >
                <div className="p-5 space-y-5 bg-[#13151a]">
                    <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-2">
                        <Trash2 className="w-6 h-6 text-red-500" />
                    </div>
                    <p className="text-gray-300 text-center">
                        Are you sure you want to delete unit <strong className="text-white">{deleteConfirmModal.unit?.unitNumber}</strong>?
                    </p>
                    <p className="text-xs text-gray-500 text-center bg-red-500/5 p-3 rounded-xl border border-red-500/10">
                        <strong className="text-red-400 block mb-1">Warning</strong>
                        You can only delete a unit if it is currently vacant. This action cannot be undone.
                    </p>
                    <div className="flex justify-center gap-3 pt-2">
                        <button
                            className="px-5 py-2.5 rounded-xl border border-white/10 text-gray-300 font-medium hover:bg-white/5 transition-colors"
                            onClick={() => setDeleteConfirmModal({ open: false, unit: null })}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDeleteUnitConfirm}
                            className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-red-600/20"
                        >
                            Confirm Delete
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
