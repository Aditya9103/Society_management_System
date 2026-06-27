import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/ApiResponse.js';
import * as emergencyService from './emergency.service.js';

export const triggerSOS = asyncHandler(async (req, res) => {
    const userId = req.user.sub;
    const societyId = req.user.societyId;
    
    const emergency = await emergencyService.triggerSOS(userId, societyId, req.body);
    res.status(201).json(new ApiResponse(201, { emergency }, 'SOS Triggered Successfully'));
});

export const getActiveEmergencies = asyncHandler(async (req, res) => {
    const societyId = req.user.societyId;
    const emergencies = await emergencyService.getActiveEmergencies(societyId);
    res.status(200).json(new ApiResponse(200, { emergencies }, 'Active emergencies fetched'));
});

export const updateEmergencyStatus = asyncHandler(async (req, res) => {
    const userId = req.user.sub;
    const societyId = req.user.societyId;
    const { id } = req.params;
    
    const emergency = await emergencyService.updateEmergencyStatus(id, societyId, userId, req.body);
    res.status(200).json(new ApiResponse(200, { emergency }, 'Emergency status updated'));
});

export const broadcastUpdate = asyncHandler(async (req, res) => {
    const adminId = req.user.sub;
    const societyId = req.user.societyId;
    
    const result = await emergencyService.broadcastUpdate(societyId, adminId, req.body);
    res.status(200).json(new ApiResponse(200, result, 'Broadcast sent to residents'));
});
