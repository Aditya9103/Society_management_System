import * as docRepo from './document.repository.js';
import * as residentRepo from '../resident/resident.repository.js';
import ApiError from '../../utils/ApiError.js';
import { getIO } from '../../socket/socket.server.js';
import { ROOMS } from '../../socket/rooms.js';
import { ROLES } from '../../config/constants.js';

export const uploadDocument = async (user, societyId, data, file) => {
    if (!file) throw ApiError.badRequest('File is required');

    const documentData = { 
        ...data,
        societyId,
        uploadedBy: user._id || user.sub || user.id,
        fileUrl: file.fileUrl || file.cloudinaryUrl,
        storageKey: file.storageKey || file.cloudinaryPublicId,
        fileSize: file.size,
        mimeType: file.mimetype,
        status: ['RESIDENTIAL', 'LEGAL', 'SOCIETY', 'MAINTENANCE'].includes(data.category) && user.role === ROLES.RESIDENT ? 'PENDING' : 'ACTIVE'
    };

    const newDoc = await docRepo.createDocument(documentData);

    // Create version 1
    await docRepo.createDocumentVersion({
        documentId: newDoc._id,
        version: 1,
        fileUrl: newDoc.fileUrl,
        storageKey: newDoc.storageKey,
        fileSize: newDoc.fileSize,
        mimeType: newDoc.mimeType,
        uploadedBy: user._id || user.sub || user.id,
        changeLog: 'Initial Upload'
    });

    getIO().to(ROOMS.SOCIETY(societyId)).emit('DOCUMENT_UPLOADED', { documentId: newDoc._id });

    return newDoc;
};

export const updateDocument = async (id, user, data, file) => {
    const doc = await docRepo.getDocumentById(id);
    if (!doc || doc.deletedAt) throw ApiError.notFound('Document not found');

    if (doc.uploadedBy._id.toString() !== (user._id || user.sub || user.id).toString() && user.role === ROLES.RESIDENT) {
        throw ApiError.forbidden('You do not have permission to update this document');
    }

    const updates = { ...data };

    if (file) {
        updates.fileUrl = file.fileUrl || file.cloudinaryUrl;
        updates.storageKey = file.storageKey || file.cloudinaryPublicId;
        updates.fileSize = file.size;
        updates.mimeType = file.mimetype;
        updates.currentVersion = doc.currentVersion + 1;
        if (['RESIDENTIAL', 'LEGAL'].includes(doc.category) && user.role === ROLES.RESIDENT) {
            updates.status = 'PENDING';
        }
    }

    const updatedDoc = await docRepo.updateDocument(id, updates);

    if (file) {
        await docRepo.createDocumentVersion({
            documentId: updatedDoc._id,
            version: updatedDoc.currentVersion,
            fileUrl: updatedDoc.fileUrl,
            storageKey: updatedDoc.storageKey,
            fileSize: updatedDoc.fileSize,
            mimeType: updatedDoc.mimeType,
            uploadedBy: user._id || user.sub || user.id,
            changeLog: data.changeLog || 'Updated Document'
        });
    }

    getIO().to(ROOMS.SOCIETY(doc.societyId)).emit('DOCUMENT_UPDATED', { documentId: updatedDoc._id });

    return updatedDoc;
};

export const getDocuments = async (user, societyId, filters = {}, options = {}) => {
    const query = { societyId, deletedAt: null, ...filters };

    if (user.role === ROLES.RESIDENT || user.role === ROLES.TENANT) {
        // Residents can see their own docs OR public society docs
        query.$or = [
            { uploadedBy: user._id || user.sub || user.id },
            { visibility: 'PUBLIC' },
            { visibility: 'SOCIETY' } // if allowed
        ];
    }

    return docRepo.queryDocuments(query, options);
};

export const getDocumentById = async (id, user, reqIp) => {
    const doc = await docRepo.getDocumentById(id);
    if (!doc || doc.deletedAt) throw ApiError.notFound('Document not found');

    await docRepo.createAccessLog({
        documentId: id,
        userId: user._id || user.sub || user.id,
        action: 'VIEWED',
        ipAddress: reqIp,
        deviceInfo: 'Web Browser'
    });

    return doc;
};

export const downloadDocument = async (id, user, reqIp) => {
    const doc = await docRepo.getDocumentById(id);
    if (!doc || doc.deletedAt) throw ApiError.notFound('Document not found');

    await docRepo.createAccessLog({
        documentId: id,
        userId: user._id || user.sub || user.id,
        action: 'DOWNLOADED',
        ipAddress: reqIp,
        deviceInfo: 'Web Browser'
    });

    return doc.fileUrl;
};

export const approveDocument = async (id, user, payload) => {
    const doc = await docRepo.getDocumentById(id);
    if (!doc || doc.deletedAt) throw ApiError.notFound('Document not found');

    const updated = await docRepo.updateDocument(id, { status: payload.status });

    await docRepo.createApprovalLog({
        documentId: id,
        approvedBy: user._id || user.sub || user.id,
        status: payload.status,
        remarks: payload.remarks
    });

    const eventName = payload.status === 'APPROVED' ? 'DOCUMENT_APPROVED' : 'DOCUMENT_REJECTED';
    getIO().to(ROOMS.SOCIETY(doc.societyId)).emit(eventName, { documentId: id });

    return updated;
};

export const softDeleteDocument = async (id, user) => {
    const doc = await docRepo.getDocumentById(id);
    if (!doc || doc.deletedAt) throw ApiError.notFound('Document not found');

    if (doc.uploadedBy._id.toString() !== (user._id || user.sub || user.id).toString() && user.role !== ROLES.SOCIETY_ADMIN && user.role !== ROLES.SUPER_ADMIN) {
        throw ApiError.forbidden('You do not have permission to delete this document');
    }

    // Delete file from Cloudinary
    if (doc.storageKey) {
        const { deleteFile } = await import('../../services/storage.service.js');
        try {
            await deleteFile(doc.storageKey);
        } catch (error) {
            console.error(`Failed to delete document file from Cloudinary: ${error.message}`);
        }
    }

    await docRepo.updateDocument(id, { deletedAt: new Date(), status: 'ARCHIVED', fileUrl: '', storageKey: '' });
    
    await docRepo.createAccessLog({
        documentId: id,
        userId: user._id || user.sub || user.id,
        action: 'DELETED'
    });

    getIO().to(ROOMS.SOCIETY(doc.societyId)).emit('DOCUMENT_DELETED', { documentId: id });
    return { success: true };
};

export const restoreDocument = async (id, user) => {
    const doc = await docRepo.getDocumentById(id);
    if (!doc || !doc.deletedAt) throw ApiError.notFound('Document not found or not deleted');

    await docRepo.updateDocument(id, { deletedAt: null, status: 'ACTIVE' });

    await docRepo.createAccessLog({
        documentId: id,
        userId: user._id || user.sub || user.id,
        action: 'RESTORED'
    });

    return { success: true };
};

export const getDocumentVersions = async (id) => {
    return docRepo.getDocumentVersions(id);
};

export const getDocumentAuditLogs = async (id) => {
    return docRepo.getAccessLogs(id);
};
