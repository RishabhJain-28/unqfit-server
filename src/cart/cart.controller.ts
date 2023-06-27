import {
  Controller,
  UseGuards,
  Get,
  Post,
  Delete,
  Body,
  Put,
  Param,
  ParseIntPipe,
  HttpCode,
} from '@nestjs/common';
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
    @Body() addCartItemDto: AddCartItemDto,
  ) {
    return this.cartService.addItemToCart(userId, addCartItemDto);
  }
  @Post('/remove/:id')
  @HttpCode(200)
  async removeFromCart(@Param('id', new ParseIntPipe()) cartItemId: number) {
    return this.cartService.removeItemFromCart(cartItemId);
  }

  @Delete('/clear')
  async clearCart(@GetUser('id') userId: number) {
    return this.cartService.clearCart(userId);
  }
  //TODO   clear cart
}
