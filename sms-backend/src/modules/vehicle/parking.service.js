import * as vehicleRepo from './vehicle.repository.js';
import ApiError from '../../utils/ApiError.js';
import { sendNotification } from '../../services/notification.service.js';
import User from '../auth/user.model.js';

export const createParkingSlot = async (societyId, data) => {
    if (Array.isArray(data)) {
        const slots = data.map(d => ({ ...d, societyId }));
        return vehicleRepo.createParkingSlots(slots);
    }
    return vehicleRepo.createParkingSlot({ ...data, societyId });
};

export const getParkingSlots = async (societyId) => {
    return vehicleRepo.getParkingSlotsBySociety(societyId);
};

export const assignParkingToVehicle = async (societyId, slotId, vehicleId) => {
    const slot = await vehicleRepo.getParkingSlotById(slotId);
    if (!slot || slot.societyId.toString() !== societyId.toString()) throw ApiError.notFound('Parking slot not found');

    const vehicle = await vehicleRepo.getVehicleById(vehicleId);
    if (!vehicle || vehicle.societyId.toString() !== societyId.toString()) throw ApiError.notFound('Vehicle not found');

    if (slot.status !== 'AVAILABLE') {
        throw ApiError.badRequest('Parking slot is not available');
    }

    // Unassign previous parking slot if vehicle had one
    if (vehicle.parkingSlotId) {
        await vehicleRepo.updateParkingSlot(vehicle.parkingSlotId, { status: 'AVAILABLE', assignedVehicleId: null, assignedResidentId: null });
    }

    // Assign new slot
    const updatedSlot = await vehicleRepo.updateParkingSlot(slotId, {
        status: 'OCCUPIED',
        assignedVehicleId: vehicle._id,
        assignedResidentId: vehicle.residentId
    });

    await vehicleRepo.updateVehicle(vehicleId, { parkingSlotId: slotId });

    // Notify
    if (vehicle.residentId && vehicle.residentId.userId) {
        const resUser = await User.findById(vehicle.residentId.userId).select('_id fcmTokens').lean();
        if (resUser) {
            sendNotification({
                users: [resUser],
                societyId,
                title: 'Parking Slot Assigned',
                message: `Your vehicle ${vehicle.vehicleNumber} has been assigned parking slot ${updatedSlot.slotNumber}.`,
                type: 'VEHICLE_PARKING_ASSIGNED'
            }).catch(e => console.error(e));
        }
    }

    return updatedSlot;
};

export const unassignParkingSlot = async (societyId, slotId) => {
    const slot = await vehicleRepo.getParkingSlotById(slotId);
    if (!slot || slot.societyId.toString() !== societyId.toString()) throw ApiError.notFound('Parking slot not found');

    if (slot.assignedVehicleId) {
        await vehicleRepo.updateVehicle(slot.assignedVehicleId, { parkingSlotId: null });
    }

    return vehicleRepo.updateParkingSlot(slotId, {
        status: 'AVAILABLE',
        assignedVehicleId: null,
        assignedResidentId: null
    });
};
