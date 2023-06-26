import { PrismaClient, Role, User } from '@prisma/client';
import * as argon from 'argon2';

export const seedDatabase = {
  createUser: async (prisma: PrismaClient): Promise<User> => {
    //!change
    const hash = await argon.hash(process.env.TEST_PASSWORD);
    const user = await prisma.user.create({
      data: {
        email: process.env.TEST_EMAIL,
        hash,
        name: 'test user',
      },
    });
    return user;
  },

  createAdmin: async (prisma: PrismaClient): Promise<User> => {
    //!change
    const hash = await argon.hash(process.env.ADMIN_PASSWORD);
    const user = await prisma.user.create({
      data: {
        email: process.env.ADMIN_EMAIL,
        hash,
        name: 'Admin',
        role: Role.ADMIN,
      },
    });
    return user;
  },
};
