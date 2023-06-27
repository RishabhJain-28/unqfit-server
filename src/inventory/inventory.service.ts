import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateInventoryDto } from './dto';
import { Prisma, Size } from '@prisma/client';
//!product also has an in stock variable
@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async getInventoryByProductAndSize(productId: number, size: Size) {
    try {
      const inventory = await this.prisma.inventory.findUnique({
        where: {
          productId_size: {
            productId,
            size,
          },
        },
      });
      if (!inventory) {
        throw new BadRequestException('Inventory not found');
      }
      return inventory;
    } catch (e) {
      // console.log(e);
      throw new BadRequestException('Invalid product id or size');
    }
  }

  async deleteInventoryByProductAndSize(productId: number, size: Size) {
    try {
      const inventory = await this.prisma.inventory.delete({
        where: {
          productId_size: {
            productId,
            size,
          },
        },
      });

      if (!inventory) {
        throw new BadRequestException('inventory not found');
      }

      return inventory;
    } catch (e) {
      throw new BadRequestException('Invalid product id or size');
    }
  }

  async updateInventory({
    productId,
    discount,
    price,
    quantity,
    size,
  }: UpdateInventoryDto) {
    try {
      const inv = await this.prisma.inventory.upsert({
        where: {
          productId_size: {
            productId,
            size,
          },
        },
        create: {
          discount,
          price,
          quantity,
          size,
          productId,
        },
        update: {
          //! CHECK AND UPDATE MNAYBE ?
          discount,
          price,
          quantity,
        },
      });
      return inv;
    } catch (e) {
      //! can size be invalid? no cause there is validation
      throw new BadRequestException('Invalid ProductId ');
    }
  }
}
