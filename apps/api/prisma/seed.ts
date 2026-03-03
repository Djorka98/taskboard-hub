import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const main = async () => {
  console.log('Seed scaffold ready. Demo data will be implemented in the seed-data step.');
};

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
