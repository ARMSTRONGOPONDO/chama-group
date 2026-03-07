import { Router } from 'express';
import { recordSaving, getMemberSavings, getSavingsSummary } from '../controllers/savingController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/', authenticate, authorize(['TREASURER', 'ADMIN']), recordSaving);
router.get('/member/:id', authenticate, getMemberSavings);
router.get('/summary', authenticate, authorize(['ADMIN', 'TREASURER']), getSavingsSummary);

export default router;
