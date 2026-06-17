import Joi from 'joi';
import { ROLES } from '../../config/constants.js';

export const createStaffSchema = {
    body: Joi.object({
        firstName: Joi.string().trim().max(50).required(),
        lastName: Joi.string().trim().max(50).required(),
        email: Joi.string().email().lowercase().trim().required(),
        phone: Joi.string().trim().required(),
        role: Joi.string()
            .valid(
                ROLES.COMMITTEE_MEMBER,
                ROLES.ACCOUNTANT,
                ROLES.FACILITY_MANAGER,
                ROLES.SECURITY_GUARD
            )
            .required(),
    }),
};

export const approveResidentSchema = {
    params: Joi.object({
        id: Joi.string()
            .regex(/^[0-9a-fA-F]{24}$/)
            .required()
            .messages({
                'string.pattern.base': 'id must be a valid MongoDB ObjectId',
            }),
    }),
    body: Joi.object({
        adminComments: Joi.string().trim().optional().allow(null, ''),
    }),
};
