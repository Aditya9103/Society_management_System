import Document from './document.model.js';
import DocumentVersion from './documentVersion.model.js';
import DocumentAccessLog from './documentAccessLog.model.js';
import DocumentApproval from './documentApproval.model.js';

export const createDocument = async (data) => {
    const doc = new Document(data);
    return doc.save();
};

export const getDocumentById = async (id) => {
    return Document.findById(id).populate('uploadedBy', 'name email role');
};

export const updateDocument = async (id, data) => {
    return Document.findByIdAndUpdate(id, data, { new: true });
};

export const queryDocuments = async (filter, options = {}) => {
    const { skip = 0, limit = 50, sort = { createdAt: -1 } } = options;
    return Document.find(filter)
        .populate('uploadedBy', 'name role')
        .populate('vehicleId')
        .populate('unitId')
        .sort(sort)
        .skip(skip)
        .limit(limit);
};

export const countDocuments = async (filter) => {
    return Document.countDocuments(filter);
};

export const createDocumentVersion = async (data) => {
    const version = new DocumentVersion(data);
    return version.save();
};

export const getDocumentVersions = async (documentId) => {
    return DocumentVersion.find({ documentId })
        .populate('uploadedBy', 'name role')
        .sort({ version: -1 });
};

export const createAccessLog = async (data) => {
    const log = new DocumentAccessLog(data);
    return log.save();
};

export const getAccessLogs = async (documentId) => {
    return DocumentAccessLog.find({ documentId })
        .populate('userId', 'name role')
        .sort({ createdAt: -1 });
};

export const createApprovalLog = async (data) => {
    const approval = new DocumentApproval(data);
    return approval.save();
};

export const getExpiringDocuments = async (dateThreshold) => {
    return Document.find({
        expiryDate: { $lte: dateThreshold, $gt: new Date() },
        status: 'ACTIVE',
        deletedAt: null
    }).populate('ownerId');
};

export const getExpiredDocuments = async () => {
    return Document.find({
        expiryDate: { $lte: new Date() },
        status: 'ACTIVE',
        deletedAt: null
    }).populate('ownerId');
};
