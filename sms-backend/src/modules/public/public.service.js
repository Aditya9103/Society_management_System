import Society from '../society/society.model.js';
import Unit from '../../shared/models/Unit.js';
import ApiError from '../../utils/ApiError.js';

export const getSocieties = async () => {
    return Society.find({ isActive: true })
        .select('name address city state zipCode')
        .lean();
};

export const getVacantUnits = async (societyId) => {
    const society = await Society.findById(societyId);
    if (!society) {
        throw ApiError.notFound('Society not found');
    }

    // Only return units that are VACANT, meaning no owner or tenant has claimed them
    return Unit.find({ societyId, ownershipStatus: 'VACANT', isActive: true })
        .populate('towerId', 'name code')
        .populate('floorId', 'floorNumber floorName')
        .select('unitNumber unitType bhkType carpetAreaSqft towerId floorId')
        .lean();
};
