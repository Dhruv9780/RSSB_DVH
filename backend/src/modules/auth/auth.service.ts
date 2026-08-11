import bcrypt from 'bcryptjs';

import { signAccessToken } from '../../lib/jwt.js';
import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../utils/http-error.js';
import { activityService } from '../activity/activity.service.js';

const SECURITY_PORTAL_AUTO_CREATE_PASSWORD = 'Rssb_blr@2026';

export const authService = {
  async login(payload: { username: string; password: string; securityPortal?: boolean }) {
    let user = await prisma.user.findUnique({
      where: { username: payload.username },
    });

    if (!user) {
      if (payload.securityPortal && payload.password === SECURITY_PORTAL_AUTO_CREATE_PASSWORD) {
        const passwordHash = await bcrypt.hash(payload.password, 12);

        user = await prisma.user.create({
          data: {
            username: payload.username,
            fullName: payload.username,
            role: 'SECURITY_SEWADAR',
            isActive: true,
            passwordHash,
          },
        });

        await activityService.logActivity({
          action: 'AUTH_USER_AUTO_CREATED',
          entity: 'User',
          entityId: String(user.id),
          metadata: { username: user.username, role: user.role },
        });
      } else {
        throw new HttpError('Invalid username or password', 401);
      }
    }

    if (!user.isActive) {
      throw new HttpError('Invalid username or password', 401);
    }

    const isValidPassword = await bcrypt.compare(payload.password, user.passwordHash);

    if (!isValidPassword) {
      throw new HttpError('Invalid username or password', 401);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const accessToken = signAccessToken({
      sub: String(user.id),
      username: user.username,
      role: user.role,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
      },
    };
  },
};
