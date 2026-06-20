import Invoice from './invoice.model.js';
import Payment from './payment.model.js';

/**
 * payment.repository.js — Data access layer for Invoice & Payment module.
 */

// ── Invoice ───────────────────────────────────────────────────────────────────

export const findInvoiceById = (id) =>
    Invoice.findById(id)
        .populate('residentId', 'residentCode ownershipType')
        .populate('unitId', 'unitNumber bhkType')
        .lean();

export const findInvoicesByResident = async (residentId, { page = 1, limit = 20, status } = {}) => {
    const filter = { residentId };
    if (status) filter.status = status;

    const [data, total] = await Promise.all([
        Invoice.find(filter)
            .populate('unitId', 'unitNumber')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .lean(),
        Invoice.countDocuments(filter),
    ]);
    return { data, total };
};

export const findInvoicesBySociety = async (societyId, { page = 1, limit = 20, status, residentId } = {}) => {
    const filter = { societyId };
    if (status) filter.status = status;
    if (residentId) filter.residentId = residentId;

    const [data, total] = await Promise.all([
        Invoice.find(filter)
            .populate('residentId', 'residentCode')
            .populate('unitId', 'unitNumber')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .lean(),
        Invoice.countDocuments(filter),
    ]);
    return { data, total };
};

export const createInvoice = (data) => Invoice.create(data);

export const updateInvoice = (id, update) =>
    Invoice.findByIdAndUpdate(id, update, { new: true, runValidators: true }).lean();

// ── Payment ───────────────────────────────────────────────────────────────────

export const findPaymentsByResident = async (residentId, { page = 1, limit = 20 } = {}) => {
    const filter = { residentId };

    const [data, total] = await Promise.all([
        Payment.find(filter)
            .populate('invoiceId', 'invoiceNumber totalAmount')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .lean(),
        Payment.countDocuments(filter),
    ]);
    return { data, total };
};

export const createPayment = (data) => Payment.create(data);
