/**
 * unit.repository.js — Data access layer for the Unit collection.
 */

import Unit from '../models/Unit.js';

/**
 * Find a unit by its MongoDB ObjectId.
 */
export const findById = (id) => Unit.findById(id).lean();

/**
 * Find all units in a society with optional filters and population.
 * @param {object} filter - e.g. { societyId, towerId, floorId, isOccupied }
 * @param {object} [opts]  - { skip, limit, sort }
 */
export const findBySociety = (filter = {}, opts = {}) => {
    const { skip = 0, limit = 50, sort = { unitNumber: 1 } } = opts;
    return Unit.find(filter)
        .populate('towerId', 'name code')
        .populate('floorId', 'floorNumber floorName')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean();
};

/**
 * Count units matching a filter.
 */
export const countDocuments = (filter = {}) => Unit.countDocuments(filter);

/**
 * Find all units in a specific tower.
 */
export const findByTower = (towerId) =>
    Unit.find({ towerId }).sort({ unitNumber: 1 }).lean();

/**
 * Find all units on a specific floor.
 */
export const findByFloor = (floorId) =>
    Unit.find({ floorId }).sort({ unitNumber: 1 }).lean();

/**
 * Check if a unit number already exists in a tower.
 */
export const existsByUnitNumber = (towerId, unitNumber) =>
    Unit.exists({ towerId, unitNumber });

/**
 * Create a new unit.
 */
export const createUnit = (data) => Unit.create(data);

/**
 * Update a unit by ID.
 */
export const updateUnit = (id, updates) =>
    Unit.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).lean();

/**
 * Alias for countDocuments — consistent with staff service usage.
 */
export const countUnits = (filter = {}) => Unit.countDocuments(filter);

/**
 * Generic paginated find with optional population.
 * @param {{ filter, page, limit, sort, populate }} opts
 */
export const findMany = ({ filter = {}, page = 1, limit = 20, sort = {}, populate = [] }) => {
    let q = Unit.find(filter)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit);
    populate.forEach(({ path, select }) => { q = q.populate(path, select); });
    return q.lean();
};

/**
 * Delete a unit by ID.
 */
export const deleteUnit = (id) => Unit.findByIdAndDelete(id).lean();

/**
 * Delete all units belonging to a tower.
 */
export const deleteByTower = (towerId) => Unit.deleteMany({ towerId });

/**
 * Delete all units belonging to a floor.
 */
export const deleteByFloor = (floorId) => Unit.deleteMany({ floorId });

