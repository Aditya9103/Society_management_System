import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useScanVehicleEntryMutation, useScanVehicleExitMutation } from '../../../store/api/vehicleApi';
import { Car, Camera, CheckCircle2, ShieldAlert, LogIn, LogOut, Loader2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

export default function GuardVehiclePage() {
    const [scanEntry, { isLoading: isEntryLoading }] = useScanVehicleEntryMutation();
    const [scanExit, { isLoading: isExitLoading }] = useScanVehicleExitMutation();

    const [scanResult, setScanResult] = useState(null);
    const [error, setError] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const [mode, setMode] = useState('ENTRY'); // ENTRY or EXIT

    useEffect(() => {
        let scanner;
        if (isScanning) {
            scanner = new Html5QrcodeScanner("vehicle-qr-reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false);
            scanner.render(
                async (decodedText) => {
                    scanner.clear();
                    setIsScanning(false);
                    handleQrScan(decodedText);
                },
                (err) => {
                    // ignore generic read errors
                }
            );
        }
        return () => {
            if (scanner) scanner.clear().catch(console.error);
        };
    }, [isScanning, mode]);

    const handleQrScan = async (qrToken) => {
        setScanResult(null);
        setError(null);
        try {
            if (mode === 'ENTRY') {
                const res = await scanEntry({ qrToken }).unwrap();
                setScanResult({ type: 'ENTRY', data: res.data });
            } else {
                const res = await scanExit({ qrToken }).unwrap();
                setScanResult({ type: 'EXIT', data: res.data });
            }
        } catch (err) {
            setError(err?.data?.message || 'Failed to scan vehicle QR.');
        }
    };

    const handleManualTest = () => {
        const token = window.prompt("Enter Vehicle QR Token manually (for testing):");
        if (token) handleQrScan(token);
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-slate-800">Vehicle Entry/Exit</h1>
                <p className="text-slate-500 mt-1">Scan resident vehicle QR passes</p>
            </div>

            {/* Mode Toggle */}
            <div className="flex bg-slate-100 p-1 rounded-xl max-w-sm mx-auto">
                <button
                    onClick={() => { setMode('ENTRY'); setScanResult(null); setError(null); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-lg transition-all ${mode === 'ENTRY' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <LogIn className="h-4 w-4" /> Entry
                </button>
                <button
                    onClick={() => { setMode('EXIT'); setScanResult(null); setError(null); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-lg transition-all ${mode === 'EXIT' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <LogOut className="h-4 w-4" /> Exit
                </button>
            </div>

            {/* Scanner Area */}
            {!isScanning && !scanResult && !error && (
                <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-8 text-center max-w-sm mx-auto">
                    <Car className="mx-auto h-16 w-16 text-slate-300 mb-4" />
                    <Button onClick={() => setIsScanning(true)} className="w-full gap-2 py-6 text-lg">
                        <Camera className="h-5 w-5" /> Tap to Scan {mode} QR
                    </Button>
                    <button onClick={handleManualTest} className="mt-4 text-xs text-indigo-500 underline">Manual test override</button>
                </div>
            )}

            {(isEntryLoading || isExitLoading) && (
                <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mb-4" />
                    <p className="font-semibold text-slate-600">Verifying Pass...</p>
                </div>
            )}

            {isScanning && (
                <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-white p-4 max-w-md mx-auto">
                    <div id="vehicle-qr-reader" className="w-full rounded-xl overflow-hidden"></div>
                    <Button variant="secondary" className="w-full mt-4" onClick={() => setIsScanning(false)}>Cancel Scan</Button>
                </div>
            )}

            {/* Result Area */}
            {scanResult && (
                <div className="rounded-2xl bg-white p-6 shadow-xl border border-emerald-100 max-w-md mx-auto text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 mb-4">
                        <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">
                        Vehicle {scanResult.type === 'ENTRY' ? 'Entry' : 'Exit'} Allowed
                    </h2>
                    
                    <div className="mt-6 bg-slate-50 p-4 rounded-xl border border-slate-100 text-left space-y-2">
                        <div className="flex justify-between border-b border-slate-200 pb-2">
                            <span className="text-slate-500 text-sm">Vehicle No.</span>
                            <span className="font-bold text-slate-800">{scanResult.data.vehicle.vehicleNumber}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200 pb-2">
                            <span className="text-slate-500 text-sm">Resident</span>
                            <span className="font-medium text-slate-700">{scanResult.data.vehicle.residentId?.firstName} {scanResult.data.vehicle.residentId?.lastName}</span>
                        </div>
                        <div className="flex justify-between pb-2">
                            <span className="text-slate-500 text-sm">Unit</span>
                            <span className="font-medium text-slate-700">{scanResult.data.vehicle.unitId?.unitNumber}</span>
                        </div>
                        {scanResult.type === 'ENTRY' && (
                            <div className="flex justify-between bg-indigo-50 p-2 rounded-lg mt-2">
                                <span className="text-indigo-700 text-sm font-semibold">Allocated Parking</span>
                                <span className="font-black text-indigo-900">{scanResult.data.vehicle.parkingSlotId?.slotNumber || 'Unassigned'}</span>
                            </div>
                        )}
                        {scanResult.type === 'EXIT' && scanResult.data.exitLog?.durationMinutes && (
                            <div className="flex justify-between p-2 rounded-lg mt-2">
                                <span className="text-slate-500 text-sm font-semibold">Duration Inside</span>
                                <span className="font-bold text-slate-700">{scanResult.data.exitLog.durationMinutes} mins</span>
                            </div>
                        )}
                    </div>

                    <Button className="w-full mt-6" onClick={() => setScanResult(null)}>Scan Next Vehicle</Button>
                </div>
            )}

            {error && (
                <div className="rounded-2xl bg-white p-6 shadow-xl border border-red-100 max-w-md mx-auto text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-4">
                        <ShieldAlert className="h-8 w-8 text-red-600" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">Scan Failed</h2>
                    <p className="text-red-600 mt-2 font-medium bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>
                    <Button className="w-full mt-6" onClick={() => setError(null)}>Try Again</Button>
                </div>
            )}
        </div>
    );
}
