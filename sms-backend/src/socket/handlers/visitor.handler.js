import logger from '../../utils/logger.js';
import { ROOMS } from '../rooms.js';

export default (io, socket) => {
    // Event: Guard notifies flat about a new visitor
    socket.on('visitor:arrive', (payload) => {
        // payload: { flatId, visitorId, name, purpose, photoUrl }
        logger.info(`[Socket] Visitor arrived at flat ${payload.flatId}`);

        // Notify residents of the flat immediately for approval
        if (payload.flatId) {
            io.to(ROOMS.FLAT(payload.flatId)).emit('visitor:approval_request', {
                ...payload,
                timestamp: new Date()
            });
        }
    });

    // Event: Resident approves the visitor
    socket.on('visitor:approve', (payload) => {
        // payload: { visitorId, flatId, approvedBy }
        logger.info(`[Socket] Visitor ${payload.visitorId} APPROVED by flat ${payload.flatId}`);

        // Broadcast to all guards so the gate can let the visitor in
        io.to(ROOMS.GUARD).emit('visitor:approved', {
            ...payload,
            timestamp: new Date()
        });
    });

    // Event: Resident denies the visitor
    socket.on('visitor:deny', (payload) => {
        // payload: { visitorId, flatId, reason }
        logger.info(`[Socket] Visitor ${payload.visitorId} DENIED by flat ${payload.flatId}`);

        io.to(ROOMS.GUARD).emit('visitor:denied', {
            ...payload,
            timestamp: new Date()
        });
    });


};
