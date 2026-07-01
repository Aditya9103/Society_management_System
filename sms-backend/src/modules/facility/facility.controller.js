/**
 * facility.controller.js — HTTP handlers for Amenity & Booking module.
 */

import * as facilityService from './facility.service.js';
import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';

// ── Amenity ───────────────────────────────────────────────────────────────────

export const listAmenities = asyncHandler(async (req, res) => {
    const { societyId, role } = req.user;
    const { data, pagination } = await facilityService.listAmenities(societyId, req.query, role);
    res.status(200).json(new ApiResponse(200, { amenities: data }, 'Amenities fetched', pagination));
});

export const getAmenity = asyncHandler(async (req, res) => {
    const amenity = await facilityService.getAmenityById(req.params.id, req.user.societyId);
    res.status(200).json(new ApiResponse(200, { amenity }, 'Amenity fetched'));
});

export const createAmenity = asyncHandler(async (req, res) => {
    const amenity = await facilityService.createAmenity(req.user.societyId, req.body);
    res.status(201).json(new ApiResponse(201, { amenity }, 'Amenity created'));
});

export const updateAmenity = asyncHandler(async (req, res) => {
    const amenity = await facilityService.updateAmenity(req.params.id, req.user.societyId, req.body);
    res.status(200).json(new ApiResponse(200, { amenity }, 'Amenity updated'));
});

export const deleteAmenity = asyncHandler(async (req, res) => {
    await facilityService.deleteAmenity(req.params.id, req.user.societyId);
    res.status(200).json(new ApiResponse(200, null, 'Amenity deleted'));
});

// ── Availability ──────────────────────────────────────────────────────────────

export const getAvailability = asyncHandler(async (req, res) => {
    const { date } = req.query;
    if (!date) {
        return res.status(400).json(new ApiResponse(400, null, 'date query parameter is required'));
    }
    const result = await facilityService.getAvailableSlots(req.params.id, req.user.societyId, date);
    res.status(200).json(new ApiResponse(200, result, 'Availability fetched'));
});

// ── Bookings ──────────────────────────────────────────────────────────────────

export const listBookings = asyncHandler(async (req, res) => {
    const { sub: userId, role, societyId } = req.user;
    const { data, pagination } = await facilityService.listBookings(userId, role, societyId, req.query);
    res.status(200).json(new ApiResponse(200, { bookings: data }, 'Bookings fetched', pagination));
});

export const getBooking = asyncHandler(async (req, res) => {
    const { sub: userId, role, societyId } = req.user;
    const booking = await facilityService.getBookingById(req.params.id, userId, role, societyId);
    res.status(200).json(new ApiResponse(200, { booking }, 'Booking fetched'));
});

export const createBooking = asyncHandler(async (req, res) => {
    const { sub: userId, societyId } = req.user;
    const booking = await facilityService.createBooking(userId, societyId, req.body);
    res.status(201).json(new ApiResponse(201, { booking }, 'Booking created successfully'));
});

export const approveBooking = asyncHandler(async (req, res) => {
    const { sub: userId, societyId } = req.user;
    const booking = await facilityService.approveBooking(req.params.id, userId, societyId, req.body.adminNotes);
    res.status(200).json(new ApiResponse(200, { booking }, 'Booking approved'));
});

export const rejectBooking = asyncHandler(async (req, res) => {
    const { sub: userId, societyId } = req.user;
    const booking = await facilityService.rejectBooking(req.params.id, userId, societyId, req.body.reason);
    res.status(200).json(new ApiResponse(200, { booking }, 'Booking rejected'));
});

export const cancelBooking = asyncHandler(async (req, res) => {
    const { sub: userId, role, societyId } = req.user;
    const booking = await facilityService.cancelBooking(req.params.id, userId, role, societyId, req.body.reason);
    res.status(200).json(new ApiResponse(200, { booking }, 'Booking cancelled'));
});

export const markCompleted = asyncHandler(async (req, res) => {
    const booking = await facilityService.markBookingCompleted(req.params.id, req.user.societyId);
    res.status(200).json(new ApiResponse(200, { booking }, 'Booking marked as completed'));
});

export const markNoShow = asyncHandler(async (req, res) => {
    const booking = await facilityService.markBookingNoShow(req.params.id, req.user.societyId);
    res.status(200).json(new ApiResponse(200, { booking }, 'Booking marked as no-show'));
});

export const submitFeedback = asyncHandler(async (req, res) => {
    const { sub: userId, societyId } = req.user;
    const booking = await facilityService.submitFeedback(req.params.id, userId, societyId, req.body);
    res.status(200).json(new ApiResponse(200, { booking }, 'Feedback submitted'));
});
