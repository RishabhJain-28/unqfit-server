import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}
  async getUserCartItems(userId: number) {
    return this.prisma.cartItem.findMany({
      where: {
        userId,
      },
    });
  }
}
