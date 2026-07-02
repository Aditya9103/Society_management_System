import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import './index.css';
import App from './App.jsx';

import { registerSW } from 'virtual:pwa-register';

// ── Service Worker Registration ──────────────────────────────────────────────
if ('serviceWorker' in navigator) {
    const updateSW = registerSW({
        onNeedRefresh() {
            // Handled by usePWA hook which listens to service worker updates
        },
        onOfflineReady() {
            console.info('[PWA] App ready to work offline');
        },
    });

    // Check for updates every hour
    setInterval(() => {
        updateSW(true);
    }, 60 * 60 * 1000);
}

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <Provider store={store}>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </Provider>
    </StrictMode>,
);
