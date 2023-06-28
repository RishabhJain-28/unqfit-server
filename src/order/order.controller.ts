import { Controller, Get, Param, Post, UseGuards, Body } from '@nestjs/common';
import { AdminGuard, JwtGuard } from '../auth/guard';
import { GetOrderByStatusDto, NewOrderFromCartDto } from './dto';
import { OrderService } from './order.service';
import { GetUser } from '../util/decorators/middleware/getUser.decorator';

//!change guard acc to admin or access
@UseGuards(JwtGuard)
@Controller('orders')
export class OrderController {
  constructor(private ordersService: OrderService) {}

  @Get('/:status')
  @UseGuards(AdminGuard)
  //! TODO: make admin only
  //! CHECK this api
  async getOrdersByStatus(
    @Param()
    dto: GetOrderByStatusDto,
  ) {
    return this.ordersService.getOrdersByStatus(dto);
  }

  @Post('/new')
  newOrder(@Body() dto: NewOrderFromCartDto, @GetUser('id') userId: number) {
    return this.ordersService.orderCart(dto, userId);
  }
}
