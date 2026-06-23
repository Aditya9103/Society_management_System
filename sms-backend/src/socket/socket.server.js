import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import logger from '../utils/logger.js';
import { ROOMS } from './rooms.js';

// Import handlers
import registerVisitorHandlers from './handlers/visitor.handler.js';
import registerEmergencyHandlers from './handlers/emergency.handler.js';
import registerNotificationHandlers from './handlers/notification.handler.js';

let io;

/**
 * Initialize the Socket.io server and attach it to the HTTP server.
 * @param {import('http').Server} httpServer - The core Node HTTP server
 */
export const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: env.clientOrigins,
            credentials: true,
        },
    });

    // ── Authentication Middleware ──
    io.use((socket, next) => {
        try {
            // Check auth token (can be sent in handshake.auth or headers)
            const token = socket.handshake.auth.token || socket.handshake.headers['authorization']?.split(' ')[1];
            
            if (!token) {
                return next(new Error('Authentication Error: No token provided'));
            }

            const decoded = jwt.verify(token, env.jwt.accessSecret);
            socket.user = decoded; // Attach user payload to socket
            next();
        } catch (error) {
            logger.warn(`Socket Auth Error: ${error.message}`);
            next(new Error('Authentication Error: Invalid token'));
        }
    });

    // ── Connection Handling ──
    io.on('connection', (socket) => {
        logger.info(`🔌 Socket connected: ${socket.id} (User ID: ${socket.user.sub || socket.user.id || socket.user._id})`);

        // Automatically join the user to their individual room and global broadcast room
        const userId = socket.user.sub || socket.user.id || socket.user._id;
        socket.join(ROOMS.USER(userId));
        socket.join(ROOMS.GLOBAL);

        // Join Role-specific rooms
        const role = socket.user.role?.toUpperCase();
        if (role === 'ADMIN' || role === 'SOCIETY_ADMIN' || role === 'SUPER_ADMIN') {
            socket.join(ROOMS.ADMIN);
        } else if (role === 'SECURITY_GUARD') {
            socket.join(ROOMS.GUARD);
        }

        // Join Flat room if applicable
        if (socket.user.flatId) {
            socket.join(ROOMS.FLAT(socket.user.flatId));
        }

        // Register event handlers
        registerVisitorHandlers(io, socket);
        registerEmergencyHandlers(io, socket);
        registerNotificationHandlers(io, socket);

        socket.on('disconnect', () => {
            logger.info(`🔌 Socket disconnected: ${socket.id}`);
        });
    });

    console.log(`🚀  Socket.io server initialized:      CORS [${env.clientOrigins.join(', ')}]`);
};

/**
 * Get the initialized Socket.io instance to emit events from external controllers/services.
 * @returns {Server}
 */
export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io has not been initialized!');
    }
    return io;
};
