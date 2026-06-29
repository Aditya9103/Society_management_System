import cloudinary from '../config/cloudinary.js';
import logger from '../utils/logger.js';

/**
 * Uploads a file buffer or stream to Cloudinary.
 *
 * @param {Buffer|string} file - The file buffer or base64 string to upload
 * @param {Object} [options={}] - Additional Cloudinary upload options (e.g. folder)
 * @returns {Promise<Object>} The Cloudinary upload result
 */
export const uploadFile = async (file, options = {}) => {
    try {
        if (!cloudinary) {
            throw new Error('Cloudinary is not configured');
        }

        if (typeof file === 'string') {
            const result = await cloudinary.uploader.upload(file, {
                folder: 'sms',
                ...options,
            });
            logger.info(`Successfully uploaded file to Cloudinary: ${result.secure_url}`);
            return result;
        }

        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: 'sms', ...options },
                (error, result) => {
                    if (error) {
                        return reject(error);
                    }
                    logger.info(`Successfully uploaded file stream to Cloudinary: ${result.secure_url}`);
                    resolve(result);
                }
            );

            uploadStream.end(file);
        });
    } catch (error) {
        logger.error(`Error uploading file to Cloudinary: ${error.message}`);
        throw error;
    }
};

/**
 * Deletes a file from Cloudinary by its public ID.
 *
 * @param {string} publicId - The Cloudinary public ID of the file
 * @returns {Promise<Object>} The Cloudinary deletion result
 */
export const deleteFile = async (publicId) => {
    try {
        if (!cloudinary) {
            throw new Error('Cloudinary is not configured');
        }
        const result = await cloudinary.uploader.destroy(publicId);
        logger.info(`Successfully deleted file from Cloudinary: ${publicId}`);
        return result;
    } catch (error) {
        logger.error(`Error deleting file from Cloudinary: ${error.message}`);
        throw error;
    }
};

/**
 * Extracts the public ID from a Cloudinary URL.
 * 
 * @param {string} url - The Cloudinary URL
 * @returns {string|null} The public ID or null if invalid
 */
export const extractPublicId = (url) => {
    if (!url) return null;
    try {
        const parts = url.split('/upload/');
        if (parts.length < 2) return null;
        let path = parts[1];
        // Remove version if present (e.g., v1234567890/)
        if (path.match(/^v\d+\//)) {
            path = path.replace(/^v\d+\//, '');
        }
        // Remove extension
        const lastDot = path.lastIndexOf('.');
        if (lastDot !== -1) {
            path = path.substring(0, lastDot);
        }
        return path;
    } catch (error) {
        return null;
    }
};
