import transporter from '../config/nodemailer.js';
import env from '../config/env.js';
import logger from '../utils/logger.js';


/**
 * Send an email using the configured SMTP transporter (e.g., Brevo).
 * 
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} [options.text] - Plain text body
 * @param {string} [options.html] - HTML body
 * @returns {Promise<void>}
 */
export const sendEmail = async ({ to, subject, text, html }) => {
    try {
        const mailOptions = {
            from: env.smtp.from,
            to,
            subject,
            ...(text && { text }),
            ...(html && { html }),
        };

        await transporter.sendMail(mailOptions);
        logger.info(`Successfully sent email to ${to}`);
    } catch (error) {
        logger.error(`Failed to send email to ${to}: ${error.message}`);
        throw error;
    }
};
