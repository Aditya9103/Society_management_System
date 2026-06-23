import cron from 'node-cron';
import logger from '../utils/logger.js';
import Invoice from '../modules/payment/invoice.model.js';
import residentModel from '../modules/resident/resident.model.js';

const BATCH_SIZE = 50;

export const scheduleInvoiceGenerator = () => {
    // Run on the 1st of every month at midnight
    cron.schedule('0 0 1 * *', async () => {
        logger.info('[JOB] Starting Monthly Invoice Generator...');
        try {
            // Example highly optimized implementation using cursors to prevent memory spikes
            // Assuming you have a Resident model to iterate over
            // const cursor = Resident.find({ isActive: true }).cursor();
            // let batch = [];
            // for await (const doc of cursor) {
            //     batch.push(doc);
            //     if (batch.length >= BATCH_SIZE) {
            //         await Promise.allSettled(batch.map(processResidentInvoice));
            //         batch = [];
            //     }
            // }
            // if (batch.length > 0) {
            //     await Promise.allSettled(batch.map(processResidentInvoice));
            // }
            const cursor = residentModel.find({ isActive: true }).cursor()

            logger.info('[JOB] Monthly Invoice Generator completed successfully.');
        } catch (error) {
            logger.error(`[JOB] Invoice Generator Error: ${error.message}`);
        }
    });
};
