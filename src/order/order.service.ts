import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  async getOrdersByStatus(status: OrderStatus) {
    this.prisma.order.findMany({
      where: {
        status,
      },
    });
  }
}
