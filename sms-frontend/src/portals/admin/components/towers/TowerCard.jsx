import React, { useState } from 'react';
import { Building2, ChevronDown, ChevronRight, Layers, Plus, Edit2, Trash2 } from 'lucide-react';

export default function TowerCard({ tower, onAddFloor, onEditTower, onDeleteTower, onEditFloor, onDeleteFloor }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 transition-all hover:shadow-md">
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
