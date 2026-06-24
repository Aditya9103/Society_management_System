import * as dsService from './domesticStaff.service.js';
import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';

export const addDomesticStaff = asyncHandler(async (req, res) => {
    const userId = req.user.sub;
    const societyId = req.user.societyId;
    
    const data = { ...req.body };
    if (req.file && req.file.cloudinaryUrl) {
        data.photoUrl = req.file.cloudinaryUrl;
    }

    const staff = await dsService.addDomesticStaff(userId, societyId, data);
    res.status(201).json(new ApiResponse(201, staff, 'Domestic staff added successfully'));
});

export const getMyDomesticStaff = asyncHandler(async (req, res) => {
    const userId = req.user.sub;
    const staffList = await dsService.getMyDomesticStaff(userId);
    res.status(200).json(new ApiResponse(200, staffList, 'Domestic staff retrieved successfully'));
});

export const updateDomesticStaff = asyncHandler(async (req, res) => {
    const userId = req.user.sub;
    
    const data = { ...req.body };
    if (req.file && req.file.cloudinaryUrl) {
        data.photoUrl = req.file.cloudinaryUrl;
    }

    const staff = await dsService.updateDomesticStaff(req.params.id, userId, data);
    res.status(200).json(new ApiResponse(200, staff, 'Domestic staff updated successfully'));
});

export const removeDomesticStaff = asyncHandler(async (req, res) => {
    const userId = req.user.sub;
    await dsService.removeDomesticStaff(req.params.id, userId);
    res.status(200).json(new ApiResponse(200, null, 'Domestic staff removed successfully'));
});
