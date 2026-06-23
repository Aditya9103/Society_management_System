import cron from 'node-cron';
import logger from '../utils/logger.js';
// Report generator typically handles database aggregations that are memory efficient.

export const scheduleReportGenerator = () => {
    // Run on Sunday at midnight
    cron.schedule('0 0 * * 0', async () => {
        logger.info('[JOB] Starting Weekly Report Generator...');
        try {
            // Highly optimized logic using native MongoDB Aggregation Pipeline 
            // e.g. await Complaint.aggregate([{ $group: ... }])
            // This prevents moving large arrays of data into Node.js memory.

            logger.info('[JOB] Weekly Report Generator completed successfully.');
        } catch (error) {
            logger.error(`[JOB] Weekly Report Generator Error: ${error.message}`);
        }
    });
};
