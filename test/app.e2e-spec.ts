import { INestApplication, Logger } from '@nestjs/common';
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
import { AddProductDto } from '../src/product/dto';
import { seedDatabase } from '../src/prisma/seedDB';
import { Category, Product } from '@prisma/client';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const authDto: AuthDto = {
    email: process.env.TEST_EMAIL,
    password: process.env.TEST_PASSWORD,
  };
  const adminAuthDto: AuthDto = {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
  };
  // const addProductDto: AddProductDto = {
  //   name: 'product 1',
  //   description: 'description 1',
  //   color: 'blue',
  //   material: 'cotton',
  //   category: 'MEN',
  //   brand: 'some brand',
  // };
  const product1Dto: AddProductDto = {
    name: 'product 1',
    description: 'description 1',
    color: 'blue',
    material: 'cotton',
    category: Category.MEN,
    brand: 'some brand',
  };
  const product2Dto: AddProductDto = {
    name: 'product 2',
    description: 'description 2',
    color: 'red',
    material: 'silk',
    category: Category.WOMEN,
    brand: 'some brand 2',
  };
  let product1: Product;
  let product2: Product;
  const signIn = async (
    dto: AuthDto = authDto,
  ): Promise<{
    access_token: string;
    res: pactum.handler.PactumResponse;
  }> => {
    return await pactum
      .spec()
      .post('/auth/signin')
      .withBody(dto)
      .expectStatus(200)
      .returns((ctx) => {
        return { res: ctx.res, access_token: ctx.res.headers['set-cookie'][0] };
      });
  };
  const addProduct = async (
    dto: AddProductDto,
  ): Promise<{
    product: Product;
    res: pactum.handler.PactumResponse;
  }> => {
    const { access_token } = await signIn(adminAuthDto);
    return await pactum
      .spec()
      .post('/products/add')
      .withCookies(access_token)
      .withBody(dto)
      .expectStatus(201)
      .returns((ctx) => {
        return { res: ctx.res, product: ctx.res.body };
      });
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
      providers: [
        { provide: MailerService, useValue: createMock<MailerService>() },
      ],
    })
      // .setLogger(new Logger())
      .compile();
    app = moduleRef.createNestApplication();
    setupApplication(app);
    const TEST_PORT = 8000;
    await app.init();
    await app.listen(TEST_PORT);
    prisma = app.get(PrismaService);

    await prisma.cleanDb();
    await seedDatabase.createAdmin(prisma);
    await seedDatabase.createUser(prisma);
    pactum.request.setBaseUrl(`http://localhost:${TEST_PORT}`);
    // pactum.settings.setLogLevel('');
  });

  // describe('Auth', () => {
  //   // const EMAIL = ;
  //   const authDto: AuthDto = {
  //     email: 'abc@gmail.com',
  //     password: 'Pass@123',
  //   };
  //   const sendVerificationEmailDto: SendVerificationEmailDto = {
  //     email: authDto.email,
  //   };

  //   describe('Verify Email', () => {
  //     pactum
  //       .spec()
  //       .post('/auth/sendVerificationEmail')
  //       .withBody(sendVerificationEmailDto)
  //       .expectStatus(201);

  //     // const emailService = app.get<MailerService>(MailerService);
  //     // expect(emailService.sendMail).toHaveBeenCalled();
  //   });

  //   describe('Signup', () => {
  //     const signupDto: SignupDto = {
  //       ...authDto,
  //       name: 'Test perosn 1',
  //     };
  //     it('Should sign up', () => {
  //       return pactum
  //         .spec()
  //         .post('/auth/signup')
  //         .withBody(signupDto)
  //         .expectStatus(201);
  //     });
  //     it('Should throw if email empty', () => {
  //       //! add more expects other than Status
  //       return pactum
  //         .spec()
  //         .post('/auth/signup')
  //         .withBody({
  //           password: signupDto.password,
  //         })
  //         .expectStatus(400);
  //     });
  //     it('Should throw if password empty', () => {
  //       //! add more expects other than Status
  //       return pactum
  //         .spec()
  //         .post('/auth/signup')
  //         .withBody({
  //           email: signupDto.email,
  //         })
  //         .expectStatus(400);
  //     });
  //   });

  //   describe('Signin', () => {
  //     it('should sign in', () => {
  //       return pactum
  //         .spec()
  //         .post('/auth/signin')
  //         .withBody(authDto)
  //         .expectStatus(200)
  //         .stores('userAt', 'access_token');
  //     });
  //     it('Should throw if incorrect email or pass', () => {
  //       return pactum
  //         .spec()
  //         .post('/auth/signin')
  //         .withBody({
  //           password: 'Pass@123a',
  //           email: authDto.email,
  //         })
  //         .expectStatus(401);
  //     });
  //   });
  // });

  describe('product', () => {
    describe('add new product', () => {
      //! does it need more test?
      it('should fail if logged out', () => {
        return pactum
          .spec()
          .post('/products/add')
          .withBody(product1Dto)
          .expectStatus(401);
      });
      it('should fail if not admin', async () => {
        const { access_token } = await signIn();
        return await pactum
          .spec()
          .post('/products/add')
          .withCookies(access_token)
          .withBody(product1Dto)
          .inspect()
          .expectStatus(403);
      });
      it('should fail if it has empty body', async () => {
        const { access_token } = await signIn(adminAuthDto);
        await pactum
          .spec()
          .post('/products/add')
          .withCookies(access_token)
          .withBody({})
          .expectStatus(400);
        return pactum
          .spec()
          .get('/products/all')
          .expectStatus(200)
          .expectJsonLength(0);
      });
      it('should fail if it has invalid properties', async () => {
        const { access_token } = await signIn(adminAuthDto);
        await pactum
          .spec()
          .post('/products/add')
          .withCookies(access_token)
          .withBody({
            ...product1Dto,
            name: '',
          })
          .expectStatus(400);
        //!Write validation tests for each proerty ?
        return pactum
          .spec()
          .get('/products/all')
          .expectStatus(200)
          .expectJsonLength(0);
      });
      it('should be success if admin', async () => {
        const { access_token } = await signIn(adminAuthDto);
        await pactum
          .spec()
          .post('/products/add')
          .withCookies(access_token)
          .withBody(product1Dto)
          .expectStatus(201);
        return pactum
          .spec()
          .get('/products/all')
          .expectStatus(200)
          .expectJsonLength(1);
        //!more expectations?
      });
    });
    describe('get products', () => {
      it('should show all added products', async () => {
        product1 = (await addProduct(product1Dto)).product;
        product2 = (await addProduct(product2Dto)).product;
        return pactum
          .spec()
          .get('/products/all')
          .expectStatus(200)
          .expectJsonLength(3);
      });
      it('should get product of a specific id', async () => {
        return pactum
          .spec()
          .get(`/products/${product1.id}`)
          .expectStatus(200)
          .expectJsonLike(product1);
      });
      it('should fail on invalid id', async () => {
        return pactum
          .spec()
          .get(`/products/1000`)
          .expectStatus(400)
          .expectJsonLike({
            message: 'invalid id',
          });
      });
    });
  });

  describe('cart', () => {
    // it('shouldnt have any prodcust', () => {
    //   return pactum
    //     .spec()
    //     .get('/products/all')
    //     .expectStatus(200)
    //     .expectJsonLength(3);
    // });
  });

  afterAll(() => {
    app.close();
  });
});
