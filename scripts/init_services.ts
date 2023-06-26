import { PrismaClient, Role, User } from '@prisma/client';
import * as argon from 'argon2';
import { seedDatabase } from '../src/prisma/seedDB';
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});
//! for test users are seeded in the test module
const main = async () => {
  const admin = await seedDatabase.createAdmin(prisma);
  const user = await seedDatabase.createUser(prisma);
  console.log('admin', admin);
  console.log('user', user);
  console.log('done');
};
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
