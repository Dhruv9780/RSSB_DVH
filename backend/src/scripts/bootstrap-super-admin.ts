import bcrypt from 'bcryptjs';

import { env } from '../config/env.js';
import { prisma } from '../lib/prisma.js';

const bootstrap = async (): Promise<void> => {
  const passwordHash = await bcrypt.hash(env.BOOTSTRAP_ADMIN_PASSWORD, 12);

  const user = await prisma.user.upsert({
    where: { username: env.BOOTSTRAP_ADMIN_USERNAME },
    update: {
      fullName: env.BOOTSTRAP_ADMIN_FULL_NAME,
      phone: env.BOOTSTRAP_ADMIN_PHONE || null,
      role: 'SUPER_ADMIN',
      isActive: true,
      passwordHash,
    },
    create: {
      username: env.BOOTSTRAP_ADMIN_USERNAME,
      fullName: env.BOOTSTRAP_ADMIN_FULL_NAME,
      phone: env.BOOTSTRAP_ADMIN_PHONE || null,
      role: 'SUPER_ADMIN',
      isActive: true,
      passwordHash,
    },
  });

  console.log(`Super admin ready: ${user.username} (id=${user.id})`);
};

bootstrap()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
