import Vehicle from './vehicle.model.js';
import VehicleLog from './vehicleLog.model.js';
import ParkingSlot from './parkingSlot.model.js';

// --- VEHICLE CRUD ---

export const createVehicle = async (data) => {
    return Vehicle.create(data);
};

export const getVehicleById = async (id) => {
    return Vehicle.findById(id).populate('residentId', 'firstName lastName phone userId').populate('unitId', 'unitNumber');
};

export const getVehicleByToken = async (qrToken) => {
    return Vehicle.findOne({ qrToken }).populate('residentId', 'firstName lastName phone userId').populate('unitId', 'unitNumber').populate('parkingSlotId', 'slotNumber floor type');
};

export const getVehiclesByResident = async (residentId) => {
    return Vehicle.find({ residentId }).populate('parkingSlotId', 'slotNumber');
};

export const getAllVehiclesBySociety = async (societyId, query = {}) => {
    return Vehicle.find({ societyId, ...query })
        .populate('residentId', 'firstName lastName phone userId')
        .populate('unitId', 'unitNumber')
        .populate('parkingSlotId', 'slotNumber');
};

export const updateVehicle = async (id, data) => {
    return Vehicle.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

export const deleteVehicle = async (id) => {
    return Vehicle.findByIdAndDelete(id);
};

// --- PARKING CRUD ---

export const createParkingSlot = async (data) => {
    return ParkingSlot.create(data);
};

export const createParkingSlots = async (dataArray) => {
    return ParkingSlot.insertMany(dataArray);
};

export const getParkingSlotsBySociety = async (societyId) => {
    return ParkingSlot.find({ societyId }).populate('assignedVehicleId', 'vehicleNumber').populate('assignedResidentId', 'firstName lastName');
};

export const updateParkingSlot = async (id, data) => {
    return ParkingSlot.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

export const getParkingSlotById = async (id) => {
    return ParkingSlot.findById(id);
};

// --- VEHICLE LOGS ---

export const createVehicleLog = async (data) => {
    return VehicleLog.create(data);
};

export const getLatestActiveLog = async (vehicleId) => {
    return VehicleLog.findOne({ vehicleId, status: 'ENTRY' }).sort({ entryTime: -1 });
};

export const updateVehicleLog = async (id, data) => {
    return VehicleLog.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

export const getVehicleLogsBySociety = async (societyId, filter = {}) => {
    return VehicleLog.find({ societyId, ...filter })
        .populate('vehicleId', 'vehicleNumber vehicleType')
        .populate('gateId', 'name')
        .populate('guardId', 'name')
        .sort({ createdAt: -1 });
};
