import cron from 'node-cron';
import logger from '../utils/logger.js';
import Invoice from '../modules/payment/invoice.model.js';
import { sendNotification } from '../services/notification.service.js';

const BATCH_SIZE = 50;

const processReminder = async (invoice) => {
    try {
        if (!invoice.resident) return;
        
        await sendNotification({
            userId: invoice.resident,
            type: 'PAYMENT_REMINDER',
            title: 'Payment Reminder',
            message: `Your invoice ${invoice.invoiceId || invoice._id} of Rs.${invoice.amount} is due soon or overdue.`,
            channels: ['in-app', 'email'],
        });
        
        invoice.reminderSent = true;
        await invoice.save();
    } catch (error) {
        logger.error(`Failed to send reminder for invoice ${invoice._id}: ${error.message}`);
    }
};

export const scheduleReminderSender = () => {
    // Run daily at 9:00 AM
    cron.schedule('0 9 * * *', async () => {
        logger.info('[JOB] Starting Payment Reminder Sender...');
        try {
            const now = new Date();
            const threeDaysFromNow = new Date();
            threeDaysFromNow.setDate(now.getDate() + 3);

            // Fetch unpaid invoices using a cursor to process large datasets optimally
            const cursor = Invoice.find({ 
                status: 'UNPAID', 
                dueDate: { $lte: threeDaysFromNow },
                reminderSent: { $ne: true }
            }).cursor();
            
            let batch = [];
            let processedCount = 0;

            for await (const invoice of cursor) {
                batch.push(invoice);
                if (batch.length >= BATCH_SIZE) {
                    await Promise.allSettled(batch.map(processReminder));
                    processedCount += batch.length;
                    batch = [];
                }
            }
            if (batch.length > 0) {
                await Promise.allSettled(batch.map(processReminder));
                processedCount += batch.length;
            }
            
            logger.info(`[JOB] Payment Reminder Sender completed. Sent ${processedCount} reminders.`);
        } catch (error) {
            logger.error(`[JOB] Payment Reminder Sender Error: ${error.message}`);
        }
    });
};
