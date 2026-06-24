import React, { useState, useEffect } from 'react';
import { useGuardScanQrMutation, useGuardLogEntryMutation } from '../../../../store/api/staffApi';
import { QrCode, LogIn, Camera } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Input } from '../../../../components/ui/Input';
import { Button } from '../../../../components/ui/Button';

export default function ScanQrForm() {
    const [qrCode, setQrCode] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [guardScanQr, { isLoading, data, isError, error }] = useGuardScanQrMutation();
    const [guardLogEntry] = useGuardLogEntryMutation();

    useEffect(() => {
        if (!isScanning) return;

        const scanner = new Html5QrcodeScanner("reader", {
            qrbox: { width: 250, height: 250 },
            fps: 5,
        });

        scanner.render(
            async (result) => {
                // Attempt to clear scanner
                try {
                    await scanner.clear();
                } catch (e) {
                    console.error("Failed to clear scanner", e);
                }
                setIsScanning(false);
                setQrCode(result);
                try {
                    await guardScanQr({ qrCode: result }).unwrap();
                } catch (err) { }
            },
            (err) => {
                // Ignore general scan errors (e.g. no QR found in current frame)
            }
        );

        return () => {
            try {
                scanner.clear();
            } catch (e) { }
        };
    }, [isScanning, guardScanQr]);

    const handleScan = async (e) => {
        e.preventDefault();
        try {
            await guardScanQr({ qrCode }).unwrap();
        } catch (err) { }
    };

    const handleAllowEntry = async () => {
        if (!data?.data?.visitor?._id) return;
        try {
            await guardLogEntry({ id: data.data.visitor._id }).unwrap();
            alert('Entry Logged Successfully!');
            setQrCode('');
        } catch (err) {
            alert('Failed to log entry: ' + (err.data?.message || err.message));
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm p-6 max-w-lg border border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <QrCode className="h-5 w-5 text-orange-500" /> Scan Visitor QR
            </h2>

            <form onSubmit={handleScan} className="flex gap-3 items-end">
                <div className="flex-1">
                    <Input
                        value={qrCode}
                        onChange={e => setQrCode(e.target.value)}
                        placeholder="Enter QR Code String..."
                        required
                    />
                </div>
                <div className="pb-1">
                    <Button type="submit" disabled={isLoading} isLoading={isLoading}>
                        Scan
                    </Button>
                </div>
            </form>

            <div className="mt-6 flex flex-col items-center">
                {!isScanning ? (
                    <Button type="button" variant="secondary" onClick={() => setIsScanning(true)} className="w-full">
                        <Camera className="w-4 h-4 mr-2" /> Open Camera / Upload QR Image
                    </Button>
                ) : (
                    <div className="w-full">
                        <div id="reader" className="w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50"></div>
                        <Button type="button" variant="secondary" onClick={() => setIsScanning(false)} className="mt-3 w-full">
                            Cancel Scan
                        </Button>
                    </div>
                )}
            </div>

            {isError && <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-200">{error?.data?.message || 'Invalid QR'}</div>}

            {data?.data?.visitor && (
                <div className="mt-6 p-5 border border-emerald-200 bg-emerald-50 rounded-xl space-y-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-bold text-emerald-900 text-lg">{data.data.visitor.visitorName}</p>
                            <p className="text-emerald-700 text-sm font-medium">{data.data.visitor.visitorType}</p>
                        </div>
                        <span className="px-2.5 py-1 bg-emerald-200 text-emerald-800 text-xs font-bold rounded-lg uppercase">
                            {data.data.visitor.status}
                        </span>
                    </div>

                    <Button onClick={handleAllowEntry} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white border-0">
                        <LogIn className="w-5 h-5 mr-2" /> Grant Access & Log Entry
                    </Button>
                </div>
            )}
        </div>
    );
}
