import bcrypt from 'bcryptjs';

import { signAccessToken } from '../../lib/jwt.js';
import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../utils/http-error.js';

export const authService = {
  async login(payload: { username: string; password: string }) {
    const user = await prisma.user.findUnique({
      where: { username: payload.username },
    });

    if (!user || !user.isActive) {
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
