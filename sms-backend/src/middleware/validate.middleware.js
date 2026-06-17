import ApiError from '../utils/ApiError.js';

/**
 * validate — Schema-based request validation middleware factory.
 *
 * Validates req.body, req.params, and req.query against provided Joi schemas.
 * On failure it throws an ApiError(422) with field-level details so the client
 * knows exactly which fields failed.
 *
 * Usage (in a route file):
 *   import validate from '../middleware/validate.middleware.js';
 *   import { createResidentSchema } from './resident.validator.js';
 *
 *   router.post('/', validate(createResidentSchema), asyncHandler(controller));
 *
 * The schema object may contain any combination of:
 *   { body, params, query }
 *
 * @param {{ body?, params?, query? }} schemas - Joi schema(s)
 * @returns Express middleware
 */
const validate = (schemas) => (req, res, next) => {
  const errors = [];

  const targets = {
    body: req.body,
    params: req.params,
    query: req.query,
  };

  for (const [key, schema] of Object.entries(schemas)) {
    if (!schema || !targets[key]) continue;

    const { error, value } = schema.validate(targets[key], {
      abortEarly: false, // collect ALL errors, not just the first
      allowUnknown: false, // reject unknown keys
      stripUnknown: true, // silently remove keys not in schema (security)
    });

    if (error) {
      error.details.forEach((d) => {
        errors.push({
          field: d.path.join('.'),
          message: d.message.replace(/['"]/g, ''), // strip Joi quotes
        });
      });
    } else {
      // Replace source with stripped/coerced value from Joi
      req[key] = value;
    }
  }

  if (errors.length > 0) {
    return next(ApiError.validationError(errors));
  }

  return next();
};

export default validate;
