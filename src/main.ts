import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupApplication } from './setup';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  setupApplication(app);
  await app.listen(3333);
}
bootstrap();
