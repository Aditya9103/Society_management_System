/**
 * floor.repository.js — Data access layer for the Floor collection.
 */

import Floor from '../models/Floor.js';

/**
 * Find a floor by its MongoDB ObjectId.
 */
export const findById = (id) => Floor.findById(id).lean();

/**
 * Find all floors belonging to a tower, sorted by floor number.
 */
export const findByTower = (towerId) =>
    Floor.find({ towerId }).sort({ floorNumber: 1 }).lean();

/**
 * Find all floors in a society.
 */
export const findBySociety = (societyId) =>
    Floor.find({ societyId }).sort({ floorNumber: 1 }).lean();

/**
 * Create a new floor.
 */
export const createFloor = (data) => Floor.create(data);

/**
 * Bulk insert multiple floors (e.g. auto-generate all floors for a tower).
 */
export const createManyFloors = (floors) => Floor.insertMany(floors);

/**
 * Check if a floor number already exists in a tower.
 */
export const existsByFloorNumber = (towerId, floorNumber) =>
    Floor.exists({ towerId, floorNumber });

/**
 * Update a floor by ID.
 */
export const updateFloor = (id, updates) =>
    Floor.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).lean();

/**
 * Increment the totalUnits counter on a floor.
 */
export const incrementUnitCount = (floorId, delta = 1) =>
    Floor.findByIdAndUpdate(floorId, { $inc: { totalUnits: delta } });

/**
 * Delete all floors belonging to a tower (used when tower is deleted).
 */
export const deleteByTower = (towerId) => Floor.deleteMany({ towerId });

/**
 * Delete a floor by ID.
 */
export const deleteFloor = (id) => Floor.findByIdAndDelete(id).lean();
