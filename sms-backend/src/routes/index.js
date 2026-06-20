import { Router } from 'express';
import authRoutes        from '../modules/auth/auth.routes.js';
import societyRoutes     from '../modules/society/society.routes.js';
import residentRoutes    from '../modules/resident/resident.routes.js';
import staffRoutes       from '../modules/staff/staff.routes.js';
import superAdminRoutes  from '../modules/superadmin/superadmin.routes.js';
import publicRoutes      from '../modules/public/public.routes.js';
import complaintRoutes   from '../modules/complaint/complaint.routes.js';
import noticeRoutes      from '../modules/notice/notice.routes.js';
import visitorRoutes     from '../modules/visitor/visitor.routes.js';
import paymentRoutes     from '../modules/payment/payment.routes.js';

/**
 * routes/index.js — Central API router (v1).
 *
 * Route convention: /api/v1/<resource>
 */
const router = Router();

// ── Health check (unauthenticated) ─────────────────────────────────────────
router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'SMS API is operational',
        timestamp: new Date().toISOString(),
        version: 'v1',
    });
});

// ── Authentication (public) ─────────────────────────────────────────────────
router.use('/auth', authRoutes);

// ── Public (unauthenticated) endpoints ──────────────────────────────────────
router.use('/public', publicRoutes);

// ── Authenticated module routes ─────────────────────────────────────────────
router.use('/admin',      superAdminRoutes);   // Super Admin
router.use('/societies',  societyRoutes);      // Society Admin
router.use('/residents',  residentRoutes);     // Resident
router.use('/staff',      staffRoutes);        // All staff roles
router.use('/complaints', complaintRoutes);    // Complaint module
router.use('/notices',    noticeRoutes);       // Notice module
router.use('/visitors',   visitorRoutes);      // Visitor module
router.use('/invoices',   paymentRoutes);      // Invoice & Payment module

export default router;
