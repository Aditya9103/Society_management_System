/**
 * society.repository.js — Data access layer for the Society collection.
 */

import Society from './society.model.js';

/**
 * Find a society by its MongoDB ObjectId.
 */
export const findById = (id) => Society.findById(id).lean();

/**
 * Find a society by ID with tenant population.
 */
export const findByIdPopulated = (id) =>
    Society.findById(id).populate('tenantId', 'name slug plan').lean();

/**
 * Find the society associated with a given tenant.
 */
export const findByTenantId = (tenantId) =>
    Society.findOne({ tenantId }).lean();

/**
 * Create a new society.
 */
export const createSociety = (data) => Society.create(data);

/**
 * Find all societies with optional filter and pagination.
 * @param {object} filter
 * @param {object} opts - { skip, limit, sort }
 */
export const findAll = (filter = {}, opts = {}) => {
    const { skip = 0, limit = 20, sort = { createdAt: -1 } } = opts;
    return Society.find(filter).sort(sort).skip(skip).limit(limit).lean();
};

/**
 * Count documents matching a filter.
 */
export const countDocuments = (filter = {}) => Society.countDocuments(filter);

/**
 * Update a society by ID.
 * @param {string} id
 * @param {object} updates
 */
export const updateSociety = (id, updates) =>
    Society.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).lean();

/**
 * Increment or decrement occupiedUnits counter.
 */
export const incrementOccupiedUnits = (id, delta = 1) =>
    Society.findByIdAndUpdate(id, { $inc: { occupiedUnits: delta } });

/**
 * Increment or decrement totalUnits counter.
 */
export const incrementTotalUnits = (id, delta = 1) =>
    Society.findByIdAndUpdate(id, { $inc: { totalUnits: delta } });
