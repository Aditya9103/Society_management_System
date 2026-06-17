/**
 * tenant.repository.js — Data access layer for the Tenant collection.
 *
 * Services call repository methods — they never touch the model directly.
 */

import Tenant from '../models/Tenant.js';

/**
 * Find a tenant by MongoDB ObjectId.
 * @param {string} id
 * @returns {Promise<TenantDocument|null>}
 */
export const findById = (id) => Tenant.findById(id).lean();

/**
 * Find all tenants with optional search and pagination.
 * @param {object} filter
 * @param {object} opts - { skip, limit, sort }
 * @returns {Promise<TenantDocument[]>}
 */
export const findAll = (filter = {}, opts = {}) => {
    const { skip = 0, limit = 20, sort = { createdAt: -1 } } = opts;
    return Tenant.find(filter).sort(sort).skip(skip).limit(limit).lean();
};

/**
 * Count documents matching a filter.
 * @param {object} filter
 * @returns {Promise<number>}
 */
export const countDocuments = (filter = {}) => Tenant.countDocuments(filter);

/**
 * Create a new Tenant document.
 * @param {object} data
 * @returns {Promise<TenantDocument>}
 */
export const createTenant = (data) => Tenant.create(data);

/**
 * Update a tenant by ID.
 * @param {string} id
 * @param {object} updates
 * @returns {Promise<TenantDocument|null>}
 */
export const updateTenant = (id, updates) =>
    Tenant.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).lean();

/**
 * Find a tenant by slug.
 * @param {string} slug
 * @returns {Promise<TenantDocument|null>}
 */
export const findBySlug = (slug) => Tenant.findOne({ slug }).lean();

/**
 * Find a tenant by contact email.
 * @param {string} email
 * @returns {Promise<TenantDocument|null>}
 */
export const findByEmail = (email) =>
    Tenant.findOne({ contactEmail: email.toLowerCase().trim() }).lean();
