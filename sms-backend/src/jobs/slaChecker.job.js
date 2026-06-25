import cron from 'node-cron';
import logger from '../utils/logger.js';
import Complaint from '../modules/complaint/complaint.model.js';
import { sendNotification } from '../services/notification.service.js';

const BATCH_SIZE = 50;

// Optimized individual execution handler
const processEscalation = async (complaint, reason) => {
    try {
        complaint.status = 'ESCALATED';
        complaint.slaBreached = true;
        complaint.slaBreachedAt = new Date();
        complaint.escalationReason = reason;
        await complaint.save();

        // ✅ Now safely triggered with actual document data!
        await sendNotification({
            recipientGroup: 'SOCIETY_ADMIN',
            title: `🚨 Complaint Escalated: #${complaint._id}`,
            message: `Complaint regarding "${complaint.title || 'Property Issue'}" breached SLA. Reason: ${reason}`
        });
    } catch (error) {
        logger.error(`Failed to escalate complaint ${complaint._id}: ${error.message}`);
    }
};

export const scheduleSlaChecker = () => {
    // Run every 2 hour to check SLAs and Auto-closure
    cron.schedule('0 */2 * * *', async () => {
        logger.info('[JOB] Starting SLA Checker...');
        try {
            const now = new Date();
            const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

            let escalatedCount = 0;
            let closedCount = 0;
            let batch = [];

            // ==========================================
            // 1. Assignment SLA Breach (OPEN > 24h)
            // ==========================================
            const unassignedCursor = Complaint.find({ status: 'OPEN', createdAt: { $lte: oneDayAgo } }).cursor();
            for await (const complaint of unassignedCursor) {
                batch.push(processEscalation(complaint, 'SLA Breach: Not assigned within 24 hours'));
                escalatedCount++;

                if (batch.length >= BATCH_SIZE) {
                    await Promise.allSettled(batch);
                    batch = [];
                }
            }
            if (batch.length > 0) {
                await Promise.allSettled(batch);
                batch = [];
            }

            // ==========================================
            // 2. Resolution SLA Breach (Stalled > 7 days)
            // ==========================================
            const unresolvedCursor = Complaint.find({
                status: { $in: ['ASSIGNED', 'IN_PROGRESS', 'PENDING_RESIDENT'] },
                createdAt: { $lte: sevenDaysAgo }
            }).cursor();

            for await (const complaint of unresolvedCursor) {
                batch.push(processEscalation(complaint, 'SLA Breach: Not resolved within 7 days'));
                escalatedCount++;

                if (batch.length >= BATCH_SIZE) {
                    await Promise.allSettled(batch);
                    batch = [];
                }
            }
            if (batch.length > 0) {
                await Promise.allSettled(batch);
                batch = [];
            }

            // ==========================================
            // 3. Auto-closure (RESOLVED > 48h)
            // ==========================================
            // (Notifications aren't needed for silent closure, so updateMany is perfectly optimized here)
            const closureResult = await Complaint.updateMany(
                { status: 'RESOLVED', resolvedAt: { $lte: fortyEightHoursAgo } },
                { $set: { status: 'CLOSED' } }
            );
            closedCount = closureResult.modifiedCount;

            logger.info(`[JOB] SLA Checker completed. Escalated ${escalatedCount}, Auto-closed ${closedCount}.`);
        } catch (error) {
            logger.error(`[JOB] SLA Checker Error: ${error.message}`);
        }
    });
};
