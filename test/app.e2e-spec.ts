import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import pactum from 'pactum';
describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('Auth', () => {
    const userDto = {
      email: 'test@gmail.com',
      password: 'pass123',
    };
    it('should sign up a user ', () => {
      pactum.spec().post('/auth/signup').withBody(userDto).expectStatus(201);
    });
  });
});
