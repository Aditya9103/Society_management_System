import { useState } from 'react';
import { usePWA }   from '../../hooks/usePWA';
import { Download, RefreshCw, X, Smartphone } from 'lucide-react';

/**
 * PWAPrompt — renders two non-blocking prompts:
 *   1. Install prompt (bottom sheet) — when the browser signals installability
 *   2. Update banner (top-right toast style) — when a new SW version is ready
 */
export default function PWAPrompt() {
    const { canInstall, hasUpdate, installApp, updateApp } = usePWA();
    const [installDismissed, setInstallDismissed] = useState(false);
    const [updateDismissed, setUpdateDismissed]   = useState(false);

    const showInstall = canInstall  && !installDismissed;
    const showUpdate  = hasUpdate   && !updateDismissed;

    return (
        <>
            {/* ── Update Available Banner ───────────────────────────── */}
            {showUpdate && (
                <div
                    role="alert"
                    aria-live="assertive"
                    className="fixed top-4 right-4 z-[9998] max-w-sm w-full"
                    style={{ animation: 'slideInRight 0.4s ease forwards' }}
                >
                    <div
                        className="relative flex items-start gap-3 p-4 rounded-2xl border shadow-2xl"
                        style={{
                            background: 'rgba(15, 23, 42, 0.95)',
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                            borderColor: 'rgba(99, 102, 241, 0.4)',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.2)',
                        }}
                    >
                        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                            <RefreshCw className="w-4 h-4 text-indigo-400" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white">Update Available</p>
                            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                                A new version of Society MS is ready.
                            </p>
                            <button
                                onClick={updateApp}
                                className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                            >
                                <RefreshCw className="w-3 h-3" />
                                Refresh to update
                            </button>
                        </div>

                        <button
                            onClick={() => setUpdateDismissed(true)}
                            aria-label="Dismiss update notification"
                            className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-white/10 transition-colors"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            )}

            {/* ── Install Prompt (bottom sheet on mobile, card on desktop) ─ */}
            {showInstall && (
                <div
                    role="dialog"
                    aria-modal="false"
                    aria-labelledby="pwa-install-title"
                    className="fixed bottom-0 inset-x-0 z-[9997] sm:bottom-4 sm:right-4 sm:left-auto sm:max-w-sm sm:w-full"
                    style={{ animation: 'slideInUp 0.5s ease forwards' }}
                >
                    <div
                        className="relative p-5 sm:rounded-2xl border shadow-2xl"
                        style={{
                            background: 'rgba(15, 23, 42, 0.97)',
                            backdropFilter: 'blur(24px)',
                            WebkitBackdropFilter: 'blur(24px)',
                            borderColor: 'rgba(99, 102, 241, 0.3)',
                            borderBottomColor: 'transparent',
                            boxShadow: '0 -20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.15)',
                        }}
                    >
                        <button
                            onClick={() => setInstallDismissed(true)}
                            aria-label="Dismiss install prompt"
                            className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-white/10 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-14 h-14 rounded-2xl overflow-hidden border border-white/10 flex-shrink-0">
                                <img src="/icons/icon-192x192.png" alt="Society MS icon" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <p id="pwa-install-title" className="font-bold text-white">Society MS</p>
                                <p className="text-xs text-slate-400 mt-0.5">Add to Home Screen</p>
                            </div>
                        </div>

                        <p className="text-sm text-slate-300 leading-relaxed mb-4">
                            Install the app for a faster, native-like experience — works offline too!
                        </p>

                        <div className="flex items-center gap-3 text-xs text-slate-500 mb-5">
                            <span className="flex items-center gap-1.5">
                                <span className="text-indigo-400">✓</span> Works offline
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="text-indigo-400">✓</span> Push notifications
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="text-indigo-400">✓</span> Fast loading
                            </span>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setInstallDismissed(true)}
                                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 border border-white/10 transition-all"
                            >
                                Not now
                            </button>
                            <button
                                onClick={installApp}
                                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-95"
                                style={{
                                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                    boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
                                }}
                            >
                                <Download className="w-4 h-4" />
                                Install App
                            </button>
                        </div>

                        <p className="mt-3 text-center text-xs text-slate-600">
                            No App Store needed · Installs directly from browser
                        </p>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes slideInUp {
                    from { opacity: 0; transform: translateY(100%); }
                    to   { opacity: 1; transform: translateY(0);    }
                }
                @keyframes slideInRight {
                    from { opacity: 0; transform: translateX(110%); }
                    to   { opacity: 1; transform: translateX(0);    }
                }
            `}</style>
        </>
    );
}
