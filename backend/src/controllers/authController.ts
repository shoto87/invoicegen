import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { User } from '../models/User';
import { Shop } from '../models/Shop';
import { AuditLog } from '../models/AuditLog';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { successResponse, errorResponse } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../types';

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { shopName, name, email, password, phone, gstin, address } = req.body;

    if (!shopName || !name || !email || !password) {
      errorResponse(res, 'Please provide shop name, owner name, email, and password.', 400);
      return;
    }

    if (password.length < 6) {
      errorResponse(res, 'Password must be at least 6 characters long.', 400);
      return;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      errorResponse(res, 'An account with this email address already exists.', 409);
      return;
    }

    // Generate unique slug for the jewellery shop
    let baseSlug = shopName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    if (!baseSlug) baseSlug = 'jewellery-shop';

    let uniqueSlug = baseSlug;
    let counter = 1;
    while (await Shop.findOne({ slug: uniqueSlug })) {
      uniqueSlug = `${baseSlug}-${counter++}`;
    }

    // Create Shop
    const shop = await Shop.create({
      name: shopName.trim(),
      slug: uniqueSlug,
      phone: phone || '',
      email: email.toLowerCase().trim(),
      gstin: gstin ? gstin.toUpperCase().trim() : '',
      address: address || {},
      status: 'active',
      settings: {
        currency: 'INR',
        timezone: 'Asia/Kolkata',
        invoicePrefix: 'INV-',
        feedbackAutoRequest: true,
      },
    });

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create Shop Owner User
    const user = await User.create({
      shopId: shop._id,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: 'shop_owner',
      phone: phone || '',
      isActive: true,
    });

    // Link owner to shop
    shop.ownerId = user._id;
    await shop.save();

    // Create audit log
    await AuditLog.create({
      shopId: shop._id,
      userId: user._id,
      action: 'SHOP_REGISTERED',
      resource: 'Shop',
      resourceId: shop._id.toString(),
      details: { shopName: shop.name, ownerEmail: user.email },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    // Generate Tokens
    const tokenPayload = {
      userId: user._id.toString(),
      shopId: shop._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    // Save refresh token hash
    const refreshHash = await bcrypt.hash(refreshToken, 10);
    user.refreshTokenHash = refreshHash;
    user.lastLoginAt = new Date();
    await user.save();

    // Set refresh token cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    successResponse(
      res,
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          shopId: shop._id,
        },
        shop: {
          id: shop._id,
          name: shop.name,
          slug: shop.slug,
          settings: shop.settings,
          branding: shop.branding,
        },
        accessToken,
      },
      'Shop and owner registered successfully.',
      201
    );
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      errorResponse(res, 'Email and password are required.', 400);
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+passwordHash');
    if (!user) {
      errorResponse(res, 'Invalid email or password.', 401);
      return;
    }

    if (!user.isActive) {
      errorResponse(res, 'Your account has been deactivated. Contact shop administrator.', 403);
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      errorResponse(res, 'Invalid email or password.', 401);
      return;
    }

    let shop = null;
    if (user.shopId) {
      shop = await Shop.findById(user.shopId);
      if (shop && shop.status === 'suspended') {
        errorResponse(res, 'This shop account has been suspended.', 403);
        return;
      }
    }

    const tokenPayload = {
      userId: user._id.toString(),
      shopId: user.shopId ? user.shopId.toString() : undefined,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    user.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    user.lastLoginAt = new Date();
    await user.save();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    successResponse(
      res,
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          shopId: user.shopId,
        },
        shop: shop
          ? {
              id: shop._id,
              name: shop.name,
              slug: shop.slug,
              branding: shop.branding,
              settings: shop.settings,
              googleReviewUrl: shop.googleReviewUrl,
            }
          : null,
        accessToken,
      },
      'Logged in successfully.'
    );
  } catch (err) {
    next(err);
  }
}

export async function refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rawRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!rawRefreshToken) {
      errorResponse(res, 'Refresh token missing. Please log in again.', 401);
      return;
    }

    const decoded = verifyRefreshToken(rawRefreshToken);
    const user = await User.findById(decoded.userId).select('+refreshTokenHash');

    if (!user || !user.isActive || !user.refreshTokenHash) {
      errorResponse(res, 'Invalid session or inactive account.', 401);
      return;
    }

    const isMatch = await bcrypt.compare(rawRefreshToken, user.refreshTokenHash);
    if (!isMatch) {
      errorResponse(res, 'Revoked refresh token. Please log in again.', 401);
      return;
    }

    const newPayload = {
      userId: user._id.toString(),
      shopId: user.shopId ? user.shopId.toString() : undefined,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const newAccessToken = signAccessToken(newPayload);

    successResponse(
      res,
      {
        accessToken: newAccessToken,
      },
      'Access token refreshed successfully.'
    );
  } catch (err: any) {
    errorResponse(res, 'Invalid or expired refresh token.', 401);
  }
}

export async function logout(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (req.user?.userId) {
      await User.findByIdAndUpdate(req.user.userId, { $unset: { refreshTokenHash: 1 } });
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    successResponse(res, null, 'Logged out successfully.');
  } catch (err) {
    next(err);
  }
}

export async function getMe(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await User.findById(req.user?.userId);
    if (!user) {
      errorResponse(res, 'User not found.', 404);
      return;
    }

    let shop = null;
    if (user.shopId) {
      shop = await Shop.findById(user.shopId);
    }

    successResponse(
      res,
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          shopId: user.shopId,
        },
        shop: shop
          ? {
              id: shop._id,
              name: shop.name,
              slug: shop.slug,
              phone: shop.phone,
              email: shop.email,
              gstin: shop.gstin,
              address: shop.address,
              branding: shop.branding,
              settings: shop.settings,
              googleReviewUrl: shop.googleReviewUrl,
            }
          : null,
      },
      'User profile retrieved.'
    );
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email } = req.body;
    if (!email) {
      errorResponse(res, 'Please provide an email address.', 400);
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // Avoid revealing user existence
      successResponse(res, null, 'If that email is registered, password reset instructions have been sent.');
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.passwordResetToken = hashedResetToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // In development, output token in response/console for seamless testing
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
    console.log(`[PASSWORD RESET] Link for ${email}: ${resetUrl}`);

    successResponse(
      res,
      { devResetUrl: resetUrl, token: resetToken },
      'Password reset link generated successfully.'
    );
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      errorResponse(res, 'Token and new password are required.', 400);
      return;
    }

    if (newPassword.length < 6) {
      errorResponse(res, 'Password must be at least 6 characters long.', 400);
      return;
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      errorResponse(res, 'Invalid or expired password reset token.', 400);
      return;
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    successResponse(res, null, 'Password reset successful. You can now log in.');
  } catch (err) {
    next(err);
  }
}
