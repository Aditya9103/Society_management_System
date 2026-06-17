import { Router } from 'express';
import * as publicController from './public.controller.js';

const router = Router();

/**
 * GET /api/v1/public/societies
 * Publicly list available societies for registration
 */
router.get('/societies', publicController.getSocieties);

/**
 * GET /api/v1/public/societies/:societyId/units
 * Publicly list vacant units for a specific society
 */
router.get('/societies/:societyId/units', publicController.getVacantUnits);

export default router;
