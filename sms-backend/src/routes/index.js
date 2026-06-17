import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes.js';

/**
 * routes/index.js — Central API router (v1).
 *
 * All module routes are mounted here under their resource prefix.
 * Add each module's router below as it is built.
 *
 * Route convention: /api/v1/<resource>
 */
const router = Router();

// ── Health check (unauthenticated) ──────────────────────────────────────────
router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'SMS API is operational',
        timestamp: new Date().toISOString(),
        version: 'v1',
    });
});

// ── Authentication ───────────────────────────────────────────────────────────
router.use('/auth', authRoutes);

// ── Module routes (uncomment as each module is implemented) ─────────────────
import societyRoutes    from '../modules/society/society.routes.js';
import residentRoutes   from '../modules/resident/resident.routes.js';
// import visitorRoutes    from '../modules/visitor/visitor.routes.js';
// import vehicleRoutes    from '../modules/vehicle/vehicle.routes.js';
// import paymentRoutes    from '../modules/payment/payment.routes.js';
// import complaintRoutes  from '../modules/complaint/complaint.routes.js';
// import noticeRoutes     from '../modules/notice/notice.routes.js';
// import facilityRoutes   from '../modules/facility/facility.routes.js';
// import emergencyRoutes  from '../modules/emergency/emergency.routes.js';
// import pollRoutes       from '../modules/poll/poll.routes.js';
// import documentRoutes   from '../modules/document/document.routes.js';
// import analyticsRoutes  from '../modules/analytics/analytics.routes.js';
// import notificationRoutes from '../modules/notification/notification.routes.js';
import superAdminRoutes from '../modules/superadmin/superadmin.routes.js';
import publicRoutes from '../modules/public/public.routes.js';

// Standard Authenticated Routes
router.use('/residents', residentRoutes);
router.use('/societies', societyRoutes);
router.use('/admin', superAdminRoutes);

// Public Endpoints
router.use('/public', publicRoutes);

export default router;
