import cron from 'node-cron';
import logger from '../utils/logger.js';
import * as docRepo from '../modules/document/document.repository.js';
import { sendNotification } from '../services/notification.service.js';

/**
 * Job: Check Document Expiry
 * Runs every day at 12:00 AM
 */
export const initializeDocumentExpiryJob = () => {
    cron.schedule('0 0 * * *', async () => {
        logger.info('Running document expiry job...');

        try {
            // Check for documents expiring in exactly 30, 15, 7, 1 days
            const notifyDays = [30, 15, 7, 1];
            
            for (const days of notifyDays) {
                const targetDate = new Date();
                targetDate.setDate(targetDate.getDate() + days);
                targetDate.setHours(23, 59, 59, 999);

                // Get documents expiring before this targetDate but after today
                const expiringDocs = await docRepo.getExpiringDocuments(targetDate);
                
                for (const doc of expiringDocs) {
                    if (!doc.ownerId) continue;
                    
                    // Filter exactly matching the day threshold
                    const diffTime = Math.abs(doc.expiryDate - new Date());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    
                    if (diffDays === days) {
                        let recipientId = null;
                        
                        // If owner is resident
                        if (doc.ownerType === 'RESIDENT') recipientId = doc.ownerId.userId;
                        else recipientId = doc.uploadedBy; // Default to uploader if not resident

                        await sendNotification({
                            userId: recipientId,
                            title: 'Document Expiring Soon',
                            body: `Your document "${doc.title}" is expiring in ${days} day(s). Please renew it.`,
                            type: 'DOCUMENT_EXPIRY',
                            data: { documentId: doc._id }
                        });
                    }
                }
            }

            // Check for expired documents
            const expiredDocs = await docRepo.getExpiredDocuments();
            for (const doc of expiredDocs) {
                let recipientId = null;
                if (doc.ownerType === 'RESIDENT') recipientId = doc.ownerId.userId;
                else recipientId = doc.uploadedBy;

                await sendNotification({
                    userId: recipientId,
                    title: 'Document Expired',
                    body: `Your document "${doc.title}" has expired.`,
                    type: 'DOCUMENT_EXPIRED',
                    data: { documentId: doc._id }
                });

                // Update status to ARCHIVED/EXPIRED
                doc.status = 'ARCHIVED';
                await doc.save();
            }

        } catch (error) {
            logger.error(`Error in document expiry job: ${error.message}`);
        }
    });
};
