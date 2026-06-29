import * as vehicleService from './vehicle.service.js';
import * as parkingService from './parking.service.js';
import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/ApiResponse.js';

// --- RESIDENT CONTROLLERS ---

export const registerVehicle = asyncHandler(async (req, res) => {
    const vehicle = await vehicleService.registerVehicle(req.user.sub, req.body);
    res.status(201).json(new ApiResponse(201, { vehicle }, 'Vehicle registered successfully'));
});

export const getMyVehicles = asyncHandler(async (req, res) => {
    const vehicles = await vehicleService.getMyVehicles(req.user.sub);
    res.status(200).json(new ApiResponse(200, { vehicles }, 'Vehicles retrieved successfully'));
});

export const updateMyVehicle = asyncHandler(async (req, res) => {
    const vehicle = await vehicleService.updateMyVehicle(req.user.sub, req.params.id, req.body);
    res.status(200).json(new ApiResponse(200, { vehicle }, 'Vehicle updated successfully'));
});

export const regenerateQr = asyncHandler(async (req, res) => {
    const vehicle = await vehicleService.regenerateQr(req.user.sub, req.params.id);
    res.status(200).json(new ApiResponse(200, { vehicle }, 'QR Code regenerated successfully'));
});

export const deleteMyVehicle = asyncHandler(async (req, res) => {
    await vehicleService.deleteMyVehicle(req.user.sub, req.params.id);
    res.status(200).json(new ApiResponse(200, null, 'Vehicle deleted successfully'));
});

// --- ADMIN CONTROLLERS ---

export const getAllVehicles = asyncHandler(async (req, res) => {
    const vehicles = await vehicleService.getAllVehicles(req.user.societyId);
    res.status(200).json(new ApiResponse(200, { vehicles }, 'All vehicles retrieved'));
});

export const approveVehicle = asyncHandler(async (req, res) => {
    const vehicle = await vehicleService.approveVehicle(req.user.societyId, req.params.id);
    res.status(200).json(new ApiResponse(200, { vehicle }, 'Vehicle approved'));
});

export const rejectVehicle = asyncHandler(async (req, res) => {
    const vehicle = await vehicleService.rejectVehicle(req.user.societyId, req.params.id, req.body.reason);
    res.status(200).json(new ApiResponse(200, { vehicle }, 'Vehicle rejected'));
});

export const blockVehicle = asyncHandler(async (req, res) => {
    const vehicle = await vehicleService.blockVehicle(req.user.societyId, req.params.id, req.body.reason);
    res.status(200).json(new ApiResponse(200, { vehicle }, 'Vehicle blocked'));
});

export const getVehicleLogs = asyncHandler(async (req, res) => {
    const logs = await vehicleService.getVehicleLogs(req.user.societyId);
    res.status(200).json(new ApiResponse(200, { logs }, 'Vehicle logs retrieved'));
});

// --- PARKING CONTROLLERS ---

export const createParkingSlot = asyncHandler(async (req, res) => {
    const slot = await parkingService.createParkingSlot(req.user.societyId, req.body);
    res.status(201).json(new ApiResponse(201, { slot }, 'Parking slot created'));
});

export const getParkingSlots = asyncHandler(async (req, res) => {
    const slots = await parkingService.getParkingSlots(req.user.societyId);
    res.status(200).json(new ApiResponse(200, { slots }, 'Parking slots retrieved'));
});

export const assignParkingToVehicle = asyncHandler(async (req, res) => {
    const slot = await parkingService.assignParkingToVehicle(req.user.societyId, req.params.id, req.body.vehicleId);
    res.status(200).json(new ApiResponse(200, { slot }, 'Parking slot assigned'));
});

export const unassignParkingSlot = asyncHandler(async (req, res) => {
    const slot = await parkingService.unassignParkingSlot(req.user.societyId, req.params.id);
    res.status(200).json(new ApiResponse(200, { slot }, 'Parking slot unassigned'));
});

// --- GUARD CONTROLLERS ---

export const scanVehicleEntry = asyncHandler(async (req, res) => {
    const result = await vehicleService.scanVehicleEntry(req.user.sub, req.user.societyId, req.body.qrToken, req.body.gateId);
    res.status(200).json(new ApiResponse(200, result, 'Vehicle entry recorded'));
});

export const scanVehicleExit = asyncHandler(async (req, res) => {
    const result = await vehicleService.scanVehicleExit(req.user.sub, req.user.societyId, req.body.qrToken, req.body.gateId);
    res.status(200).json(new ApiResponse(200, result, 'Vehicle exit recorded'));
});
