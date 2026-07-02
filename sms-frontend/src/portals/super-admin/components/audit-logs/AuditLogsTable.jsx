import React from 'react';
import Table from '../../../../components/ui/Table';

export default function AuditLogsTable({ logs, isLoading }) {
    return (
        <Table>
            <Table.Head>
                <Table.HeadCell>Action</Table.HeadCell>
                <Table.HeadCell>Resource</Table.HeadCell>
                <Table.HeadCell>Performed By</Table.HeadCell>
                <Table.HeadCell className="hidden md:table-cell">IP Address</Table.HeadCell>
                <Table.HeadCell>Date</Table.HeadCell>
            </Table.Head>
            {isLoading ? (
                <Table.Loader rows={6} cols={5} />
            ) : (
                <Table.Body>
                    {logs.map((log) => (
                        <Table.Row key={log._id}>
                            <Table.Cell>
                                <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-800">
                                    {log.action}
                                </span>
                            </Table.Cell>
                            <Table.Cell>
                                <span className="font-mono text-xs text-slate-600">
                                    {log.resourceType}
                                </span>
                                {log.resourceId && (
                                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{log.resourceId}</p>
                                )}
                            </Table.Cell>
                            <Table.Cell>
                                {log.actorId ? (
                                    <>
                                        <p className="font-medium text-slate-900">{log.actorId}</p>
                                        <p className="text-xs text-slate-500">{log.actorRole}</p>
                                    </>
                                ) : (
                                    <span className="text-slate-400 italic text-sm">System</span>
                                )}
                            </Table.Cell>
                            <Table.Cell className="hidden md:table-cell text-sm text-slate-500 font-mono">
                                {log.ipAddress || '-'}
                            </Table.Cell>
                            <Table.Cell className="text-sm text-slate-500">
                                {new Date(log.createdAt).toLocaleString('en-IN', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </Table.Cell>
                        </Table.Row>
                    ))}
                </Table.Body>
            )}
        </Table>
    );
}
