import * as vehicleRepo from './vehicle.repository.js';
import * as residentRepo from '../resident/resident.repository.js';
import Society from '../society/society.model.js';
import ApiError from '../../utils/ApiError.js';
import { v4 as uuidv4 } from 'uuid';
import { getIO } from '../../socket/socket.server.js';
import { ROOMS } from '../../socket/rooms.js';
import { sendNotification } from '../../services/notification.service.js';
import User from '../auth/user.model.js';

// --- RESIDENT SERVICES ---

export const registerVehicle = async (userId, data) => {
    const resident = await residentRepo.findByUserId(userId);
    if (!resident) throw ApiError.notFound('Resident profile not found.');

    const society = await Society.findById(resident.societyId);
    
    // Check limits
    const existingVehicles = await vehicleRepo.getVehiclesByResident(resident._id);
    const maxLimit = society.settings?.maxVehiclesPerUnit || 2;
    if (existingVehicles.length >= maxLimit) {
        throw ApiError.badRequest(`Maximum limit of ${maxLimit} vehicles reached for your unit.`);
    }

    // Determine initial status based on auto-approval setting
    const isAutoApproval = society.settings?.vehicleAutoApproval || false;
    const status = isAutoApproval ? 'ACTIVE' : 'PENDING_APPROVAL';

    // Generate unique QR token
    const qrToken = `VEH-${Date.now()}-${uuidv4().substring(0,8)}`;

    const vehicleData = {
        ...data,
        societyId: resident.societyId,
        residentId: resident._id,
        unitId: resident.unitId,
        qrToken,
        status,
        isPrimary: existingVehicles.length === 0, // First vehicle is primary
    };

    const vehicle = await vehicleRepo.createVehicle(vehicleData);

    // Notify Resident
    const resUser = await User.findById(userId).select('_id fcmTokens').lean();
    if (resUser) {
        sendNotification({
            users: [resUser],
            societyId: resident.societyId,
            title: isAutoApproval ? 'Vehicle Registered & Active' : 'Vehicle Registration Pending',
            message: `Your vehicle ${vehicle.vehicleNumber} has been registered successfully.`,
            type: 'VEHICLE_REGISTERED',
            referenceType: 'VEHICLE',
            referenceId: vehicle._id
        }).catch(e => console.error(e));
    }

    return vehicle;
};

export const getMyVehicles = async (userId) => {
    const resident = await residentRepo.findByUserId(userId);
    if (!resident) throw ApiError.notFound('Resident profile not found.');
    return vehicleRepo.getVehiclesByResident(resident._id);
};

export const updateMyVehicle = async (userId, vehicleId, data) => {
    const resident = await residentRepo.findByUserId(userId);
    const vehicle = await vehicleRepo.getVehicleById(vehicleId);
    
    if (!vehicle || vehicle.residentId._id.toString() !== resident._id.toString()) {
        throw ApiError.notFound('Vehicle not found or unauthorized');
    }

    // If vehicle number is changed and auto-approval is false, set back to PENDING_APPROVAL
    if (data.vehicleNumber && data.vehicleNumber !== vehicle.vehicleNumber) {
        const society = await Society.findById(resident.societyId);
        if (!society.settings?.vehicleAutoApproval) {
            data.status = 'PENDING_APPROVAL';
        }
    }

    return vehicleRepo.updateVehicle(vehicleId, data);
};

export const regenerateQr = async (userId, vehicleId) => {
    const resident = await residentRepo.findByUserId(userId);
    const vehicle = await vehicleRepo.getVehicleById(vehicleId);
    
    if (!vehicle || vehicle.residentId._id.toString() !== resident._id.toString()) {
        throw ApiError.notFound('Vehicle not found or unauthorized');
    }

    const qrToken = `VEH-${Date.now()}-${uuidv4().substring(0,8)}`;
    return vehicleRepo.updateVehicle(vehicleId, { qrToken });
};

export const deleteMyVehicle = async (userId, vehicleId) => {
    const resident = await residentRepo.findByUserId(userId);
    const vehicle = await vehicleRepo.getVehicleById(vehicleId);
    
    if (!vehicle || vehicle.residentId._id.toString() !== resident._id.toString()) {
        throw ApiError.notFound('Vehicle not found or unauthorized');
    }

    // Prevent deletion if inside
    const activeLog = await vehicleRepo.getLatestActiveLog(vehicleId);
    if (activeLog) {
        throw ApiError.badRequest('Cannot delete vehicle while it is currently inside the society.');
    }

    // Free up parking slot if assigned
    if (vehicle.parkingSlotId) {
        await vehicleRepo.updateParkingSlot(vehicle.parkingSlotId, {
            status: 'AVAILABLE',
            assignedVehicleId: null,
            assignedResidentId: null
        });
    }

    return vehicleRepo.deleteVehicle(vehicleId);
};

// --- ADMIN SERVICES ---

export const getAllVehicles = async (societyId) => {
    return vehicleRepo.getAllVehiclesBySociety(societyId);
};

export const approveVehicle = async (societyId, vehicleId) => {
    const vehicle = await vehicleRepo.getVehicleById(vehicleId);
    if (!vehicle || vehicle.societyId.toString() !== societyId.toString()) throw ApiError.notFound('Vehicle not found');
    
    const updated = await vehicleRepo.updateVehicle(vehicleId, { status: 'ACTIVE', rejectionReason: null, blockReason: null });
    
    // Notify
    if (vehicle.residentId) {
        const resUser = await User.findById(vehicle.residentId.userId).select('_id fcmTokens').lean();
        if (resUser) {
            sendNotification({
                users: [resUser],
                societyId,
                title: 'Vehicle Approved',
                message: `Your vehicle ${vehicle.vehicleNumber} is now ACTIVE.`,
                type: 'VEHICLE_APPROVED'
            }).catch(e => console.error(e));
        }
    }
    return updated;
};

export const rejectVehicle = async (societyId, vehicleId, reason) => {
    const vehicle = await vehicleRepo.getVehicleById(vehicleId);
    if (!vehicle || vehicle.societyId.toString() !== societyId.toString()) throw ApiError.notFound('Vehicle not found');
    return vehicleRepo.updateVehicle(vehicleId, { status: 'REJECTED', rejectionReason: reason });
};

export const blockVehicle = async (societyId, vehicleId, reason) => {
    const vehicle = await vehicleRepo.getVehicleById(vehicleId);
    if (!vehicle || vehicle.societyId.toString() !== societyId.toString()) throw ApiError.notFound('Vehicle not found');
    return vehicleRepo.updateVehicle(vehicleId, { status: 'BLOCKED', blockReason: reason });
};

// --- GUARD SERVICES (QR SCANNING) ---

export const scanVehicleEntry = async (guardId, societyId, qrToken, gateId) => {
    const vehicle = await vehicleRepo.getVehicleByToken(qrToken);
    
    if (!vehicle || vehicle.societyId.toString() !== societyId.toString()) {
        throw ApiError.notFound('Invalid Vehicle QR Code');
    }

    if (vehicle.status === 'BLOCKED') {
        throw ApiError.badRequest(`Vehicle is BLOCKED. Reason: ${vehicle.blockReason || 'Contact Admin'}`);
    }

    if (vehicle.status !== 'ACTIVE') {
        throw ApiError.badRequest(`Vehicle is not active. Current status: ${vehicle.status}`);
    }

    // Check for duplicate entry
    const activeLog = await vehicleRepo.getLatestActiveLog(vehicle._id);
    if (activeLog) {
        throw ApiError.badRequest('Vehicle is already inside the society.');
    }

    const logData = {
        societyId,
        vehicleId: vehicle._id,
        vehicleNumber: vehicle.vehicleNumber,
        entryType: 'REGISTERED_RESIDENT',
        entryTime: new Date(),
        status: 'ENTRY',
        gateId,
        guardId
    };

    const entryLog = await vehicleRepo.createVehicleLog(logData);

    // Broadcast Event
    getIO().to(ROOMS.SOCIETY_ADMIN(societyId)).emit('vehicle:entry', { vehicleNumber: vehicle.vehicleNumber, unit: vehicle.unitId?.unitNumber });

    // Notify Resident
    const resUser = await User.findById(vehicle.residentId.userId).select('_id fcmTokens').lean();
    if (resUser) {
        sendNotification({
            users: [resUser],
            societyId,
            title: 'Vehicle Entered',
            message: `Your vehicle ${vehicle.vehicleNumber} has entered the society.`,
            type: 'VEHICLE_ENTRY'
        }).catch(e => console.error(e));
    }

    return { vehicle, entryLog };
};

export const scanVehicleExit = async (guardId, societyId, qrToken, gateId) => {
    const vehicle = await vehicleRepo.getVehicleByToken(qrToken);
    
    if (!vehicle || vehicle.societyId.toString() !== societyId.toString()) {
        throw ApiError.notFound('Invalid Vehicle QR Code');
    }

    const activeLog = await vehicleRepo.getLatestActiveLog(vehicle._id);
    if (!activeLog) {
        throw ApiError.badRequest('No active entry found for this vehicle. It is not currently inside.');
    }

    const exitTime = new Date();
    const durationMinutes = Math.round((exitTime - activeLog.entryTime) / 60000);

    activeLog.exitTime = exitTime;
    activeLog.status = 'EXIT';
    activeLog.durationMinutes = durationMinutes;
    await activeLog.save();

    // Broadcast Event
    getIO().to(ROOMS.SOCIETY_ADMIN(societyId)).emit('vehicle:exit', { vehicleNumber: vehicle.vehicleNumber });

    // Notify Resident
    const resUser = await User.findById(vehicle.residentId.userId).select('_id fcmTokens').lean();
    if (resUser) {
        sendNotification({
            users: [resUser],
            societyId,
            title: 'Vehicle Exited',
            message: `Your vehicle ${vehicle.vehicleNumber} has exited the society.`,
            type: 'VEHICLE_EXIT'
        }).catch(e => console.error(e));
    }

    return { vehicle, exitLog: activeLog };
};

export const getVehicleLogs = async (societyId) => {
    return vehicleRepo.getVehicleLogsBySociety(societyId);
};
