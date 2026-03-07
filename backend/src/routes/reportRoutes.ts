import { Router } from 'express';
import { getOverview, getMemberStatement, getSavingsGrowth, getLoansIssued, getMemberBreakdown } from '../controllers/reportController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/overview', authenticate, authorize(['ADMIN', 'TREASURER']), getOverview);
router.get('/savings-growth', authenticate, authorize(['ADMIN', 'TREASURER']), getSavingsGrowth);
router.get('/loans-issued', authenticate, authorize(['ADMIN', 'TREASURER']), getLoansIssued);
router.get('/member-breakdown', authenticate, authorize(['ADMIN', 'TREASURER']), getMemberBreakdown);
router.get('/member/:id', authenticate, getMemberStatement);

export default router;
