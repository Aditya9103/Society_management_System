import React from 'react';
import Table from '../../../../components/ui/Table';
import StatusBadge from '../../../../components/ui/StatusBadge';
import { Button } from '../../../../components/ui/Button';

const PLAN_COLORS = {
    BASIC: 'bg-gray-100 text-gray-600',
    STANDARD: 'bg-blue-100 text-blue-700',
    ENTERPRISE: 'bg-violet-100 text-violet-700',
};

export default function TenantsTable({ tenants, isLoading, isToggling, onToggleStatus }) {
    return (
        <Table>
            <Table.Head>
                <Table.HeadCell>Organisation</Table.HeadCell>
                <Table.HeadCell className="hidden sm:table-cell">Slug</Table.HeadCell>
                <Table.HeadCell className="hidden sm:table-cell">Plan</Table.HeadCell>
                <Table.HeadCell className="hidden md:table-cell">Contact</Table.HeadCell>
                <Table.HeadCell className="hidden sm:table-cell">Status</Table.HeadCell>
                <Table.HeadCell className="hidden sm:table-cell">Actions</Table.HeadCell>
            </Table.Head>
            {isLoading ? (
                <Table.Loader rows={6} cols={6} />
            ) : (
                <Table.Body>
                    {tenants.map((t) => (
                        <Table.Row key={t._id}>
                            <Table.Cell className="whitespace-normal">
                                <p className="font-medium text-slate-900">{t.name}</p>
                                <p className="text-xs text-slate-400">
                                    {new Date(t.createdAt).toLocaleDateString('en-IN')}
                                </p>
                                {/* Mobile stacked info */}
                                <div className="mt-3 sm:hidden flex flex-col gap-2">
                                    <div className="text-xs text-slate-500 space-y-1">
                                        <p><span className="font-semibold">Slug:</span> {t.slug}</p>
                                        <p><span className="font-semibold">Plan:</span> {t.plan}</p>
                                        <p><span className="font-semibold">Contact:</span> {t.contactName} ({t.contactEmail})</p>
                                    </div>
                                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                        <StatusBadge status={t.isActive ? 'ACTIVE' : 'INACTIVE'} />
                                        <Button
                                            variant={t.isActive ? 'danger' : 'secondary'}
                                            size="sm"
                                            isLoading={isToggling}
                                            onClick={() => onToggleStatus(t._id)}
                                        >
                                            {t.isActive ? 'Deactivate' : 'Activate'}
                                        </Button>
                                    </div>
                                </div>
                                {/* Tablet stacked info */}
                                <div className="mt-1 hidden sm:block md:hidden text-xs text-slate-500">
                                    <p><span className="font-semibold">Contact:</span> {t.contactName} ({t.contactEmail})</p>
                                </div>
                            </Table.Cell>
                            <Table.Cell className="hidden sm:table-cell">
                                <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-600">
                                    {t.slug}
                                </span>
                            </Table.Cell>
                            <Table.Cell className="hidden sm:table-cell">
                                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${PLAN_COLORS[t.plan] || 'bg-slate-100 text-slate-600'}`}>
                                    {t.plan}
                                </span>
                            </Table.Cell>
                            <Table.Cell className="hidden md:table-cell">
                                <p className="text-slate-700">{t.contactName}</p>
                                <p className="text-xs text-slate-400">{t.contactEmail}</p>
                            </Table.Cell>
                            <Table.Cell className="hidden sm:table-cell">
                                <StatusBadge status={t.isActive ? 'ACTIVE' : 'INACTIVE'} />
                            </Table.Cell>
                            <Table.Cell className="hidden sm:table-cell">
                                <Button
                                    variant={t.isActive ? 'danger' : 'secondary'}
                                    size="sm"
                                    isLoading={isToggling}
                                    onClick={() => onToggleStatus(t._id)}
                                >
                                    {t.isActive ? 'Deactivate' : 'Activate'}
                                </Button>
                            </Table.Cell>
                        </Table.Row>
                    ))}
                </Table.Body>
            )}
        </Table>
    );
}
