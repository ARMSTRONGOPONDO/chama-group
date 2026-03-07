import { Router } from 'express';
import { applyForLoan, approveLoan, recordRepayment, getLoans } from '../controllers/loanController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/apply', authenticate, applyForLoan);
router.get('/', authenticate, authorize(['ADMIN', 'TREASURER']), getLoans);
router.post('/:id/approve', authenticate, authorize(['ADMIN']), approveLoan);
router.post('/repay', authenticate, authorize(['TREASURER', 'ADMIN']), recordRepayment);

export default router;
