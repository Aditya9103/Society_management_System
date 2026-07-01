import React, { useRef, useState, useEffect } from 'react';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import QRCode from 'react-qr-code';
import { Home } from 'lucide-react';
import { useUploadIdCardPdfMutation, useGenerateIdCardMutation } from '../../../../store/api/idCardApi';

const toBase64 = async (url) => {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (e) {
        console.warn('Failed to convert to base64', e);
        return null;
    }
};

export function DigitalIdCardGenerator({ user, profile, society, unit, onComplete, onError, triggerGeneration }) {
    const cardRef = useRef(null);
    const [uploadPdf] = useUploadIdCardPdfMutation();
    const [generateIdCard] = useGenerateIdCardMutation();
    const [logoBase64, setLogoBase64] = useState(null);
    const [photoBase64, setPhotoBase64] = useState(null);
    const [imagesReady, setImagesReady] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [qrData, setQrData] = useState(profile?.qrData);

    useEffect(() => {
        let isMounted = true;
        const loadImages = async () => {
            setImagesReady(false);
            if (society?.logoUrl) {
                const b64 = await toBase64(society.logoUrl);
                if (isMounted) setLogoBase64(b64);
            }
            const userPhoto = user?.profilePhotoUrl || profile?.photoUrl;
            if (userPhoto) {
                const b64 = await toBase64(userPhoto);
                if (isMounted) setPhotoBase64(b64);
            }
            if (isMounted) setImagesReady(true);
        };

        loadImages();
        return () => { isMounted = false; };
    }, [society?.logoUrl, user?.profilePhotoUrl, profile?.photoUrl]);

    useEffect(() => {
        const process = async () => {
            if (triggerGeneration && !isProcessing && imagesReady) {
                setIsProcessing(true);
                try {
                    let currentQrData = qrData;

                    // 1. Generate ID Card data on backend if not exists or if regenerating
                    const response = await generateIdCard(profile?._id).unwrap();
                    currentQrData = response.data.qrData;
                    setQrData(currentQrData);

                    // Give React time to render the new QR code
                    await new Promise(resolve => setTimeout(resolve, 800));

                    if (!cardRef.current) throw new Error("Card ref not found");

                    // 2. Snapshot using html-to-image to avoid oklch parsing errors
                    const canvasPromise = toPng(cardRef.current, {
                        pixelRatio: 3,
                        backgroundColor: '#ffffff',
                        skipFonts: true, // Safely bypasses all cross-origin stylesheet parsing
                        style: {
                            transform: 'scale(1)',
                            transformOrigin: 'top left'
                        }
                    });

                    const imgData = await Promise.race([
                        canvasPromise,
                        new Promise((_, reject) => setTimeout(() => reject(new Error('html-to-image timeout')), 10000))
                    ]);

                    // 3. Create PDF
                    const pdf = new jsPDF({
                        orientation: 'portrait',
                        unit: 'mm',
                        format: [54, 85.6]
                    });

                    pdf.addImage(imgData, 'PNG', 0, 0, 54, 85.6);
                    const pdfBlob = pdf.output('blob');

                    const formData = new FormData();
                    formData.append('pdf', pdfBlob, 'id_card.pdf');

                    // 4. Upload
                    await uploadPdf({ residentId: profile?._id, formData }).unwrap();

                    if (onComplete) onComplete();
                } catch (error) {
                    console.error('Failed to generate and upload PDF', error);
                    if (onError) onError(error);
                } finally {
                    setIsProcessing(false);
                }
            }
        };

        process();
    }, [triggerGeneration, imagesReady]); // Explicitly excluding isProcessing to prevent loop

    const containerStyle = {
        position: 'absolute',
        top: '-9999px',
        left: '-9999px',
        opacity: 0,
        pointerEvents: 'none',
        zIndex: -1
    };

    const residentName = user ? `${user.firstName} ${user.lastName}` : 'Resident Name';
    const initials = user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}` : 'R';
    const idNumber = profile?.residentCode ? profile.residentCode.split('-').pop() : '—';

    // Single uniform gradient reused across the whole card
    const brandGradient = 'linear-gradient(135deg, #4338ca 0%, #6d28d9 50%, #7e22ce 100%)';

    return (
        <div style={containerStyle}>
            {/* 214 x 338 = standard CR80 aspect ratio (2.125 x 3.375 in) */}
            <div
                ref={cardRef}
                className="w-[214px] h-[338px] relative overflow-hidden flex flex-col mx-auto rounded-[8px] shadow-2xl"
                style={{ fontFamily: "'Inter', sans-serif", backgroundColor: '#ffffff' }}
            >
                {/* ===== TOP BAND ===== */}
                <div
                    className="w-full pt-3 pb-9 px-3.5 flex items-center gap-2 relative"
                    style={{ background: brandGradient }}
                >
                    <div
                        className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 overflow-hidden"
                        style={{ backgroundColor: '#ffffff' }}
                    >
                        {logoBase64 ? (
                            <img src={logoBase64} alt="Society Logo" className="w-full h-full object-contain" />
                        ) : (
                            <Home className="w-3.5 h-3.5" style={{ color: '#4338ca' }} />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-[10.5px] leading-tight truncate" style={{ color: '#ffffff' }}>
                            {society?.name || 'Society Management'}
                        </h3>
                        <p className="text-[6px] font-semibold uppercase tracking-[0.12em]" style={{ color: '#e0d4fd' }}>
                            Identity Card
                        </p>
                    </div>
                </div>

                {/* ===== PHOTO (overlaps band edge) ===== */}
                <div className="flex justify-center -mt-8 relative z-10">
                    <div
                        className="w-[76px] h-[92px] rounded-md overflow-hidden border-[3px] shadow-md flex items-center justify-center"
                        style={{ borderColor: '#ffffff', backgroundColor: '#f1f5f9' }}
                    >
                        {photoBase64 ? (
                            <img src={photoBase64} alt="Resident" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-xl font-black" style={{ color: '#94a3b8' }}>{initials}</span>
                        )}
                    </div>
                </div>

                {/* ===== NAME + ROLE ===== */}
                <div className="flex flex-col items-center mt-2 px-3">
                    <h2 className="text-[13.5px] font-bold text-center leading-tight" style={{ color: '#1e1b4b' }}>
                        {residentName}
                    </h2>
                    <p
                        className="text-[7.5px] font-bold uppercase tracking-wide mt-1 px-2.5 py-[2px] rounded-full"
                        style={{ color: '#ffffff', background: brandGradient }}
                    >
                        {profile?.ownershipType || 'Resident'}
                    </p>
                </div>

                {/* ===== DETAILS  ===== */}
                <div className="px-5 mt-3.5 flex flex-col gap-1.5">
                    <div className="flex items-baseline justify-between">
                        <span className="text-[7.5px] font-medium" style={{ color: '#94a3b8' }}>Unit No.</span>
                        <span className="text-[10px] font-bold" style={{ color: '#1e1b4b' }}>
                            {unit?.unitNumber || '—'}
                        </span>
                    </div>
                    <div className="flex items-baseline justify-between">
                        <span className="text-[7.5px] font-medium" style={{ color: '#94a3b8' }}>ID No.</span>
                        <span className="text-[10px] font-bold font-mono" style={{ color: '#4338ca' }}>
                            {idNumber}
                        </span>
                    </div>
                </div>

                {/* ===== SPACER ===== */}
                <div className="flex-1" />

                {/* ===== BOTTOM BAND: QR ===== */}
                <div
                    className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5"
                    style={{ background: brandGradient }}
                >
                    <p className="text-[6px] font-medium leading-snug max-w-[100px]" style={{ color: '#e0d4fd' }}>
                        Scan this code at the gate to verify identity &amp; residency.
                    </p>
                    <div className="shrink-0 p-1 rounded-md" style={{ backgroundColor: '#ffffff' }}>
                        {qrData ? (
                            <QRCode value={qrData} size={58} level="Q" />
                        ) : (
                            <div className="w-[58px] h-[58px] rounded flex items-center justify-center" style={{ backgroundColor: '#f1f5f9' }} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}