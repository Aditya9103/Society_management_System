import Razorpay from 'razorpay';
import env from './env.js';
import logger from '../utils/logger.js';

let razorpay = null;

try {
    if (env.razorpay.keyId && env.razorpay.keySecret) {
        razorpay = new Razorpay({
            key_id: env.razorpay.keyId,
            key_secret: env.razorpay.keySecret,
        });
        logger.info('Razorpay configured successfully');
    } else {
        logger.warn('Razorpay credentials missing. Payment features will fail.');
    }
} catch (error) {
    logger.error(`Razorpay initialization error: ${error.message}`);
}

export default razorpay;
