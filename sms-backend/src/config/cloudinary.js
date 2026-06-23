import { v2 as cloudinary } from 'cloudinary';
import env from './env.js';
import logger from '../utils/logger.js';

if (env.cloudinary.cloudName && env.cloudinary.apiKey && env.cloudinary.apiSecret) {
    cloudinary.config({
        cloud_name: env.cloudinary.cloudName,
        api_key: env.cloudinary.apiKey,
        api_secret: env.cloudinary.apiSecret,
    });
    logger.info('Cloudinary configured successfully');
} else {
    logger.warn('Cloudinary credentials missing. Storage features may fail.');
}

export default cloudinary;
