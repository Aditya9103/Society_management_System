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
                                <div className="flex items-center gap-1.5">
                                    <span className="font-mono text-xs text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                                        {log.resourceType}
                                    </span>
                                    {log.resourceName && (
                                        <span className="text-xs font-semibold text-slate-800">
                                            {log.resourceName}
                                        </span>
                                    )}
                                </div>
                                {log.resourceId && (
                                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{log.resourceId}</p>
                                )}
                                {log.afterState && Object.keys(log.afterState).length > 0 && (
                                    <div className="mt-1">
                                        {log.afterState.newStatus !== undefined ? (
                                            <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium ${
                                                log.afterState.newStatus ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                            }`}>
                                                {log.afterState.newStatus ? 'Activated' : 'Suspended'}
                                            </span>
                                        ) : (
                                            <span className="text-[10px] text-slate-500 font-mono">
                                                {JSON.stringify(log.afterState).substring(0, 50)}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </Table.Cell>
                            <Table.Cell>
                                {log.actorId ? (
                                    <>
                                        <p className="font-medium text-slate-900">
                                            {typeof log.actorId === 'object' 
                                                ? `${log.actorId.firstName} ${log.actorId.lastName}`
                                                : log.actorId}
                                        </p>
                                        <p className="text-[10px] text-slate-500 font-medium">
                                            {typeof log.actorId === 'object' ? log.actorId.role?.replace(/_/g, ' ') : log.actorRole}
                                        </p>
                                    </>
                                ) : (
                                    <span className="text-slate-400 italic text-sm">System</span>
                                )}
                            </Table.Cell>
                            <Table.Cell className="hidden md:table-cell">
                                <p className="text-sm text-slate-500 font-mono">
                                    {log.ipAddress === '::1' || log.ipAddress === '127.0.0.1' ? `localhost (${log.ipAddress})` : (log.ipAddress || '-')}
                                </p>
                                {log.userAgent && (
                                    <p className="text-[10px] text-slate-400 mt-1 max-w-[200px] md:max-w-xs break-words whitespace-normal" title={log.userAgent}>
                                        {log.userAgent}
                                    </p>
                                )}
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
