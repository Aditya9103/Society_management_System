/**
 * payment.service.js — Business logic for Invoice & Payment module.
 *
 * Razorpay integration stubs are marked with // TODO: Razorpay
 * and will be wired up in a future release.
 */

import * as paymentRepo from './payment.repository.js';
import * as residentRepo from '../resident/resident.repository.js';
import ApiError from '../../utils/ApiError.js';
import { ROLES } from '../../config/constants.js';

const ROLES_ALLOWED_ALL = [ROLES.SOCIETY_ADMIN, ROLES.ACCOUNTANT, ROLES.COMMITTEE_MEMBER];

// ── Resident — list own invoices ──────────────────────────────────────────────

export const getMyInvoices = async (userId, query = {}) => {
    const resident = await residentRepo.findByUserId(userId);
    if (!resident) throw ApiError.notFound('Resident profile not found.');

    const { page = 1, limit = 20, status } = query;
    const { data, total } = await paymentRepo.findInvoicesByResident(resident._id, { page, limit, status });

    return {
        data,
        pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

// ── Get single invoice (resident owns it, or admin/accountant) ────────────────

export const getInvoiceById = async (id, userId, role) => {
    const invoice = await paymentRepo.findInvoiceById(id);
    if (!invoice) throw ApiError.notFound('Invoice not found.');

    // Admins and accountants can access any invoice in their society
    if (ROLES_ALLOWED_ALL.includes(role)) return invoice;

    // Resident can only access own invoice
    const resident = await residentRepo.findByUserId(userId);
    if (!resident || invoice.residentId?.toString() !== resident._id.toString()) {
        throw ApiError.forbidden('Access denied.');
    }
    return invoice;
};

// ── Admin/Accountant — list all society invoices ──────────────────────────────

export const getAllInvoices = async (societyId, query = {}) => {
    const { page = 1, limit = 20, status, residentId } = query;
    const { data, total } = await paymentRepo.findInvoicesBySociety(societyId, { page, limit, status, residentId });

    return {
        data,
        pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

// ── TODO: Razorpay — Initiate payment ────────────────────────────────────────

export const initiatePayment = async (invoiceId, residentId) => {
    const invoice = await paymentRepo.findInvoiceById(invoiceId);
    if (!invoice) throw ApiError.notFound('Invoice not found.');
    if (invoice.residentId?.toString() !== residentId.toString()) {
        throw ApiError.forbidden('Access denied.');
    }
    if (invoice.status === 'PAID') throw ApiError.badRequest('Invoice is already paid.');

    // TODO: Razorpay — Create Razorpay order
    // const razorpayOrder = await razorpay.orders.create({ amount: invoice.balanceAmount * 100, currency: 'INR' });
    // await paymentRepo.updateInvoice(invoiceId, { razorpayOrderId: razorpayOrder.id });
    // return razorpayOrder;

    return {
        message: 'Razorpay integration coming soon.',
        invoiceId,
        amount: invoice.balanceAmount ?? invoice.totalAmount,
        currency: 'INR',
    };
};

// ── TODO: Razorpay — Verify payment ──────────────────────────────────────────

export const verifyPayment = async (payload) => {
    // TODO: Razorpay — Verify signature
    // const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET)
    //     .update(`${payload.razorpay_order_id}|${payload.razorpay_payment_id}`)
    //     .digest('hex');
    // if (expectedSignature !== payload.razorpay_signature) throw ApiError.badRequest('Invalid payment signature.');

    return { message: 'Razorpay verification coming soon.' };
};
