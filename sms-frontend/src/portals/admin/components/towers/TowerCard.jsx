import React, { useState } from 'react';
import { Building2, ChevronDown, ChevronRight, Layers, Plus, Edit2, Trash2 } from 'lucide-react';
import Card from '../../../../components/ui/Card';

export default function TowerCard({ tower, onAddFloor, onEditTower, onDeleteTower, onEditFloor, onDeleteFloor }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <Card className="transition-all hover:shadow-md">
            <Card.Body className="p-0">
            <div className="flex items-center justify-between p-5">
                <div
                    role="button"
                    tabIndex={0}
                    className="flex cursor-pointer items-center gap-4 flex-1"
                    onClick={() => setExpanded((e) => !e)}
                    onKeyDown={(e) => e.key === 'Enter' && setExpanded((v) => !v)}
                >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-sm">
                        <Building2 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <p className="text-base font-bold text-slate-800">{tower.name}</p>
                        <div className="mt-1 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
                            <span className="bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">Code: <span className="font-mono text-slate-800">{tower.code}</span></span>
                            <span className="bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">{tower.totalFloors} floors</span>
                            <span className="bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">{tower.totalUnits ?? 0} units</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {tower.amenities?.slice(0, 2).map((a) => (
                        <span key={a} className="hidden rounded-md border border-indigo-100 bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-700 sm:inline">
                            {a}
                        </span>
                    ))}

                    <button
                        onClick={(e) => { e.stopPropagation(); onEditTower(tower); }}
                        className="text-slate-400 hover:bg-violet-50 hover:text-violet-600 transition-colors p-1.5 rounded-md border border-transparent hover:border-violet-100"
                        title="Edit Tower"
                    >
                        <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDeleteTower(tower); }}
                        className="text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors p-1.5 rounded-md border border-transparent hover:border-red-100"
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
                <div className="border-t border-slate-100/60 bg-slate-50/30 px-5 pb-5 pt-4">
                    <div className="mb-3 flex items-center justify-between">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
                            Floors ({tower.floors?.length ?? 0})
                        </p>
                        <button
                            onClick={(e) => { e.stopPropagation(); onAddFloor(tower); }}
                            className="flex items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700 transition-colors hover:bg-violet-100 hover:border-violet-300 shadow-sm"
                        >
                            <Plus className="h-3.5 w-3.5" /> Add Floor
                        </button>
                    </div>

                    {!tower.floors?.length ? (
                        <p className="text-xs font-medium text-slate-500">No floors yet. Click "Add Floor" to create one.</p>
                    ) : (
                        <div className="grid gap-1.5 sm:grid-cols-3 lg:grid-cols-4">
                            {tower.floors.map((floor) => (
                                <div
                                    key={floor._id}
                                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-white shadow-sm px-3 py-2 group hover:border-violet-200 transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        <Layers className="h-4 w-4 shrink-0 text-slate-500 group-hover:text-violet-500 transition-colors" />
                                        <div>
                                            <p className="text-xs font-bold text-slate-800">{floor.floorName}</p>
                                            <p className="text-[11px] font-semibold text-slate-500">{floor.totalUnits} units</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onEditFloor(tower, floor); }}
                                            className="text-slate-400 hover:text-violet-600 hover:bg-violet-50 p-1.5 rounded"
                                        >
                                            <Edit2 className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onDeleteFloor(tower, floor); }}
                                            className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded"
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
            </Card.Body>
        </Card>
    );
}
