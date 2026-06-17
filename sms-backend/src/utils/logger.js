import winston from 'winston';
import env from '../config/env.js';

const { combine, timestamp, printf, colorize } = winston.format;

// Define a custom log format
const logFormat = printf(({ level, message, timestamp, ...meta }) => {
    return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
});

/**
 * Global application logger using Winston.
 * It provides standard methods: logger.info(), logger.error(), logger.warn(), logger.debug()
 */
const logger = winston.createLogger({
    level: env.isProduction ? 'info' : 'debug',
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
    ),
    defaultMeta: { service: 'sms-backend' },
    transports: [
        //
        // - Write all logs with importance level of `error` or less to `error.log`
        // - Write all logs with importance level of `info` or less to `combined.log`
        //
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
    ],
});

// If we're not in production, log to the console with the custom colorized format
if (!env.isProduction) {
    logger.add(new winston.transports.Console({
        format: combine(
            colorize(),
            logFormat
        ),
    }));
}

export default logger;
