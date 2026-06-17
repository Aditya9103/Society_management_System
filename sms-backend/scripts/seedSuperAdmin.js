import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../src/modules/auth/user.model.js';
import { ROLES } from '../src/config/constants.js';
import logger from '../src/utils/logger.js';

dotenv.config();

const seedSuperAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        logger.info('✅ Connected to database');

        const email = 'superadmin@sms.com';
        const password = process.argv[2] || 'SuperAdmin@123'; // Accept password from args or use default

        const existing = await User.findOne({ email });
        if (existing) {
            logger.warn(`⚠️ Super Admin with email ${email} already exists.`);
            process.exit(0);
        }

        const passwordHash = await bcrypt.hash(password, 10);

        await User.create({
            firstName: 'Super',
            lastName: 'Admin',
            email,
            passwordHash,
            role: ROLES.SUPER_ADMIN,
            registrationStatus: 'APPROVED',
            isEmailVerified: true,
            isActive: true,
        });

        logger.info(`🎉 Super Admin created successfully!`);
        logger.info(`📧 Email: ${email}`);
        logger.info(`🔑 Password: ${password}`);

        process.exit(0);
    } catch (error) {
        logger.error(`❌ Error seeding Super Admin: ${error.message}`);
        process.exit(1);
    }
};

seedSuperAdmin();
