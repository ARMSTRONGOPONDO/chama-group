import { Router } from 'express';
import { getOverview, getMemberStatement } from '../controllers/reportController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/overview', authenticate, authorize(['ADMIN', 'TREASURER']), getOverview);
router.get('/member/:id', authenticate, getMemberStatement);

export default router;
