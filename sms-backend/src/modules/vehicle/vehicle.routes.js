import express from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/rbac.middleware.js';
import * as vehicleController from './vehicle.controller.js';

const router = express.Router();

router.use(authenticate);

// --- RESIDENT ROUTES ---
router.post('/', authorize('RESIDENT'), vehicleController.registerVehicle);
router.get('/', authorize('RESIDENT'), vehicleController.getMyVehicles);
router.put('/:id', authorize('RESIDENT'), vehicleController.updateMyVehicle);
router.delete('/:id', authorize('RESIDENT'), vehicleController.deleteMyVehicle);
router.post('/:id/regenerate-qr', authorize('RESIDENT'), vehicleController.regenerateQr);

// --- ADMIN ROUTES ---
router.get('/admin/all', authorize('SOCIETY_ADMIN'), vehicleController.getAllVehicles);
router.post('/admin/:id/approve', authorize('SOCIETY_ADMIN'), vehicleController.approveVehicle);
router.post('/admin/:id/reject', authorize('SOCIETY_ADMIN'), vehicleController.rejectVehicle);
router.post('/admin/:id/block', authorize('SOCIETY_ADMIN'), vehicleController.blockVehicle);
router.get('/admin/logs', authorize('SOCIETY_ADMIN'), vehicleController.getVehicleLogs);

// --- GUARD ROUTES ---
router.post('/scan/entry', authorize('SECURITY_GUARD'), vehicleController.scanVehicleEntry);
router.post('/scan/exit', authorize('SECURITY_GUARD'), vehicleController.scanVehicleExit);

// --- PARKING ROUTES (ADMIN ONLY FOR NOW) ---
router.post('/parking', authorize('SOCIETY_ADMIN'), vehicleController.createParkingSlot);
router.get('/parking', authorize('SOCIETY_ADMIN', 'RESIDENT'), vehicleController.getParkingSlots); // Residents can see available slots
router.post('/parking/:id/assign', authorize('SOCIETY_ADMIN'), vehicleController.assignParkingToVehicle);
router.post('/parking/:id/unassign', authorize('SOCIETY_ADMIN'), vehicleController.unassignParkingSlot);

export default router;
