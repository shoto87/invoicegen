import { Router, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { requireTenant } from '../middleware/tenant';
import { AuthenticatedRequest } from '../types';
import { Customer } from '../models/Customer';
import { successResponse } from '../utils/apiResponse';

const router = Router();

router.use(authenticate);
router.use(requireTenant);

// List customers for this shop
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const total = await Customer.countDocuments({ shopId: req.shopId });
  const customers = await Customer.find({ shopId: req.shopId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  successResponse(
    res,
    customers,
    'Customers retrieved successfully.',
    200,
    {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  );
});

export default router;
