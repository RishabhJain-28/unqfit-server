import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddProductDto } from './dto';
import { ElasticsearchService } from '../elasticsearch/elasticsearch.service';
import { AddRole } from '../util/decorators/middleware/addRole.decorator';
import { Role } from '@prisma/client';

@Injectable()
@AddRole(Role.ADMIN)
export class ProductService {
  constructor(
    private prisma: PrismaService,
    private elasticSearch: ElasticsearchService,
  ) {}

  //!remove
  async fetchAllProduct() {
    return this.prisma.product.findMany({
      include: {
        inventory: true,
      },
    });
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
    // const index = 'someindex';
    // // await this.elasticSearch.createIndex(index);
    // // await this.elasticSearch.add(index, 'title1');
    // // await this.elasticSearch.add(index, 'title2');
    // const result = await this.elasticSearch.search({
    //   index,
    //   query: { fuzzy: { title: 'title2' } },
    // });
    // console.log(result.hits);
    // return result;
  }

  //TODO edit and delete, elatisearch , images, gropus, add ae product id to dto

  async searchProducts(searchKey: string) {}
}
