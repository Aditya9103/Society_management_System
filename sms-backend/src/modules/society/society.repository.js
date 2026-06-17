import Society from './society.model.js';

export const findById = (id) => {
    return Society.findById(id).lean();
};

export const createSociety = (data) => {
    return Society.create(data);
};

/**
 * Find all societies with optional filter and pagination.
 * @param {object} filter
 * @param {object} opts - { skip, limit, sort }
 * @returns {Promise<SocietyDocument[]>}
 */
export const findAll = (filter = {}, opts = {}) => {
    const { skip = 0, limit = 20, sort = { createdAt: -1 } } = opts;
    return Society.find(filter).sort(sort).skip(skip).limit(limit).lean();
};

/**
 * Count documents matching a filter.
 * @param {object} filter
 * @returns {Promise<number>}
 */
export const countDocuments = (filter = {}) => Society.countDocuments(filter);

/**
 * Update a society by ID.
 * @param {string} id
 * @param {object} updates
 * @returns {Promise<SocietyDocument|null>}
 */
export const updateSociety = (id, updates) =>
    Society.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).lean();
