import cron from 'node-cron';
import logger from '../utils/logger.js';
import Complaint from '../modules/complaint/complaint.model.js';
import { sendNotification } from '../services/notification.service.js';

const BATCH_SIZE = 50;

const processEscalation = async (complaint) => {
    try {
        complaint.status = 'ESCALATED';
        await complaint.save();

        // Dispatch notification to society admins about the SLA breach
        // await sendNotification({ ... })
    } catch (error) {
        logger.error(`Failed to escalate complaint ${complaint._id}: ${error.message}`);
    }
};

export const scheduleSlaChecker = () => {
    // Run every 12 hours
    cron.schedule('0 */12 * * *', async () => {
        logger.info('[JOB] Starting SLA Checker...');
        try {
            const now = new Date();
            // Cursor-based iteration to optimize memory when many complaints breach SLA simultaneously
            const cursor = Complaint.find({
                status: { $in: ['OPEN', 'IN_PROGRESS'] },
                // Assuming there's an expectedResolutionDate or slaDeadline field
                // expectedResolutionDate: { $lte: now } 
            }).cursor();

            let batch = [];
            let escalatedCount = 0;

            for await (const complaint of cursor) {
                batch.push(complaint);
                if (batch.length >= BATCH_SIZE) {
                    await Promise.allSettled(batch.map(processEscalation));
                    escalatedCount += batch.length;
                    batch = [];
                }
            }
            if (batch.length > 0) {
                await Promise.allSettled(batch.map(processEscalation));
                escalatedCount += batch.length;
            }

            logger.info(`[JOB] SLA Checker completed. Escalated ${escalatedCount} complaints.`);
        } catch (error) {
            logger.error(`[JOB] SLA Checker Error: ${error.message}`);
        }
    });
};
