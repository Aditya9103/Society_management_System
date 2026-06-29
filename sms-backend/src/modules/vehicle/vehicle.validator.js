import Joi from 'joi';

// (Leaving minimal or empty if simple validation is enough. The prompt allows basic implementations).
export const registerVehicleSchema = {
    body: Joi.object({
        vehicleNumber: Joi.string().required(),
        vehicleType: Joi.string().valid('BICYCLE', 'TWO_WHEELER', 'THREE_WHEELER', 'FOUR_WHEELER', 'HEAVY_VEHICLE', 'ELECTRIC_VEHICLE', 'OTHER').required(),
        customVehicleType: Joi.string().optional().allow(null, ''),
        vehicleCategory: Joi.string().valid('RESIDENT', 'STAFF', 'COMMERCIAL', 'VISITOR').required(),
        make: Joi.string().optional().allow('', null),
        model: Joi.string().optional().allow('', null),
        color: Joi.string().optional().allow('', null),
        yearOfManufacture: Joi.number().optional().allow(null),
        registrationState: Joi.string().optional().allow('', null),
        rcPhotoUrl: Joi.string().optional().allow('', null),
        vehiclePhotoUrl: Joi.string().optional().allow('', null),
        isPrimary: Joi.boolean().optional()
    })
};
