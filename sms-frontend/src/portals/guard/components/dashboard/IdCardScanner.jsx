import React, { useState, useEffect } from 'react';
import { useVerifyIdCardMutation } from '../../../../store/api/idCardApi';
import { ScanFace, CheckCircle2, AlertCircle, RefreshCw, X, Camera } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function IdCardScanner() {
    const [verifyIdCard, { isLoading }] = useVerifyIdCardMutation();
    const [result, setResult] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [isScanning, setIsScanning] = useState(false);

    useEffect(() => {
        if (!isScanning) return;

        const scanner = new Html5QrcodeScanner(
            "qr-reader",
            { fps: 10, qrbox: { width: 250, height: 250 }, verbose: false },
            false
        );

        scanner.render(
            async (decodedText) => {
                // Stop scanning immediately on successful read
                scanner.clear();
                setIsScanning(false);
                setErrorMsg('');
                
                try {
                    const res = await verifyIdCard({ qrData: decodedText }).unwrap();
                    setResult(res.data);
                } catch (err) {
                    setErrorMsg(err?.data?.message || 'Verification failed. Invalid or expired QR code.');
                }
            },
            (err) => {
                // Background scan errors are ignored (e.g. no qr found in current frame)
            }
        );

        return () => {
            scanner.clear().catch(e => console.error("Failed to clear scanner", e));
        };
    }, [isScanning, verifyIdCard]);

    const reset = () => {
        setResult(null);
        setErrorMsg('');
        setIsScanning(false);
    };

    return (
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 mt-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
                <ScanFace className="h-5 w-5 text-indigo-500" /> Verify ID Card
            </h2>

            {errorMsg && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm mb-4">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {errorMsg}
                </div>
            )}

            {!result && !isScanning && !isLoading && (
                <div className="flex flex-col items-center justify-center py-8 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                    <Camera className="w-12 h-12 text-slate-300 mb-3" />
                    <p className="text-sm text-slate-500 mb-4 text-center max-w-xs">
                        Use your device camera to scan a resident's Digital ID Card at the gate.
                    </p>
                    <Button onClick={() => setIsScanning(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                        <ScanFace className="w-4 h-4 mr-2" />
                        Start Camera Scanner
                    </Button>
                </div>
            )}

            {isScanning && !isLoading && (
                <div className="w-full">
                    <div className="flex justify-end mb-2">
                        <Button variant="outline" size="sm" onClick={() => setIsScanning(false)} className="text-slate-500">
                            <X className="w-4 h-4 mr-1" /> Cancel Scan
                        </Button>
                    </div>
                    {/* The HTML5 QR Code library injects its UI into this div */}
                    <div id="qr-reader" className="w-full overflow-hidden rounded-xl border border-slate-200"></div>
                </div>
            )}

            {isLoading && (
                <div className="flex flex-col items-center justify-center py-12 bg-slate-50 rounded-xl">
                    <RefreshCw className="h-8 w-8 animate-spin text-indigo-500 mb-3" />
                    <p className="text-sm text-slate-600 font-medium">Verifying ID Card...</p>
                </div>
            )}

            {result && !isLoading && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
                    <div className="flex items-center gap-3 mb-4 border-b border-emerald-100 pb-4">
                        <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-emerald-800 text-lg">Valid Resident</h3>
                            <p className="text-emerald-600 text-sm">ID Card verified successfully</p>
                        </div>
                    </div>
                    
                    <div className="grid gap-3 sm:grid-cols-2 text-sm text-slate-700 mb-5">
                        <div>
                            <span className="block text-xs text-slate-500 mb-0.5">Name</span>
                            <span className="font-medium">{result.resident.name}</span>
                        </div>
                        <div>
                            <span className="block text-xs text-slate-500 mb-0.5">Unit</span>
                            <span className="font-medium">{result.resident.unit}</span>
                        </div>
                        <div>
                            <span className="block text-xs text-slate-500 mb-0.5">Status</span>
                            <span className="font-medium">{result.resident.status}</span>
                        </div>
                    </div>

                    <Button variant="outline" onClick={reset} className="w-full bg-white">
                        Scan Another
                    </Button>
                </div>
            )}
        </div>
    );
}
