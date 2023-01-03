import { INestApplication, ValidationPipe } from '@nestjs/common';

export const setupApplication = (app: INestApplication) => {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
};
