import express from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/rbac.middleware.js';
import { auditLog } from '../../middleware/audit.middleware.js';
import * as vehicleController from './vehicle.controller.js';

const router = express.Router();

router.use(authenticate);

// --- RESIDENT ROUTES ---
router.post('/', authorize('RESIDENT'), auditLog('REGISTER', 'VEHICLE'), vehicleController.registerVehicle);
router.get('/', authorize('RESIDENT'), vehicleController.getMyVehicles);
router.put('/:id', authorize('RESIDENT'), auditLog('UPDATE', 'VEHICLE'), vehicleController.updateMyVehicle);
router.delete('/:id', authorize('RESIDENT'), auditLog('DELETE', 'VEHICLE'), vehicleController.deleteMyVehicle);
router.post('/:id/regenerate-qr', authorize('RESIDENT'), auditLog('REGENERATE_QR', 'VEHICLE'), vehicleController.regenerateQr);

// --- ADMIN ROUTES ---
router.get('/admin/all', authorize('SOCIETY_ADMIN'), vehicleController.getAllVehicles);
router.post('/admin/:id/approve', authorize('SOCIETY_ADMIN'), auditLog('APPROVE', 'VEHICLE'), vehicleController.approveVehicle);
router.post('/admin/:id/reject', authorize('SOCIETY_ADMIN'), auditLog('REJECT', 'VEHICLE'), vehicleController.rejectVehicle);
router.post('/admin/:id/block', authorize('SOCIETY_ADMIN'), auditLog('BLOCK', 'VEHICLE'), vehicleController.blockVehicle);
router.get('/admin/logs', authorize('SOCIETY_ADMIN'), vehicleController.getVehicleLogs);

// --- GUARD ROUTES ---
router.post('/scan/entry', authorize('SECURITY_GUARD'), auditLog('SCAN_ENTRY', 'VEHICLE'), vehicleController.scanVehicleEntry);
router.post('/scan/exit', authorize('SECURITY_GUARD'), auditLog('SCAN_EXIT', 'VEHICLE'), vehicleController.scanVehicleExit);

// --- PARKING ROUTES (ADMIN ONLY FOR NOW) ---
router.post('/parking', authorize('SOCIETY_ADMIN'), vehicleController.createParkingSlot);
router.get('/parking', authorize('SOCIETY_ADMIN', 'RESIDENT'), vehicleController.getParkingSlots); // Residents can see available slots
router.post('/parking/:id/assign', authorize('SOCIETY_ADMIN'), vehicleController.assignParkingToVehicle);
router.post('/parking/:id/unassign', authorize('SOCIETY_ADMIN'), vehicleController.unassignParkingSlot);

export default router;
