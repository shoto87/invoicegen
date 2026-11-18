import { Router } from 'express';
import { getShopProfile, updateShopProfile, getIntegrations } from '../controllers/shopController';
import { authenticate } from '../middleware/auth';
import { requireTenant } from '../middleware/tenant';
import { authorizeRoles } from '../middleware/rbac';

const router = Router();

router.use(authenticate);
router.use(requireTenant);

router.get('/profile', getShopProfile);
router.patch('/profile', authorizeRoles('shop_owner', 'super_admin'), updateShopProfile);
router.get('/integrations', getIntegrations);

export default router;
