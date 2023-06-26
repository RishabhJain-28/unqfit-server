import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddCartItemDto } from './dto';

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

  async addItemToCart(userId: number, { productId, size }: AddCartItemDto) {
    //!check if product exists
    // check if already added this item to cart
    // if yes increase qty

    //update or create
    let cartItem = await this.prisma.cartItem.upsert({
      where: {
        userId_productId_size: {
          productId,
          size,
          userId,
        },
      },
      update: {
        qunatity: {
          increment: 1,
        },
      },
      create: {
        productId,
        userId,
        qunatity: 1,
        size,
      },
    });
    console.log(cartItem);
    // if (cartItem) {
    //   cartItem.qunatity++;
    // }
  }
}
