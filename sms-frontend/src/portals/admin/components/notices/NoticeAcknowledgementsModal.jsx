import Modal from '../../../../components/ui/Modal';
import { useGetNoticeAcknowledgementsQuery } from '../../../../store/api/societyAdminApi';
import { CheckCircle2 } from 'lucide-react';

export default function NoticeAcknowledgementsModal({ notice, onClose }) {
    const { data: acks, isLoading, isError } = useGetNoticeAcknowledgementsQuery(notice._id);

    return (
        <Modal isOpen={true} onClose={onClose} title="Notice Acknowledgements">
            <div className="p-4">
                <div className="mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="font-semibold text-slate-800">{notice.title}</p>
                    <div className="mt-2 flex items-center justify-between text-sm text-slate-600">
                        <span>Total Targets: <strong>{notice.sentToCount || 0}</strong></span>
                        <span>Acknowledged: <strong className="text-emerald-600">{notice.acknowledgedCount || 0}</strong></span>
                    </div>
                </div>

                <div className="max-h-[400px] overflow-auto border border-slate-200 rounded-xl">
                    {isLoading && <div className="p-8 text-center text-slate-500">Loading acknowledgements...</div>}
                    {isError && <div className="p-8 text-center text-red-500">Failed to load data.</div>}
                    {!isLoading && !isError && (!acks || acks.length === 0) && (
                        <div className="p-8 text-center text-slate-500">No residents have acknowledged this notice yet.</div>
                    )}

                    {!isLoading && !isError && acks?.length > 0 && (
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 whitespace-nowrap">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">Resident</th>
                                    <th className="px-4 py-3 font-semibold">Unit</th>
                                    <th className="px-4 py-3 font-semibold">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {acks.map(ack => (
                                    <tr key={ack._id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                                <span className="font-medium text-slate-800">
                                                    {ack.residentId?.userId?.firstName} {ack.residentId?.userId?.lastName}
                                                </span>
                                            </div>
                                            <div className="text-xs text-slate-400 pl-6">{ack.residentId?.residentCode}</div>
                                        </td>
                                        <td className="px-4 py-3">{ack.residentId?.unitId?.unitNumber || 'N/A'}</td>
                                        <td className="px-4 py-3 text-xs text-slate-500">
                                            {new Date(ack.createdAt).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
            <Modal.Footer>
                <div className="flex justify-end w-full">
                    <button onClick={onClose} className="rounded-xl px-4 py-2 font-medium text-slate-600 hover:bg-slate-100">Close</button>
                </div>
            </Modal.Footer>
        </Modal>
    );
}
