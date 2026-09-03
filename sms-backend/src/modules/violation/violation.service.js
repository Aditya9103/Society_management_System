import Violation from './violation.model.js';
import ApiError from '../../utils/ApiError.js';
import User from '../auth/user.model.js';
import Resident from '../resident/resident.model.js';
import { sendNotification } from '../../services/notification.service.js';
import mongoose from 'mongoose';

export const createViolation = async (societyId, data, reportedBy) => {
    const { residentId, vehicleId, type, description, fineAmount, photoUrl } = data;

    // Verify resident exists and belongs to society
    const resident = await Resident.findOne({ _id: residentId, societyId });
    if (!resident) {
        throw new ApiError(404, 'Resident not found in this society');
    }

    const violation = await Violation.create({
        societyId,
        residentId,
        vehicleId: vehicleId || null,
        type,
        description,
        fineAmount: fineAmount || 0,
        reportedBy,
        photoUrl
    });

    // Notify the resident
    try {
        const user = await User.findOne({ _id: resident.userId });
        if (user) {
            await sendNotification({
                userIds: [user._id.toString()],
                title: 'New Violation Logged',
                message: `A violation (${type}) has been logged against you with a fine of ₹${fineAmount || 0}.`,
                type: 'SYSTEM_ALERT',
                societyId: societyId
            });
        }
    } catch (error) {
        console.error('Failed to notify resident about violation:', error);
    }

    return violation;
};

export const getViolations = async (societyId, query = {}) => {
    const filter = { societyId };
    
    if (query.status) filter.status = query.status;
    if (query.residentId) filter.residentId = query.residentId;
    if (query.type) filter.type = query.type;

    const violations = await Violation.find(filter)
        .populate({
            path: 'residentId',
            select: 'flatNumber tower floor',
            populate: { path: 'userId', select: 'firstName lastName email phoneNumber avatar' }
        })
        .populate('reportedBy', 'firstName lastName role')
        .sort({ createdAt: -1 });

    return violations;
};

export const getMyViolations = async (societyId, residentId) => {
    return Violation.find({ societyId, residentId })
        .populate('reportedBy', 'firstName lastName role')
        .sort({ createdAt: -1 });
};

export const updateViolationStatus = async (societyId, violationId, status) => {
    const validStatuses = ['PENDING', 'PAID', 'APPEALED', 'DISMISSED'];
    if (!validStatuses.includes(status)) {
        throw new ApiError(400, 'Invalid status');
    }

    const violation = await Violation.findOneAndUpdate(
        { _id: violationId, societyId },
        { status },
        { new: true }
    );

    if (!violation) {
        throw new ApiError(404, 'Violation not found');
    }

    return violation;
};

export const getViolationStats = async (societyId) => {
    const stats = await Violation.aggregate([
        { $match: { societyId: new mongoose.Types.ObjectId(societyId) } },
        { 
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                totalFines: { $sum: '$fineAmount' }
            }
        }
    ]);

    const result = {
        totalViolations: 0,
        pendingAmount: 0,
        paidAmount: 0,
        pendingCount: 0,
        paidCount: 0,
        dismissedCount: 0,
        appealedCount: 0
    };

    stats.forEach(stat => {
        result.totalViolations += stat.count;
        if (stat._id === 'PENDING') {
            result.pendingCount = stat.count;
            result.pendingAmount = stat.totalFines;
        } else if (stat._id === 'PAID') {
            result.paidCount = stat.count;
            result.paidAmount = stat.totalFines;
        } else if (stat._id === 'DISMISSED') {
            result.dismissedCount = stat.count;
        } else if (stat._id === 'APPEALED') {
            result.appealedCount = stat.count;
        }
    });

    return result;
};
