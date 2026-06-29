import Joi from 'joi';

export const createPollSchema = {
    body: Joi.object({
        title: Joi.string().required().trim().max(200),
        description: Joi.string().optional().allow(null, ''),
        pollType: Joi.string().valid(
            'GENERAL_SURVEY', 'COMMITTEE_ELECTION', 'BUDGET_APPROVAL',
            'RULE_CHANGE', 'FACILITY_DECISION', 'EVENT_PLANNING', 'OTHER'
        ).required(),
        customPollType: Joi.string().optional().allow(null, ''),
        votingMethod: Joi.string().valid('SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'RANKED_CHOICE').default('SINGLE_CHOICE'),
        options: Joi.array().items(
            Joi.object({
                optionId: Joi.string().required(),
                text: Joi.string().required(),
                photoUrl: Joi.string().optional().allow(null, ''),
                nomineeUserId: Joi.string().custom((value, helpers) => {
                    if (value && !value.match(/^[0-9a-fA-F]{24}$/)) return helpers.error('any.invalid');
                    return value;
                }).optional().allow(null),
                nomineeStatement: Joi.string().optional().allow(null, '')
            })
        ).min(2).required(),
        maxChoices: Joi.number().min(1).default(1),
        eligibleVoters: Joi.string().valid('ALL', 'OWNERS_ONLY', 'TENANTS_ONLY', 'COMMITTEE').default('ALL'),
        startDate: Joi.date().iso().required(),
        endDate: Joi.date().iso().greater(Joi.ref('startDate')).required(),
        nominationStartDate: Joi.date().iso().optional().allow(null),
        nominationEndDate: Joi.date().iso().optional().allow(null),
        resultVisibility: Joi.string().valid('REAL_TIME', 'AFTER_CLOSE', 'ADMIN_ONLY').default('AFTER_CLOSE'),
        isAnonymous: Joi.boolean().default(false),
        quorumPercentage: Joi.number().min(0).max(100).default(0)
    })
};

export const submitVoteSchema = {
    body: Joi.object({
        optionIds: Joi.array().items(Joi.string().required()).min(1).required()
    })
};
