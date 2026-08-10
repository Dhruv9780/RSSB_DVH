import { prisma } from '../lib/prisma.js';

const defaultCategories = [
  'Mobile Phone',
  'Wallet',
  'Bag',
  'Documents',
  'Keys',
  'Jewelry',
  'Electronics',
  'Clothing',
  'Watch',
  'Other',
];

const defaultLocations = [
  'Main Gate',
  'Parking Area',
  'Registration Desk',
  'Food Court',
  'Prayer Hall',
  'Dormitory',
  'Stage Area',
  'Security Office',
  'Reception',
  'Storage Room',
];

const seed = async (): Promise<void> => {
  for (const categoryName of defaultCategories) {
    await prisma.category.upsert({
      where: { name: categoryName },
      create: {
        name: categoryName,
      },
      update: {
        isActive: true,
      },
    });
  }

  for (const locationName of defaultLocations) {
    await prisma.location.upsert({
      where: { name: locationName },
      create: {
        name: locationName,
      },
      update: {
        isActive: true,
      },
    });
  }

  console.log('Master data seeded successfully.');
};

seed()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
