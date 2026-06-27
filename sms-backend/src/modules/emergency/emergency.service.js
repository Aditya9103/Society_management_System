import * as emergencyRepo from './emergency.repository.js';
import User from '../auth/user.model.js';
import Resident from '../resident/resident.model.js';
import Society from '../society/society.model.js';
import { sendNotification } from '../../services/notification.service.js';
import { getIO } from '../../socket/socket.server.js';
import { ROOMS } from '../../socket/rooms.js';
import logger from '../../utils/logger.js';
import ApiError from '../../utils/ApiError.js';
import { ROLES } from '../../config/constants.js';
import { sendEmail } from '../../services/email.service.js'; // Assuming it has export const sendEmail = async ({ to, subject, html })

export const triggerSOS = async (userId, societyId, data) => {
    // 1. Fetch Resident and their Unit
    const resident = await Resident.findOne({ userId })
        .populate({
            path: 'unitId',
            select: 'unitNumber floorId',
            populate: {
                path: 'floorId',
                select: 'floorName towerId',
                populate: {
                    path: 'towerId',
                    select: 'name'
                }
            }
        })
        .populate('userId', 'firstName lastName phone');

    if (!resident) {
        throw ApiError.badRequest('Only residents can trigger SOS');
    }

    // 2. Build detailed location description
    let detailedLocation = `Unit ${resident.unitId?.unitNumber || 'Unknown'}`;
    if (resident.unitId?.floorId) {
        detailedLocation += `, ${resident.unitId.floorId.floorName}`;
        if (resident.unitId.floorId.towerId) {
            detailedLocation += `, ${resident.unitId.floorId.towerId.name}`;
        }
    }

    const userName = resident.userId ? `${resident.userId.firstName} ${resident.userId.lastName}` : 'Resident';
    const userPhone = resident.userId?.phone ? ` (${resident.userId.phone})` : '';

    const defaultDescription = `${userName}${userPhone} at ${detailedLocation}`;

    // 3. Create the emergency record
    const emergencyData = {
        societyId,
        emergencyType: data.emergencyType || 'PANIC',
        triggeredBy: userId,
        locationUnitId: resident.unitId?._id,
        locationDescription: data.locationDescription || defaultDescription,
        latitude: data.latitude,
        longitude: data.longitude,
        status: 'ACTIVE',
        notificationsSent: { push: true, sms: false, whatsapp: false }
    };

    const emergency = await emergencyRepo.create(emergencyData);

    // 3. Find Guards and Admins to notify
    const staffToNotify = await User.find({
        societyId,
        role: { $in: [ROLES.SECURITY_GUARD, ROLES.SOCIETY_ADMIN, ROLES.FACILITY_MANAGER] },
        isActive: true
    }).select('_id fcmTokens role email').lean();

    // 4. Send Notifications via Push/In-App/Socket to Guards and Admins
    if (staffToNotify.length > 0) {
        await sendNotification({
            users: staffToNotify,
            societyId,
            type: 'EMERGENCY_SOS',
            title: '🚨 EMERGENCY SOS 🚨',
            message: `Emergency (${emergency.emergencyType}) triggered at ${emergencyData.locationDescription}`,
            priority: 'URGENT',
            referenceType: 'EMERGENCY',
            referenceId: emergency._id
        });
    }

    // 5. Emit global socket event for the society to sound alarms on dashboards
    const room = ROOMS.SOCIETY(societyId);
    getIO().to(room).emit('EMERGENCY_ALARM', {
        emergencyId: emergency._id,
        type: emergency.emergencyType,
        location: emergencyData.locationDescription,
        timestamp: new Date()
    });

    // 6. Notify Resident's personal emergency contacts via Email (simulate SMS/Call if no gateway)
    const contacts = resident.emergencyContacts || [];
    const society = await Society.findById(societyId).select('name contactEmail').lean();

    // Send a summary email to the resident or society admin outlining the emergency and the contacts to call
    const notifyEmail = resident.userId?.email || society.contactEmail;

    const contactListHtml = contacts.map(c => `<li>${c.name} (${c.relation}) - Ph: ${c.phone}</li>`).join('');
    
    if (notifyEmail && contacts.length > 0) {
        sendEmail({
            to: notifyEmail,
            subject: `🚨 URGENT: SOS Triggered for ${userName}`,
            html: `
                <div style="font-family: Arial, sans-serif; color: #333; max-w: 600px; border: 2px solid #dc2626; padding: 20px; border-radius: 10px;">
                    <h2 style="color: #dc2626; margin-top: 0;">🚨 EMERGENCY SOS TRIGGERED 🚨</h2>
                    <p style="font-size: 16px;"><strong>Resident:</strong> ${userName} ${userPhone}</p>
                    <p style="font-size: 16px;"><strong>Location:</strong> ${detailedLocation}</p>
                    <p style="font-size: 16px;"><strong>Emergency Type:</strong> ${emergencyData.emergencyType}</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                    <h3 style="margin-bottom: 10px;">Emergency Contacts To Notify:</h3>
                    <ul style="background: #fef2f2; padding: 15px 30px; border-radius: 8px;">${contactListHtml}</ul>
                    <p style="font-weight: bold; color: #b91c1c;">Security has been alerted via Push Notification and Alarms.</p>
                </div>
            `
        }).catch(err => logger.error(`Failed to email emergency contacts summary: ${err.message}`));
    }

    // NEW: Also directly dispatch an email to each family member if they have an email address provided
    contacts.forEach(contact => {
        if (contact.email) {
            sendEmail({
                to: contact.email,
                subject: `🚨 URGENT SOS: ${userName} Needs Immediate Help`,
                html: `
                    <div style="font-family: Arial, sans-serif; color: #333; max-w: 600px; border: 3px solid #dc2626; padding: 20px; border-radius: 10px;">
                        <h2 style="color: #dc2626; margin-top: 0; text-align: center;">🚨 FAMILY EMERGENCY ALERT 🚨</h2>
                        <p style="font-size: 16px;">Dear <strong>${contact.name}</strong>,</p>
                        <p style="font-size: 16px;">Your family member <strong>${userName}</strong> has just triggered an SOS emergency alarm at their residence.</p>
                        <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <p style="font-size: 16px; margin: 5px 0;"><strong>Resident:</strong> ${userName} ${userPhone}</p>
                            <p style="font-size: 16px; margin: 5px 0;"><strong>Location:</strong> ${detailedLocation}</p>
                            <p style="font-size: 16px; margin: 5px 0;"><strong>Emergency Type:</strong> ${emergencyData.emergencyType}</p>
                        </div>
                        <p style="font-size: 16px;"><strong>Please contact them immediately or call the society security desk.</strong></p>
                        <p style="font-size: 14px; color: #666; margin-top: 20px;">Society Security has already been notified and alarms are sounding.</p>
                    </div>
                `
            }).catch(err => logger.error(`Failed to email direct emergency contact ${contact.email}: ${err.message}`));
        }
    });

    return emergency;
};

export const updateEmergencyStatus = async (id, societyId, userId, data) => {
    const emergency = await emergencyRepo.findById(id);
    if (!emergency) throw ApiError.notFound('Emergency not found');
    if (emergency.societyId.toString() !== societyId.toString()) throw ApiError.forbidden('Unauthorized access to emergency');

    const updateQuery = { $set: {} };
    if (data.status) {
        updateQuery.$set.status = data.status;
        if (data.status === 'RESOLVED' || data.status === 'FALSE_ALARM') {
            updateQuery.$set.resolvedAt = new Date();
            updateQuery.$set.resolvedBy = userId;
        }
    }
    if (data.resolutionNotes) {
        updateQuery.$set.resolutionNotes = data.resolutionNotes;
    }

    // Add current user to responders if marking as RESPONDING
    if (data.status === 'RESPONDING') {
        const alreadyResponding = emergency.responders.some(r => r.userId?._id?.toString() === userId.toString() || r.userId?.toString() === userId.toString());
        if (!alreadyResponding) {
            updateQuery.$push = {
                responders: { userId, respondedAt: new Date(), action: 'Responded to alert' }
            };
        }
    }

    const updated = await emergencyRepo.updateById(id, updateQuery);

    // Notify clients that dashboard needs refresh
    const room = ROOMS.SOCIETY(societyId);
    getIO().to(room).emit('EMERGENCY_UPDATED', { emergencyId: id, status: updated.status });

    // Also notify the resident who triggered it
    if (data.status === 'RESPONDING' || data.status === 'RESOLVED') {
        try {
            const residentToNotify = await User.findById(emergency.triggeredBy).select('_id fcmTokens').lean();
            if (residentToNotify) {
                await sendNotification({
                    users: [residentToNotify],
                    societyId,
                    type: 'EMERGENCY_ALERT',
                    title: data.status === 'RESPONDING' ? '🚨 Security is Responding' : '✅ Emergency Resolved',
                    message: data.status === 'RESPONDING'
                        ? 'A security guard has acknowledged your SOS and is on their way.'
                        : 'Your emergency situation has been marked as resolved.',
                    priority: 'HIGH',
                    referenceType: 'EMERGENCY',
                    referenceId: id
                });
            }
        } catch (err) {
            logger.error(`Failed to notify resident of status update: ${err.message}`);
        }
    }

    return updated;
};

export const getActiveEmergencies = async (societyId) => {
    return await emergencyRepo.findActiveBySociety(societyId);
};

export const broadcastUpdate = async (societyId, adminId, data) => {
    // Broadcast a high-priority message to all active users in the society
    const users = await User.find({ societyId, isActive: true }).select('_id fcmTokens').lean();

    if (users.length > 0) {
        await sendNotification({
            users: users,
            societyId,
            type: 'EMERGENCY_BROADCAST',
            title: `⚠️ SECURITY UPDATE ⚠️`,
            message: data.message,
            priority: 'HIGH'
        });
    }

    return { success: true, notifiedCount: users.length };
};
