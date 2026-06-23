import logger from '../../utils/logger.js';
import { ROOMS } from '../rooms.js';

export default (io, socket) => {
    // Event: Resident triggers an SOS panic button
    socket.on('emergency:sos', (payload) => {
        // payload: { flatId, location, type (e.g., MEDICAL, FIRE, SECURITY) }
        const userId = socket.user.id || socket.user._id;
        logger.info(`[Socket] 🚨 SOS triggered by User ${userId} at Flat ${payload.flatId}`);
        
        const alertData = {
            ...payload,
            emergencyId: `SOS-${Date.now()}`,
            timestamp: new Date(),
            triggeredBy: userId,
            userName: socket.user.name || 'Resident',
            role: socket.user.role
        };

        // Instantly notify all guards and admins
        io.to(ROOMS.GUARD).to(ROOMS.ADMIN).emit('emergency:alert', alertData);
        
        // Also notify flat members so they are aware of the SOS
        if (payload.flatId) {
            io.to(ROOMS.FLAT(payload.flatId)).emit('emergency:alert', alertData);
        }
    });

    // Event: Admin or Guard acknowledges/resolves the SOS
    socket.on('emergency:resolve', (payload) => {
        // payload: { emergencyId, flatId, resolvedBy, notes }
        logger.info(`[Socket] SOS ${payload.emergencyId} resolved by ${socket.user.id || socket.user._id}`);
        
        const resolveData = {
            ...payload,
            timestamp: new Date(),
            resolvedBy: socket.user.id || socket.user._id
        };

        io.to(ROOMS.GUARD).to(ROOMS.ADMIN).to(ROOMS.FLAT(payload.flatId)).emit('emergency:resolved', resolveData);
    });
};
