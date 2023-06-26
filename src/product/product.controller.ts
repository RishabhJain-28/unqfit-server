import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  Get,
  Post,
} from '@nestjs/common/decorators/http/request-mapping.decorator';
import { ElasticsearchService } from '../elasticsearch/elasticsearch.service';
import { AddProductDto } from './dto';
import { ProductService } from './product.service';
import { AdminGuard, JwtGuard } from '../auth/guard';
import { AddRole } from '../util/decorators/middleware/addRole.decorator';

@Controller('products')
export class ProductController {
  constructor(
    private productService: ProductService,
    private elastic: ElasticsearchService,
  ) {}
  //!remove
  @Get('all')
  getAll() {
    return this.productService.fetchAllProduct();
  }
  @Get('/:id')
  getFromId(@Param('id', new ParseIntPipe()) id: number) {
    return this.productService.getByIdProduct(id);
  }
  // index = 'thisissomeindex';
  // @Get('search')
  // searchProducts(@Query('searchKey') searchKey: string) {
  //   // return this.productService.searchProducts(searchKey);
  //   // this.elastic.search({
  //   //   query: {
  //   //     fuzzy: ,
  //   //   },
  //   // });
  // }
  // @Get('test_create')
  // async test() {
  //   this.elastic.createIndex(this.index);
  // }

  @Post('/add')
  // @AddRole("")
  @UseGuards(JwtGuard, AdminGuard)
  async addProduct(@Body() dto: AddProductDto) {
    // return this.elastic.add(this.index, dto.name, dto.description);
    return this.productService.addProduct(dto);
  }
  //TODO   @Delete
}
