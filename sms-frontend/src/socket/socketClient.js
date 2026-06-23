import { io } from 'socket.io-client';
import { store } from '../store';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:3000';

let socket = null;

export const initSocket = () => {
    if (socket) return socket;

    const token = store.getState().auth.accessToken;
    if (!token) return null;

    socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket']
    });

    socket.on('connect', () => console.log('Socket connected:', socket.id));
    socket.on('disconnect', () => console.log('Socket disconnected'));
    socket.on('connect_error', (err) => console.error('Socket connect error:', err));

    return socket;
};

export const getSocket = () => {
    if (!socket) return initSocket();
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
