/**
 * tower.repository.js — Data access layer for the Tower collection.
 */

import Tower from '../models/Tower.js';

/**
 * Find a tower by its MongoDB ObjectId.
 */
export const findById = (id) => Tower.findById(id).lean();

/**
 * Find all towers belonging to a society.
 * @param {string} societyId
 * @returns {Promise<TowerDocument[]>}
 */
export const findBySociety = (societyId) =>
    Tower.find({ societyId, isActive: true }).sort({ name: 1 }).lean();

/**
 * Create a new tower.
 */
export const createTower = (data) => Tower.create(data);

/**
 * Update a tower by ID.
 */
export const updateTower = (id, updates) =>
    Tower.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).lean();

/**
 * Soft-delete a tower (set isActive = false).
 */
export const deactivateTower = (id) =>
    Tower.findByIdAndUpdate(id, { isActive: false }, { new: true }).lean();

/**
 * Check if a tower code already exists in a society.
 */
export const existsByCode = (societyId, code, excludeId = null) => {
    const filter = { societyId, code: code.toUpperCase() };
    if (excludeId) filter._id = { $ne: excludeId };
    return Tower.exists(filter);
};

/**
 * Increment the totalUnits counter on a tower.
 */
export const incrementUnitCount = (towerId, delta = 1) =>
    Tower.findByIdAndUpdate(towerId, { $inc: { totalUnits: delta } });

/**
 * Delete a tower by ID.
 */
export const deleteTower = (id) => Tower.findByIdAndDelete(id).lean();
