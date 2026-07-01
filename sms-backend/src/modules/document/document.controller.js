import * as docService from './document.service.js';
import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';

export const uploadDocument = asyncHandler(async (req, res) => {
    const doc = await docService.uploadDocument(req.user, req.societyId, req.body, req.file);
    res.status(201).json(new ApiResponse(201, { document: doc }, 'Document uploaded successfully'));
});

export const updateDocument = asyncHandler(async (req, res) => {
    const doc = await docService.updateDocument(req.params.id, req.user, req.body, req.file);
    res.status(200).json(new ApiResponse(200, { document: doc }, 'Document updated successfully'));
});

export const getDocuments = asyncHandler(async (req, res) => {
    const { page = 1, limit = 50, ...filters } = req.query;
    const options = {
        skip: (page - 1) * limit,
        limit: parseInt(limit)
    };
    const docs = await docService.getDocuments(req.user, req.societyId, filters, options);
    res.status(200).json(new ApiResponse(200, { documents: docs }, 'Documents retrieved successfully'));
});

export const getDocumentById = asyncHandler(async (req, res) => {
    const doc = await docService.getDocumentById(req.params.id, req.user, req.ip);
    res.status(200).json(new ApiResponse(200, { document: doc }, 'Document retrieved successfully'));
});

export const downloadDocument = asyncHandler(async (req, res) => {
    const fileUrl = await docService.downloadDocument(req.params.id, req.user, req.ip);
    res.status(200).json(new ApiResponse(200, { url: fileUrl }, 'Download URL generated'));
});

export const approveDocument = asyncHandler(async (req, res) => {
    const doc = await docService.approveDocument(req.params.id, req.user, req.body);
    res.status(200).json(new ApiResponse(200, { document: doc }, `Document ${req.body.status.toLowerCase()} successfully`));
});

export const softDeleteDocument = asyncHandler(async (req, res) => {
    await docService.softDeleteDocument(req.params.id, req.user);
    res.status(200).json(new ApiResponse(200, null, 'Document archived successfully'));
});

export const restoreDocument = asyncHandler(async (req, res) => {
    await docService.restoreDocument(req.params.id, req.user);
    res.status(200).json(new ApiResponse(200, null, 'Document restored successfully'));
});

export const getDocumentVersions = asyncHandler(async (req, res) => {
    const versions = await docService.getDocumentVersions(req.params.id);
    res.status(200).json(new ApiResponse(200, { versions }, 'Document versions retrieved successfully'));
});

export const getDocumentAuditLogs = asyncHandler(async (req, res) => {
    const logs = await docService.getDocumentAuditLogs(req.params.id);
    res.status(200).json(new ApiResponse(200, { logs }, 'Document audit logs retrieved successfully'));
});
