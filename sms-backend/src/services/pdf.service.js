import PDFDocument from 'pdfkit';
import logger from '../utils/logger.js';

/**
 * Generic utility to generate a PDF and return it as a Buffer.
 * Provides a base layout, fonts, and headers.
 *
 * @param {Function} buildContent - Callback to build the specific content of the PDF.
 *                                  Receives the PDFDocument instance as an argument.
 * @returns {Promise<Buffer>} The generated PDF as a Buffer.
 */
export const generatePDF = (buildContent) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            const buffers = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            // Base Layout / Headers
            doc.fontSize(20).text('Society Management System', { align: 'center' });
            doc.moveDown();
            doc.fontSize(10).text('123 Main Street, City, Country, ZIP', { align: 'center' });
            doc.moveDown(2);

            // Let the caller build the specific content
            buildContent(doc);

            // Base Footer
            doc.moveDown(2);
            doc.fontSize(10).text('Thank you for using our services.', { align: 'center', opacity: 0.5 });

            doc.end();
        } catch (error) {
            logger.error(`Error generating PDF: ${error.message}`);
            reject(error);
        }
    });
};

/**
 * Specific template for a Maintenance Invoice.
 *
 * @param {Object} invoiceData - Data required for the invoice.
 * @param {string} invoiceData.residentName - Name of the resident.
 * @param {string} invoiceData.flatNumber - Flat/Unit number.
 * @param {number} invoiceData.amount - Amount due.
 * @param {string} invoiceData.dueDate - Due date for the payment.
 * @param {string} invoiceData.invoiceId - Unique invoice ID.
 * @returns {Promise<Buffer>}
 */
export const generateMaintenanceInvoice = async (invoiceData) => {
    return generatePDF((doc) => {
        doc.fontSize(16).text('Maintenance Invoice', { underline: true });
        doc.moveDown();

        doc.fontSize(12).text(`Invoice ID: ${invoiceData.invoiceId}`);
        doc.text(`Date: ${new Date().toLocaleDateString()}`);
        doc.moveDown();

        doc.text(`Billed To:`);
        doc.text(`Name: ${invoiceData.residentName}`);
        doc.text(`Flat Number: ${invoiceData.flatNumber}`);
        doc.moveDown();

        doc.text(`Amount Due: Rs. ${invoiceData.amount}`);
        doc.text(`Due Date: ${invoiceData.dueDate}`);
    });
};

/**
 * Specific template for a Payment Receipt.
 *
 * @param {Object} receiptData - Data required for the receipt.
 * @param {string} receiptData.residentName - Name of the resident.
 * @param {string} receiptData.flatNumber - Flat/Unit number.
 * @param {number} receiptData.amountPaid - Amount that was paid.
 * @param {string} receiptData.paymentDate - Date of payment.
 * @param {string} receiptData.transactionId - Payment transaction ID.
 * @returns {Promise<Buffer>}
 */
export const generatePaymentReceipt = async (receiptData) => {
    return generatePDF((doc) => {
        doc.fontSize(16).text('Payment Receipt', { underline: true });
        doc.moveDown();

        doc.fontSize(12).text(`Transaction ID: ${receiptData.transactionId}`);
        doc.text(`Date of Payment: ${receiptData.paymentDate}`);
        doc.moveDown();

        doc.text(`Received From:`);
        doc.text(`Name: ${receiptData.residentName}`);
        doc.text(`Flat Number: ${receiptData.flatNumber}`);
        doc.moveDown();

        doc.text(`Amount Paid: Rs. ${receiptData.amountPaid}`);
    });
};
