import React from 'react';
import Table from '../../../../components/ui/Table';
import StatusBadge from '../../../../components/ui/StatusBadge';
import { Button } from '../../../../components/ui/Button';

export default function SocietiesTable({ societies, isLoading, isToggling, onToggleStatus }) {
    return (
        <Table>
            <Table.Head>
                <Table.HeadCell>Society</Table.HeadCell>
                <Table.HeadCell className="hidden sm:table-cell">Location</Table.HeadCell>
                <Table.HeadCell className="hidden md:table-cell">Units</Table.HeadCell>
                <Table.HeadCell className="hidden sm:table-cell">Status</Table.HeadCell>
                <Table.HeadCell className="hidden sm:table-cell">Actions</Table.HeadCell>
            </Table.Head>
            {isLoading ? (
                <Table.Loader rows={6} cols={5} />
            ) : (
                <Table.Body>
                    {societies.map((s) => (
                        <Table.Row key={s._id}>
                            <Table.Cell className="whitespace-normal">
                                <p className="font-medium text-slate-900">{s.name}</p>
                                {s.registrationNumber && (
                                    <p className="text-xs text-slate-400">Reg: {s.registrationNumber}</p>
                                )}
                                {/* Mobile stacked info */}
                                <div className="mt-3 sm:hidden flex flex-col gap-2">
                                    <div className="text-xs text-slate-500 space-y-0.5">
                                        <p>{s.city}, {s.state} {s.pincode}</p>
                                        <p>{s.totalUnits} units total</p>
                                    </div>
                                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                        <StatusBadge status={s.isActive ? 'ACTIVE' : 'INACTIVE'} />
                                        <Button
                                            variant={s.isActive ? 'danger' : 'secondary'}
                                            size="sm"
                                            isLoading={isToggling}
                                            onClick={() => onToggleStatus(s._id)}
                                        >
                                            {s.isActive ? 'Deactivate' : 'Activate'}
                                        </Button>
                                    </div>
                                </div>
                                {/* Tablet stacked info */}
                                <div className="mt-1 hidden sm:block md:hidden text-xs text-slate-500">
                                    <p>{s.totalUnits} units total</p>
                                </div>
                            </Table.Cell>
                            <Table.Cell className="hidden sm:table-cell">
                                <p>{s.city}, {s.state}</p>
                                <p className="text-xs text-slate-400">{s.pincode}</p>
                            </Table.Cell>
                            <Table.Cell className="hidden md:table-cell">
                                <span className="font-medium">{s.totalUnits}</span>
                                <span className="text-slate-400"> total</span>
                            </Table.Cell>
                            <Table.Cell className="hidden sm:table-cell">
                                <StatusBadge status={s.isActive ? 'ACTIVE' : 'INACTIVE'} />
                            </Table.Cell>
                            <Table.Cell className="hidden sm:table-cell">
                                <Button
                                    variant={s.isActive ? 'danger' : 'secondary'}
                                    size="sm"
                                    isLoading={isToggling}
                                    onClick={() => onToggleStatus(s._id)}
                                >
                                    {s.isActive ? 'Deactivate' : 'Activate'}
                                </Button>
                            </Table.Cell>
                        </Table.Row>
                    ))}
                </Table.Body>
            )}
        </Table>
    );
}
