import cron from 'node-cron';
import logger from '../utils/logger.js';
import Visitor from '../modules/visitor/visitor.model.js';

const BATCH_SIZE = 100;

const processVisitor = async (visitor) => {
    try {
        visitor.status = 'EXPIRED';
        await visitor.save();
    } catch (error) {
        logger.error(`Failed to expire QR for visitor ${visitor._id}: ${error.message}`);
    }
};

export const scheduleQrExpiry = () => {
    // Run every 12 hours
    cron.schedule('0 */12 * * *', async () => {
        logger.info('[JOB] Starting QR Expiry checker...');
        try {
            const now = new Date();
            // Fetch records using cursor to prevent RAM overload on large queues
            const cursor = Visitor.find({
                status: { $in: ['PENDING', 'APPROVED'] },
                validUntil: { $lte: now }
            }).cursor();

            let batch = [];
            let updatedCount = 0;

            for await (const visitor of cursor) {
                batch.push(visitor);
                if (batch.length >= BATCH_SIZE) {
                    await Promise.allSettled(batch.map(processVisitor));
                    updatedCount += batch.length;
                    batch = [];
                }
            }
            if (batch.length > 0) {
                await Promise.allSettled(batch.map(processVisitor));
                updatedCount += batch.length;
            }

            logger.info(`[JOB] QR Expiry checker completed. Expired ${updatedCount} passes.`);
        } catch (error) {
            logger.error(`[JOB] QR Expiry checker Error: ${error.message}`);
        }
    });
};
