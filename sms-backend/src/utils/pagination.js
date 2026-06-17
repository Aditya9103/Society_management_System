/**
 * pagination.js — Mongoose pagination helpers.
 *
 * Provides consistent page/limit parsing and a ready-to-use
 * `paginate()` helper for Mongoose queries.
 *
 * Usage:
 *   const { page, limit, skip } = parsePagination(req.query);
 *   const results = await Model.find(filter).skip(skip).limit(limit);
 *   const pagination = buildPaginationMeta(page, limit, total);
 */

/** Hard limits to prevent abuse */
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * Parse and sanitize page/limit from query params.
 *
 * @param {object} query - req.query (or any object with page/limit)
 * @returns {{ page: number, limit: number, skip: number }}
 */
export const parsePagination = (query = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || DEFAULT_PAGE);
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, parseInt(query.limit, 10) || DEFAULT_LIMIT),
  );
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

/**
 * Build the pagination meta object for ApiResponse.
 *
 * @param {number} page
 * @param {number} limit
 * @param {number} total - Total document count from Model.countDocuments()
 * @returns {{ page, limit, total, totalPages }}
 */
export const buildPaginationMeta = (page, limit, total) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
});

/**
 * High-level helper: paginate a Mongoose query.
 *
 * @param {mongoose.Model} Model   - Mongoose model
 * @param {object}         filter  - Query filter
 * @param {object}         query   - req.query (for page/limit)
 * @param {object}         [opts]  - { select, sort, populate }
 * @returns {Promise<{ data, pagination }>}
 *
 * Example:
 *   const result = await paginate(Complaint, { societyId }, req.query, {
 *     sort: { createdAt: -1 },
 *     populate: 'raisedBy',
 *   });
 */
export const paginate = async (Model, filter, query = {}, opts = {}) => {
  const { page, limit, skip } = parsePagination(query);
  const { select, sort = { createdAt: -1 }, populate } = opts;

  const [data, total] = await Promise.all([
    Model.find(filter)
      .select(select)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate(populate ?? []),
    Model.countDocuments(filter),
  ]);

  return { data, pagination: buildPaginationMeta(page, limit, total) };
};
