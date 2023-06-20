import {
  Controller,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
  Body,
} from '@nestjs/common';
import {
  Get,
  Post,
} from '@nestjs/common/decorators/http/request-mapping.decorator';
import { User } from '@prisma/client';
import { JwtGuard } from '../auth/guard';
import { GetUser } from '../util/decorators/middleware/getUser.decorator';
import { ProductService } from './product.service';
import { AddProductDto } from './dto';
@Controller('products')
export class ProductController {
  constructor(private productService: ProductService) {}
  //!remove
  @Get('all')
  getAll() {
    return this.productService.fetchAllProduct();
  }

  @Get('/:id')
  searchProducts(@Param('id', new ParseIntPipe()) id: number) {
    return this.productService.getByIdProduct(id);
  }

  @Post('/add')
  addProduct(@Body() dto: AddProductDto) {
    return this.productService.addProduct(dto);
  }
  // @Get('search')
  // searchProducts(@Query('searchKey') searchKey: string) {
  //   return this.productService.fetchAllProduct();
  // }
}
