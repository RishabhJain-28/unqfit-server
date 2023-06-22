import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { HealthCheckModule } from './health-check/health-check.module';
// import { MailerModule } from '@nestjs-modules/mailer';
import { MailerModule } from './mailer/mailer.module';
import { ProductModule } from './product/product.module';
import { ElasticSearchModule as ElasticsearchModule } from './elasticsearch/elasticsearch.module';
import { OrdersModule } from './order/order.module';
import { CartModule } from './cart/cart.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    ProductModule,
    HealthCheckModule,
    MailerModule,
    ElasticsearchModule,
    OrdersModule,
    CartModule,
    // MailerModule.forRootAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: (config: ConfigService) => {
    //     return {
    //       transport: {
    //         host: 'smtp.sendgrid.net',
    //         // host: 'smtp.mailtrap.io',
    //         // port: 25587,
    //         port: 465, //!SSL
    //         auth: {
    //           user: 'apikey',
    //           pass: config.get('SENDGRID_API_PASSWORD'),
    //         },
    //       },
    //     };
    //   },
    // }),
  ],
})
export class AppModule {}
