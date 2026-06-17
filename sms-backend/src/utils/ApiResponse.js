/**
 * ApiResponse — Standardized success response shape.
 *
 * Enforces the envelope format defined in the API spec:
 *   { success, data, message, pagination? }
 *
 * Usage:
 *   res.status(200).json(new ApiResponse(200, data, 'Fetched successfully'));
 *   res.status(200).json(new ApiResponse(200, data, 'OK', pagination));
 */
class ApiResponse {
  /**
   * @param {number} statusCode  - HTTP status code
   * @param {*}      data        - Response payload
   * @param {string} message     - Human-readable message
   * @param {object} [pagination]- Optional pagination meta
   */
  constructor(statusCode, data = null, message = 'Success', pagination = null) {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;

    if (pagination) {
      this.pagination = pagination;
    }
  }

  /**
   * Build a pagination meta object from Mongoose query params.
   *
   * @param {number} page   - Current page (1-indexed)
   * @param {number} limit  - Items per page
   * @param {number} total  - Total documents count
   * @returns {{ page, limit, total, totalPages }}
   */
  static buildPagination(page, limit, total) {
    return {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit),
    };
  }
}

export default ApiResponse;
