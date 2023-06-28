import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';
import { GetOrderByStatusDto, NewOrderFromCartDto } from './dto';
import { CartService } from '../cart/cart.service';

@Injectable()
export class OrderService {
  constructor(
    private prisma: PrismaService,
    private cartService: CartService,
  ) {}

  async getOrdersByStatus({ status }: GetOrderByStatusDto) {
    try {
      return this.prisma.order.findMany({
        where: {
          status,
        },
      });
    } catch (e) {
      console.log(e);
      throw new BadRequestException('Invalid status');
    }
  }

  async orderCart(dto: NewOrderFromCartDto, userId: number) {
    //check cart validity
    //check payment
    // place order
    //! use prisma only instead of cart service?
    // let cart = await this.cartService.getUserCartItems(userId, false);
    let cart = await this.prisma.cartItem.findMany({
      where: {
        userId,
      },
      include: {
        inventory: {
          select: {
            quantity: true,
          },
        },
      },
    });

    if (!cart || cart.length === 0) {
      throw new BadRequestException('Cannot order empty cart');
    }
    console.log(cart);

    //validate cart

    cart.forEach((item) => {
      const inv = this.prisma.inventory.findUnique({
        where: {
          productId_size: {
            productId: item.productId,
            size: item.size,
          },
        },
      });
    });
  }
}
