import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config/dist';
import { PrismaClient } from '@prisma/client';
@Injectable()
export class PrismaService extends PrismaClient {
  constructor(config: ConfigService) {
    super({
      datasources: {
        db: {
          url: config.get('DATABASE_URL'),
        },
      },
    });
  }
  // withExtensions() {
  //   return this.$extends({
  //     model: {
  //       product: {
  //         create() {
  //           console.log('THIS is created');
  //         },
  //       },
  //     },
  //   });
  // }
  cleanDb() {
    if (process.env.NODE_ENV === 'production') return;
    //!find better way
    return this.$transaction([
      this.verifyEmail.deleteMany(),
      this.order.deleteMany(),
      this.orderItem.deleteMany(),
      this.cartItem.deleteMany(),
      this.inventory.deleteMany(),
      this.product.deleteMany(),
      this.user.deleteMany(),
    ]);
  }
}
