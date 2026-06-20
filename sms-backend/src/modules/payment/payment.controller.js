/**
 * payment.controller.js — HTTP handlers for Invoice & Payment module.
 */

import * as paymentService from './payment.service.js';
import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';

// ── Resident — list own invoices ──────────────────────────────────────────────

export const getMyInvoices = asyncHandler(async (req, res) => {
    const userId = req.user.sub;
    const { data, pagination } = await paymentService.getMyInvoices(userId, req.query);
    res.status(200).json(new ApiResponse(200, data, 'Invoices fetched', pagination));
});

// ── Any authorised role — get single invoice ──────────────────────────────────

export const getInvoiceById = asyncHandler(async (req, res) => {
    const userId = req.user.sub;
    const role = req.user.role;
    const invoice = await paymentService.getInvoiceById(req.params.id, userId, role);
    res.status(200).json(new ApiResponse(200, { invoice }, 'Invoice fetched'));
});

// ── Admin/Accountant — list all society invoices ──────────────────────────────

export const getAllInvoices = asyncHandler(async (req, res) => {
    const societyId = req.user.societyId;
    const { data, pagination } = await paymentService.getAllInvoices(societyId, req.query);
    res.status(200).json(new ApiResponse(200, data, 'All invoices fetched', pagination));
});

// ── Resident — initiate Razorpay payment (stub) ───────────────────────────────

export const initiatePayment = asyncHandler(async (req, res) => {
    const userId = req.user.sub;
    const resident = await (await import('../resident/resident.repository.js')).findByUserId(userId);
    const result = await paymentService.initiatePayment(req.params.id, resident?._id);
    res.status(200).json(new ApiResponse(200, result, 'Payment initiation response'));
});

// ── Resident — verify Razorpay payment (stub) ────────────────────────────────

export const verifyPayment = asyncHandler(async (req, res) => {
    const result = await paymentService.verifyPayment(req.body);
    res.status(200).json(new ApiResponse(200, result, 'Payment verification response'));
});
