import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { Shop } from '../models/Shop';
import { Integration } from '../models/Integration';
import { successResponse, errorResponse } from '../utils/apiResponse';

export async function getShopProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const shop = await Shop.findById(req.shopId);
    if (!shop) {
      errorResponse(res, 'Shop not found.', 404);
      return;
    }

    successResponse(res, shop, 'Shop profile retrieved.');
  } catch (err) {
    next(err);
  }
}

export async function updateShopProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, phone, email, gstin, address, branding, settings, googleReviewUrl } = req.body;

    const shop = await Shop.findById(req.shopId);
    if (!shop) {
      errorResponse(res, 'Shop not found.', 404);
      return;
    }

    if (name) shop.name = name.trim();
    if (phone !== undefined) shop.phone = phone;
    if (email !== undefined) shop.email = email;
    if (gstin !== undefined) shop.gstin = gstin.toUpperCase().trim();
    if (googleReviewUrl !== undefined) shop.googleReviewUrl = googleReviewUrl;

    if (address) {
      shop.address = {
        ...shop.address,
        ...address,
      };
    }

    if (branding) {
      shop.branding = {
        ...shop.branding,
        ...branding,
      };
    }

    if (settings) {
      shop.settings = {
        ...shop.settings,
        ...settings,
      };
    }

    await shop.save();
    successResponse(res, shop, 'Shop profile updated successfully.');
  } catch (err) {
    next(err);
  }
}

export async function getIntegrations(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const integrations = await Integration.find({ shopId: req.shopId }).select('-credentials');
    
    // Default providers list
    const providers = ['whatsapp_cloud', 'google_business', 'aws_s3'];
    const result = providers.map((provider) => {
      const match = integrations.find((i) => i.provider === provider);
      return {
        provider,
        status: match ? match.status : 'disconnected',
        lastSyncAt: match?.lastSyncAt || null,
        errorMessage: match?.errorMessage || null,
      };
    });

    successResponse(res, result, 'Shop integrations status.');
  } catch (err) {
    next(err);
  }
}
