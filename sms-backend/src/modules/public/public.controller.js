import * as publicService from './public.service.js';
import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';

export const getSocieties = asyncHandler(async (req, res) => {
    const societies = await publicService.getSocieties();
    res.status(200).json(
        new ApiResponse(200, societies, 'Societies fetched successfully')
    );
});

export const getVacantUnits = asyncHandler(async (req, res) => {
    const { societyId } = req.params;
    const units = await publicService.getVacantUnits(societyId);
    
    // Group units by tower and floor for easier frontend rendering
    const grouped = units.reduce((acc, unit) => {
        const towerName = unit.towerId?.name || 'Unknown Tower';
        const floorName = unit.floorId?.floorName || 'Unknown Floor';
        
        if (!acc[towerName]) acc[towerName] = {};
        if (!acc[towerName][floorName]) acc[towerName][floorName] = [];
        
        acc[towerName][floorName].push(unit);
        return acc;
    }, {});

    res.status(200).json(
        new ApiResponse(200, { units, grouped }, 'Vacant units fetched successfully')
    );
});
