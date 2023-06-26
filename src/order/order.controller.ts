import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { AdminGuard, JwtGuard } from '../auth/guard';
import { OrderService } from './order.service';
import { GetUser } from '../util/decorators/middleware/getUser.decorator';
import { OrderStatus } from '@prisma/client';

//!change guard acc to admin or access
@UseGuards(JwtGuard)
@Controller('orders')
export class OrderController {
  constructor(private ordersService: OrderService) {}

  @Get('/status')
  @UseGuards(AdminGuard)
  //! TODO: make admin only
  //! CHECK this api
  async getOrdersByStatus(@Query('status') status: OrderStatus) {
    return this.ordersService.getOrdersByStatus(status);
  }
}
