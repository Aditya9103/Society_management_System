import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/ApiResponse.js';
import * as violationService from './violation.service.js';
import Resident from '../resident/resident.model.js';

export const createViolation = asyncHandler(async (req, res) => {
    const violation = await violationService.createViolation(
        req.user.societyId,
        req.body,
        req.user.sub
    );
    res.status(201).json(new ApiResponse(201, { violation }, 'Violation logged successfully'));
});

export const getViolations = asyncHandler(async (req, res) => {
    const violations = await violationService.getViolations(req.user.societyId, req.query);
    res.status(200).json(new ApiResponse(200, { violations }, 'Violations retrieved successfully'));
});

export const getMyViolations = asyncHandler(async (req, res) => {
    // req.user.sub is the userId, but the service needs residentId.
    // In SMS, a Resident is retrieved by finding Resident where userId = req.user.sub
    // Let's get the Resident first.
    const resident = await Resident.findOne({ userId: req.user.sub, societyId: req.user.societyId });
    if (!resident) {
        return res.status(404).json(new ApiResponse(404, null, 'Resident profile not found'));
    }
    
    const violations = await violationService.getMyViolations(req.user.societyId, resident._id);
    res.status(200).json(new ApiResponse(200, { violations }, 'My violations retrieved successfully'));
});

export const updateViolationStatus = asyncHandler(async (req, res) => {
    const violation = await violationService.updateViolationStatus(
        req.user.societyId,
        req.params.id,
        req.body.status
    );
    res.status(200).json(new ApiResponse(200, { violation }, 'Violation status updated successfully'));
});

export const getViolationStats = asyncHandler(async (req, res) => {
    const stats = await violationService.getViolationStats(req.user.societyId);
    res.status(200).json(new ApiResponse(200, { stats }, 'Violation stats retrieved successfully'));
});
