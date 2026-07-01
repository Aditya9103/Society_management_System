import * as idCardService from './idCard.service.js';
import * as idCardRepo from './idCard.repository.js';
import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';
import ApiError from '../../utils/ApiError.js';

/**
 * POST /api/v1/id-cards/:residentId/generate
 * Manually generate or regenerate an ID card (for Admins)
 */
export const generateIdCard = asyncHandler(async (req, res) => {
    const { residentId } = req.params;
    const idCard = await idCardService.generateAndUploadIdCard(residentId);
    res.status(201).json(new ApiResponse(201, idCard, 'ID Card generated successfully'));
});

/**
 * POST /api/v1/id-cards/:residentId/upload-pdf
 * Upload the generated PDF from the frontend
 */
export const uploadIdCardPdf = asyncHandler(async (req, res) => {
    const { residentId } = req.params;
    if (!req.file) {
        throw ApiError.badRequest('PDF file is required');
    }
    const updatedCard = await idCardService.uploadIdCardPdf(residentId, req.file.buffer);
    res.status(200).json(new ApiResponse(200, updatedCard, 'ID Card PDF uploaded successfully'));
});

/**
 * PATCH /api/v1/id-cards/:id/status
 * Update an ID card's status (e.g. REVOKED, EXPIRED)
 */
export const updateIdCardStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['ACTIVE', 'REVOKED', 'EXPIRED'].includes(status)) {
        throw ApiError.badRequest('Invalid status');
    }

    const updatedCard = await idCardRepo.updateStatus(id, status);
    
    if (!updatedCard) {
        throw ApiError.notFound('ID Card not found');
    }

    res.status(200).json(new ApiResponse(200, updatedCard, 'ID Card status updated successfully'));
});

/**
 * POST /api/v1/id-cards/email
 * Send ID card to the authenticated resident's email
 */
export const emailIdCard = asyncHandler(async (req, res) => {
    const userId = req.user._id || req.user.id || req.user.sub;
    await idCardService.emailIdCard(userId);
    res.status(200).json(new ApiResponse(200, null, 'ID Card sent to your email successfully'));
});

/**
 * POST /api/v1/id-cards/verify
 * Verify a scanned QR code (for Guards)
 */
export const verifyIdCard = asyncHandler(async (req, res) => {
    const { qrData } = req.body;
    const result = await idCardService.verifyIdCard(qrData);
    res.status(200).json(new ApiResponse(200, result, 'ID Card is valid and verified.'));
});
