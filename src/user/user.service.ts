import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}
  async getUserOrders(userId: number) {
    return this.prisma.order.findMany({
      where: {
        userId,
      },
    });
  }
}
