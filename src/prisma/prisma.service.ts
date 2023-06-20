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
    return this.$transaction([this.user.deleteMany()]);
  }
}
