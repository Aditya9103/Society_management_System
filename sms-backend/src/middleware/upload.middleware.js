/**
 * upload.middleware.js — File upload middleware using Multer + Cloudinary.
 *
 * Files are first buffered in memory by Multer, then streamed to Cloudinary.
 * We never write files to disk — no temporary files on the server.
 *
 * Exported factories:
 *   uploadSingle(fieldName, folder)      — Upload a single file
 *   uploadMultiple(fieldName, max, folder) — Upload up to `max` files
 *   uploadFields(fields, folder)          — Upload multiple named fields
 *
 * After middleware runs:
 *   req.file          — For uploadSingle: { url, public_id, ... }
 *   req.files         — For uploadMultiple/uploadFields: array or map of file objects
 *
 * Usage:
 *   router.post('/photo', authenticate, uploadSingle('photo', 'profiles'), controller);
 *
 * The Cloudinary URL is available at req.file.cloudinaryUrl after upload.
 */

import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import env from '../config/env.js';
import ApiError from '../utils/ApiError.js';

// ── Configure Cloudinary ──────────────────────────────────────────────────────
cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
    secure: true,
});

// ── Allowed MIME types ────────────────────────────────────────────────────────
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_DOC_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const ALL_ALLOWED = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOC_TYPES];

/** Max file size: 10 MB */
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// ── Multer: memory storage (no disk writes) ───────────────────────────────────
const storage = multer.memoryStorage();

/**
 * File filter factory — validates MIME type before accepting the file.
 *
 * @param {'image'|'document'|'any'} allowType
 * @returns {multer.Options['fileFilter']}
 */
const fileFilter = (allowType = 'any') => (req, file, cb) => {
    const allowedTypes =
        allowType === 'image'
            ? ALLOWED_IMAGE_TYPES
            : allowType === 'document'
            ? ALLOWED_DOC_TYPES
            : ALL_ALLOWED;

    if (!allowedTypes.includes(file.mimetype)) {
        return cb(
            ApiError.badRequest(
                `Invalid file type: ${file.mimetype}. Allowed: ${allowedTypes.join(', ')}`,
            ),
            false,
        );
    }
    return cb(null, true);
};

// ── Cloudinary upload helper ──────────────────────────────────────────────────

/**
 * Upload a buffer to Cloudinary via a readable stream.
 *
 * @param {Buffer} buffer      - File buffer from Multer
 * @param {string} folder      - Cloudinary folder path (e.g. 'sms/profiles')
 * @param {string} [publicId]  - Optional custom public_id
 * @returns {Promise<object>}  Cloudinary upload result
 */
export const uploadToCloudinary = (buffer, folder, publicId) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: `sms/${folder}`,
                public_id: publicId,
                resource_type: 'auto', // handles both images and documents
                transformation: [
                    // Auto-quality and format for images
                    { fetch_format: 'auto', quality: 'auto' },
                ],
            },
            (error, result) => {
                if (error) return reject(ApiError.internal('File upload to Cloudinary failed'));
                return resolve(result);
            },
        );

        // Convert buffer to readable stream and pipe to Cloudinary
        const readable = new Readable({
            read() {
                this.push(buffer);
                this.push(null);
            },
        });
        readable.pipe(uploadStream);
    });
};

/**
 * Express middleware that uploads req.file to Cloudinary after Multer processes it.
 * Attaches result to req.file.cloudinaryResult.
 *
 * @param {string} folder - Cloudinary folder name
 */
const cloudinaryUploadMiddleware = (folder) => async (req, res, next) => {
    try {
        // uploadSingle case
        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer, folder);
            req.file.cloudinaryResult = result;
            req.file.cloudinaryUrl = result.secure_url;
            req.file.cloudinaryPublicId = result.public_id;
            // Generic decoupled keys for new modules
            req.file.fileUrl = result.secure_url;
            req.file.storageKey = result.public_id;
        }

        // uploadMultiple case
        if (req.files && Array.isArray(req.files)) {
            await Promise.all(
                req.files.map(async (file) => {
                    const result = await uploadToCloudinary(file.buffer, folder);
                    file.cloudinaryResult = result;
                    file.cloudinaryUrl = result.secure_url;
                    file.cloudinaryPublicId = result.public_id;
                    // Generic decoupled keys for new modules
                    file.fileUrl = result.secure_url;
                    file.storageKey = result.public_id;
                }),
            );
        }

        return next();
    } catch (err) {
        return next(err);
    }
};

// ── Exported Factories ────────────────────────────────────────────────────────

/**
 * uploadSingle — Upload a single file from one form field.
 *
 * @param {string} fieldName  - HTML form field name (e.g. 'photo')
 * @param {string} [folder]   - Cloudinary folder (e.g. 'profiles')
 * @param {'image'|'document'|'any'} [allowType] - Restrict file types
 * @returns {import('express').RequestHandler[]} Middleware chain
 *
 * @example
 *   router.post('/avatar', authenticate, ...uploadSingle('photo', 'avatars', 'image'), ctrl);
 */
export const uploadSingle = (fieldName, folder = 'general', allowType = 'any') => [
    multer({
        storage,
        limits: { fileSize: MAX_FILE_SIZE },
        fileFilter: fileFilter(allowType),
    }).single(fieldName),
    cloudinaryUploadMiddleware(folder),
];

/**
 * uploadMultiple — Upload multiple files from the same form field.
 *
 * @param {string} fieldName  - HTML form field name (e.g. 'images')
 * @param {number} [max=5]    - Maximum number of files
 * @param {string} [folder]
 * @param {'image'|'document'|'any'} [allowType]
 * @returns {import('express').RequestHandler[]}
 *
 * @example
 *   router.post('/complaint', authenticate, ...uploadMultiple('images', 5, 'complaints', 'image'), ctrl);
 */
export const uploadMultiple = (fieldName, max = 5, folder = 'general', allowType = 'any') => [
    multer({
        storage,
        limits: { fileSize: MAX_FILE_SIZE, files: max },
        fileFilter: fileFilter(allowType),
    }).array(fieldName, max),
    cloudinaryUploadMiddleware(folder),
];

/**
 * uploadFields — Upload files from multiple named form fields.
 *
 * @param {Array<{ name: string, maxCount: number }>} fields
 * @param {string} [folder]
 * @returns {import('express').RequestHandler[]}
 *
 * @example
 *   router.post('/doc', authenticate, ...uploadFields([
 *     { name: 'front', maxCount: 1 },
 *     { name: 'back', maxCount: 1 },
 *   ], 'documents'), ctrl);
 */
export const uploadFields = (fields, folder = 'general') => [
    multer({
        storage,
        limits: { fileSize: MAX_FILE_SIZE },
        fileFilter: fileFilter('any'),
    }).fields(fields),
    cloudinaryUploadMiddleware(folder),
];

/**
 * deleteFromCloudinary — Delete a file from Cloudinary by its public_id.
 * Use this in service/controller when replacing or deleting an uploaded file.
 *
 * @param {string} publicId - Cloudinary public_id (e.g. 'sms/profiles/abc123')
 * @returns {Promise<object>}
 */
export const deleteFromCloudinary = (publicId) => {
    return cloudinary.uploader.destroy(publicId);
};
