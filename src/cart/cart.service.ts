import { Injectable, BadRequestException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddCartItemDto } from './dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}
  async getUserCartItems(userId: number) {
    return this.prisma.cartItem.findMany({
      where: {
        userId,
      },
      include: {
        product: true,
      },
    });
  }

  async addItemToCart(userId: number, { productId, size }: AddCartItemDto) {
    // check if already added this item to cart
    // if yes increase qty
    //update or create
    //! do i need to vallidate product id seperatly?
    const inventory = await this.prisma.inventory.findUnique({
      where: {
        productId_size: {
          productId,
          size,
        },
      },
    });
    if (!inventory || inventory.quantity === 0) {
      throw new BadRequestException(
        'Cannot add item to cart since item is out of stock',
      );
    }
    let cartItem = await this.prisma.cartItem.findUnique({
      where: {
        userId_productId_size: {
          productId,
          size,
          userId,
        },
      },
    });
    if (!cartItem) {
      cartItem = await this.prisma.cartItem.create({
        data: {
          userId,
          quantity: 1,
          size,
          productId,
        },
      });
    } else if (inventory.quantity > cartItem.quantity) {
      cartItem = await this.prisma.cartItem.update({
        where: {
          id: cartItem.id,
        },
        data: {
          quantity: {
            increment: 1,
          },
        },
      });
    } else {
      throw new BadRequestException(
        'Cannot add item to cart since item is out of stock',
      );
    }

    return cartItem;
  }

  async removeItemFromCart(cartItemId: number) {
    const cartItem = await this.prisma.cartItem.findUnique({
      where: {
        id: cartItemId,
      },
    });
    if (!cartItem) {
      throw new BadRequestException('Item not present in cart');
    }
    if (cartItem.quantity === 1) {
      await this.prisma.cartItem.delete({ where: { id: cartItem.id } });
    } else {
      await this.prisma.cartItem.update({
        where: { id: cartItem.id },
        data: {
          quantity: {
            decrement: 1,
          },
        },
      });
    }
    return {
      message: 'Item removed from cart',
    };
  }

  async clearCart(userId: number) {
    await this.prisma.cartItem.deleteMany({
      where: {
        userId,
      },
    });
    return {
      message: 'Cart Cleared',
    };
  }
}
