import { Controller, UseGuards, Get } from '@nestjs/common';
import { JwtGuard } from '../auth/guard';
import { GetUser } from '../util/decorators/middleware/getUser.decorator';
import { CartService } from './cart.service';

@UseGuards(JwtGuard)
@Controller('cart')
export class CartController {
  constructor(private cartService: CartService) {}

  @Get('/cart')
  async getUserCartItems(@GetUser('id') userId) {
    return this.cartService.getUserCartItems(userId);
  }
}
