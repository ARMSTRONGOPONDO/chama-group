import { Router } from 'express';
import { getMembers, getMember, updateMember, createMember } from '../controllers/memberController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/', authenticate, authorize(['ADMIN', 'TREASURER']), createMember);
router.get('/', authenticate, authorize(['ADMIN', 'TREASURER']), getMembers);
router.get('/:id', authenticate, getMember);
router.put('/:id', authenticate, authorize(['ADMIN']), updateMember);

export default router;
