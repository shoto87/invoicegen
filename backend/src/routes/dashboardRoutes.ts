import { Router } from 'express';
import { getDashboardStats, seedSampleData } from '../controllers/dashboardController';
import { authenticate } from '../middleware/auth';
import { requireTenant } from '../middleware/tenant';

const router = Router();

router.use(authenticate);
router.use(requireTenant);

router.get('/stats', getDashboardStats);
router.post('/seed-sample', seedSampleData);

export default router;
