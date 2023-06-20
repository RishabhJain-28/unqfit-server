import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';
import {
  AuthDto,
  SendVerificationEmailDto,
  SignupDto,
  VerifyEmailDto,
} from '../src/auth/dto';
import { PrismaService } from '../src/prisma/prisma.service';
import { setupApplication } from '../src/setup';
import { AppModule } from './../src/app.module';
import { createMock } from '@golevelup/ts-jest';
import { MailerService } from '../src/mailer/mailer.service';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
      providers: [
        { provide: MailerService, useValue: createMock<MailerService>() },
      ],
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
    // const EMAIL = ;
    const authDto: AuthDto = {
      email: 'abc@gmail.com',
      password: 'Pass@123',
    };
    const sendVerificationEmailDto: SendVerificationEmailDto = {
      email: authDto.email,
    };

    describe('Verify Email', () => {
      pactum
        .spec()
        .post('/auth/sendVerificationEmail')
        .withBody(sendVerificationEmailDto)
        .expectStatus(201);

      const emailService = app.get<MailerService>(MailerService);
      expect(emailService.sendMail).toHaveBeenCalled();
    });

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
        //! add more expects other than Status
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            password: signupDto.password,
          })
          .expectStatus(400);
      });
      it('Should throw if password empty', () => {
        //! add more expects other than Status
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

  afterAll(() => {
    app.close();
  });
});
