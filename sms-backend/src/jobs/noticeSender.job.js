import cron from 'node-cron';
import logger from '../utils/logger.js';
import Notice from '../modules/notice/notice.model.js';

const BATCH_SIZE = 50;

const processNotice = async (notice) => {
    try {
        notice.status = 'PUBLISHED';
        await notice.save();
        // Integration point: dispatch broadcast notification to all residents
        logger.info(`Notice ${notice._id} published successfully.`);
    } catch (error) {
        logger.error(`Failed to process notice ${notice._id}: ${error.message}`);
    }
};

export const scheduleNoticeSender = () => {
    // Run every  hours to check for scheduled notices
    cron.schedule('*/60 * * * *', async () => {
        logger.info('[JOB] Starting Scheduled Notice Sender...');
        try {
            const now = new Date();
            // Use Mongoose cursor for memory efficiency over large datasets
            const cursor = Notice.find({ status: 'SCHEDULED', scheduledAt: { $lte: now } }).cursor();

            let batch = [];
            let processedCount = 0;

            for await (const notice of cursor) {
                batch.push(notice);
                if (batch.length >= BATCH_SIZE) {
                    await Promise.allSettled(batch.map(processNotice));
                    processedCount += batch.length;
                    batch = [];
                }
            }
            if (batch.length > 0) {
                await Promise.allSettled(batch.map(processNotice));
                processedCount += batch.length;
            }

            logger.info(`[JOB] Scheduled Notice Sender completed. Processed ${processedCount} notices.`);
        } catch (error) {
            logger.error(`[JOB] Scheduled Notice Sender Error: ${error.message}`);
        }
    });
};
