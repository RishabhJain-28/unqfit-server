import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddProductDto } from './dto';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  //!remove
  async fetchAllProduct() {
    return this.prisma.product.findMany();
  }

  async getByIdProduct(id: number) {
    let product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new BadRequestException('invalid id');
    }
    return product;
  }

  async addProduct(dto: AddProductDto) {
    //! Any check?
    //! Add auth
    //! add batch add products
    return this.prisma.product.create({
      data: dto,
    });
  }

  //TODO edit and delete, elatisearch , images, gropus, add ae product id to dto

  // async searchProduct(searchKey: string) {
  //   return this.prisma.product.findMany({
  //     where:{
  //       description:
  //     }
  //   });
  // }
}
