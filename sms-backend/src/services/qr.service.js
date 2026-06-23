import QRCode from 'qrcode';
import logger from '../utils/logger.js';

/**
 * Generates a QR Code as a base64 Data URI.
 *
 * @param {string|Object} data - The data to encode in the QR code
 * @param {Object} [options={}] - Additional QRCode options
 * @returns {Promise<string>} Base64 Data URI of the generated QR Code
 */
export const generateQRCodeDataURI = async (data, options = {}) => {
    try {
        const textData = typeof data === 'object' ? JSON.stringify(data) : String(data);
        const dataUri = await QRCode.toDataURL(textData, options);
        return dataUri;
    } catch (error) {
        logger.error(`Error generating QR code data URI: ${error.message}`);
        throw error;
    }
};

/**
 * Generates a QR Code as a Buffer (PNG format).
 *
 * @param {string|Object} data - The data to encode
 * @param {Object} [options={}] - Additional QRCode options
 * @returns {Promise<Buffer>} Buffer containing the PNG image of the QR Code
 */
export const generateQRCodeBuffer = async (data, options = {}) => {
    try {
        const textData = typeof data === 'object' ? JSON.stringify(data) : String(data);
        const buffer = await QRCode.toBuffer(textData, options);
        return buffer;
    } catch (error) {
        logger.error(`Error generating QR code buffer: ${error.message}`);
        throw error;
    }
};
