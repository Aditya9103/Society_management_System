import cron from 'node-cron';
import logger from '../utils/logger.js';
import Notice from '../modules/notice/notice.model.js';
import * as noticeService from '../modules/notice/notice.service.js';

// In-memory map to store active timeouts
// Key: notice ID (string)
// Value: NodeJS Timeout object
const activeTimeouts = new Map();

/**
 * Dynamically schedules a timeout for a notice if it's due within the next 2 hours.
 */
export const scheduleNoticePublish = (noticeId, scheduledAt) => {
    // Clear existing if any
    cancelScheduledNotice(noticeId);

    if (!scheduledAt) return;

    const now = Date.now();
    const scheduledTime = new Date(scheduledAt).getTime();
    const delay = Math.max(0, scheduledTime - now);

    // Only schedule in memory if it's within the next 2 hours (7200000 ms)
    if (delay <= 7200000) {
        const timeoutId = setTimeout(async () => {
            try {
                await noticeService.publishScheduledNotice(noticeId);
                activeTimeouts.delete(noticeId.toString());
            } catch (error) {
                logger.error(`Failed to execute scheduled publish for notice ${noticeId}: ${error.message}`);
            }
        }, delay);
        
        activeTimeouts.set(noticeId.toString(), timeoutId);
        logger.info(`Notice ${noticeId} scheduled in memory to publish in ${Math.round(delay / 1000)}s.`);
    }
};

/**
 * Cancels an active timeout if the notice is rescheduled, published manually, or deleted.
 */
export const cancelScheduledNotice = (noticeId) => {
    const idStr = noticeId.toString();
    if (activeTimeouts.has(idStr)) {
        clearTimeout(activeTimeouts.get(idStr));
        activeTimeouts.delete(idStr);
        logger.info(`Cancelled in-memory schedule for notice ${noticeId}`);
    }
};

/**
 * Loads notices scheduled in the next 2 hours from DB into memory.
 */
export const loadNextTwoHours = async () => {
    try {
        const twoHoursFromNow = new Date(Date.now() + 7200000);
        
        const notices = await Notice.find({ 
            status: 'SCHEDULED', 
            scheduledAt: { $lte: twoHoursFromNow } 
        }).select('_id scheduledAt').lean();

        for (const notice of notices) {
            scheduleNoticePublish(notice._id, notice.scheduledAt);
        }
        
        if (notices.length > 0) {
            logger.info(`[JOB] Sweeper loaded ${notices.length} notices into precision memory scheduler.`);
        }
    } catch (error) {
        logger.error(`[JOB] Sweeper error: ${error.message}`);
    }
};

export const scheduleNoticeSender = () => {
    // Run immediately on boot to hydrate the next 2 hours
    loadNextTwoHours();

    // Run every hour at the top of the hour
    cron.schedule('0 * * * *', () => {
        logger.info('[JOB] Starting Hourly Sweeper for Scheduled Notices...');
        loadNextTwoHours();
    });
};
