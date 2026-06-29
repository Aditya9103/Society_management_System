import cron from 'node-cron';
import logger from '../utils/logger.js';

// Import individual jobs 
import { scheduleInvoiceGenerator } from './invoiceGenerator.job.js';
import { scheduleNoticeSender } from './noticeSender.job.js';
import { scheduleQrExpiry } from './qrExpiry.job.js';
import { scheduleReminderSender } from './reminderSender.job.js';
import { scheduleReportGenerator } from './reportGenerator.job.js';
import { scheduleSlaChecker } from './slaChecker.job.js';

export const initializeJobs = () => {
    console.log('⚙️   Initializing background jobs...');

    // Mount schedules
    // scheduleInvoiceGenerator();
    scheduleNoticeSender();
    scheduleQrExpiry();
    scheduleReminderSender();
    //scheduleReportGenerator();
    scheduleSlaChecker();

    console.log('✅  Background jobs initialized:       6 active schedules running');
};
