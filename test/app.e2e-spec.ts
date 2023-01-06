import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import * as pactum from 'pactum';
import { AuthDto, SignupDto } from '../src/auth/dto';
import { PrismaService } from '../src/prisma/prisma.service';
import { setupApplication } from '../src/setup';
describe('AppController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    setupApplication(app);
    const TEST_PORT = 8000;
    await app.init();
    await app.listen(TEST_PORT);
    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl(`http://localhost:${TEST_PORT}`);
  });

  describe('Auth', () => {
    const authDto: AuthDto = {
      email: 'abc@gmail.com',
      password: 'Pass@123',
    };

    describe('Signup', () => {
      const signupDto: SignupDto = {
        ...authDto,
        name: 'Test perosn 1',
      };
      it('Should sign up', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(signupDto)
          .expectStatus(201);
      });
      it('Should throw if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            password: signupDto.password,
          })
          .expectStatus(400);
      });
      it('Should throw if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email: signupDto.email,
          })
          .expectStatus(400);
      });
    });
    describe('Signin', () => {
      it('should sign in', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(authDto)
          .expectStatus(200)
          .stores('userAt', 'access_token');
      });
      it('Should throw if incorrect email or pass', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            password: 'Pass@123a',
            email: authDto.email,
          })
          .expectStatus(401);
      });
    });
  });
});
