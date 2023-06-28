import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { CartService } from '../cart/cart.service';
import { CartModule } from '../cart/cart.module';

@Module({
  imports: [CartModule],
  providers: [OrderService],
  controllers: [OrderController],
})
export class OrdersModule {}
