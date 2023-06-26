import { Controller, UseGuards, Get, Post } from '@nestjs/common';
import { JwtGuard } from '../auth/guard';
import { GetUser } from '../util/decorators/middleware/getUser.decorator';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto';
import { User } from '@prisma/client';

@UseGuards(JwtGuard)
@Controller('cart')
export class CartController {
  constructor(private cartService: CartService) {}

  @Get('/')
  async getUserCartItems(@GetUser('id') userId) {
    return this.cartService.getUserCartItems(userId);
  }

  @Post('/add')
  async addToCart(
    @GetUser('id') userId: number,
    addCartItemDto: AddCartItemDto,
  ) {
    return this.cartService.addItemToCart(userId, addCartItemDto);
  }
}
