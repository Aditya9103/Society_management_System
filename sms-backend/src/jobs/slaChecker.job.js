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
    // Run every hour to check SLAs and Auto-closure
    cron.schedule('0 * * * *', async () => {
        logger.info('[JOB] Starting SLA Checker...');
        try {
            const now = new Date();
            const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

            // 1. Assignment SLA Breach (OPEN for > 24h)
            const unassigned = await Complaint.find({ status: 'OPEN', createdAt: { $lte: oneDayAgo } });
            let escalatedCount = 0;
            for (const c of unassigned) {
                c.status = 'ESCALATED';
                c.slaBreached = true;
                c.slaBreachedAt = new Date();
                c.escalationReason = 'SLA Breach: Not assigned within 24 hours';
                await c.save();
                escalatedCount++;
            }

            // 2. Resolution SLA Breach (ASSIGNED/IN_PROGRESS/PENDING_RESIDENT > 7 days)
            const unresolved = await Complaint.find({
                status: { $in: ['ASSIGNED', 'IN_PROGRESS', 'PENDING_RESIDENT'] },
                createdAt: { $lte: sevenDaysAgo }
            });
            for (const c of unresolved) {
                c.status = 'ESCALATED';
                c.slaBreached = true;
                c.slaBreachedAt = new Date();
                c.escalationReason = 'SLA Breach: Not resolved within 7 days';
                await c.save();
                escalatedCount++;
            }

            // 3. Auto-closure (RESOLVED for > 48h)
            const autoClose = await Complaint.find({ status: 'RESOLVED', resolvedAt: { $lte: fortyEightHoursAgo } });
            let closedCount = 0;
            for (const c of autoClose) {
                c.status = 'CLOSED';
                await c.save();
                closedCount++;
            }

            logger.info(`[JOB] SLA Checker completed. Escalated ${escalatedCount}, Auto-closed ${closedCount}.`);
        } catch (error) {
            logger.error(`[JOB] SLA Checker Error: ${error.message}`);
        }
    });
};
