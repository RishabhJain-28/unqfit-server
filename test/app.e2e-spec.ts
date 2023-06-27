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
import { Inventory, Product, Size } from '@prisma/client';
import { AddCartItemDto } from '../src/cart/dto';
import { UpdateInventoryDto } from '../src/inventory/dto';

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

  const signIn = async (
    dto: AuthDto = authDto,
  ): Promise<{
    access_token_cookie: string;
    res: pactum.handler.PactumResponse;
  }> => {
    return await pactum
      .spec()
      .post('/auth/signin')
      .withBody(dto)
      .expectStatus(200)
      .returns((ctx) => {
        return {
          res: ctx.res,
          access_token_cookie: ctx.res.headers['set-cookie'][0],
        };
      });
  };
  const addProduct = async (
    dto: AddProductDto,
  ): Promise<{
    product: Product;
    res: pactum.handler.PactumResponse;
  }> => {
    const { access_token_cookie } = await signIn(adminAuthDto);
    return await pactum
      .spec()
      .post('/products/add')
      .withCookies(access_token_cookie)
      .withBody(dto)
      .expectStatus(201)
      .returns((ctx) => {
        return { res: ctx.res, product: ctx.res.body };
      });
  };

  const updateInventory = async (
    inventoryItemDto: UpdateInventoryDto,
  ): Promise<{
    product: Inventory;
    res: pactum.handler.PactumResponse;
  }> => {
    const { access_token_cookie } = await signIn(adminAuthDto);
    return pactum
      .spec()
      .post('/inventory/update')
      .withCookies(access_token_cookie)
      .withBody(inventoryItemDto)
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

  describe('product', () => {
    const addProductDto: AddProductDto = {
      name: 'product 1',
      description: 'description 1',
      color: 'blue',
      material: 'cotton',
      category: 'MEN',
      brand: 'some brand',
    };
    beforeEach(async () => {
      await prisma.product.deleteMany();
    });
    describe('add new product', () => {
      //! does it need more test?
      it('should fail if logged out', () => {
        return pactum
          .spec()
          .post('/products/add')
          .withBody(addProductDto)
          .expectStatus(401);
      });
      it('should fail for invalid admin token', () => {
        return pactum
          .spec()
          .post('/products/add')
          .withCookies('access_token_cookie=some_value')
          .withBody(addProductDto)
          .expectStatus(401);
      });
      it('should fail if logged out', () => {
        return pactum
          .spec()
          .post('/products/add')
          .withBody(addProductDto)
          .expectStatus(401);
      });
      it('should fail if not admin', async () => {
        const { access_token_cookie } = await signIn();
        return await pactum
          .spec()
          .post('/products/add')
          .withCookies(access_token_cookie)
          .withBody(addProductDto)
          .expectStatus(403);
      });
      it('should fail if it has empty body', async () => {
        const { access_token_cookie } = await signIn(adminAuthDto);
        await pactum
          .spec()
          .post('/products/add')
          .withCookies(access_token_cookie)
          .withBody({})
          .expectStatus(400);
        return pactum
          .spec()
          .get('/products/all')
          .expectStatus(200)
          .expectJsonLength(0);
      });
      it('should be success if admin', async () => {
        const { access_token_cookie } = await signIn(adminAuthDto);
        await pactum
          .spec()
          .post('/products/add')
          .withCookies(access_token_cookie)
          .withBody(addProductDto)
          .expectStatus(201);
        return pactum
          .spec()
          .get('/products/all')
          .expectStatus(200)
          .expectJsonLength(1);
        //!more expectations?
      });
      it('should fail if it has invalid properties', async () => {
        const { access_token_cookie } = await signIn(adminAuthDto);
        await pactum
          .spec()
          .post('/products/add')
          .withCookies(access_token_cookie)
          .withBody({
            ...addProductDto,
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
    });
    describe('get products', () => {
      const product1Dto: AddProductDto = {
        ...addProductDto,
        name: 'Prodcut 1',
      };
      const product2Dto: AddProductDto = {
        ...addProductDto,
        name: 'Prodcut 2',
      };
      it('should show all added products', async () => {
        await addProduct(product1Dto);
        await addProduct(product2Dto);
        return pactum
          .spec()
          .get('/products/all')
          .expectStatus(200)
          .expectJsonLength(2);
      });
      it('shouldnt have any products without adding', async () => {
        return pactum
          .spec()
          .get('/products/all')
          .expectStatus(200)
          .expectJsonLength(0);
      });
      it('should get product of a specific id', async () => {
        let product1 = (await addProduct(product1Dto)).product;
        let product2 = (await addProduct(product2Dto)).product;
        await pactum
          .spec()
          .get(`/products/${product1.id}`)
          .expectStatus(200)
          .expectJsonLike(product1);
        return pactum
          .spec()
          .get(`/products/${product2.id}`)
          .expectStatus(200)
          .expectJsonLike(product2);
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
  describe('inventory', () => {
    const addProductDto: AddProductDto = {
      name: 'product 1',
      description: 'description 1',
      color: 'blue',
      material: 'cotton',
      category: 'MEN',
      brand: 'some brand',
    };
    let product: Product;
    beforeAll(async () => {
      product = (await addProduct(addProductDto)).product;
    });
    beforeEach(async () => {
      await prisma.inventory.deleteMany();
    });
    //! add checks with get req too?

    describe('update inventory', () => {
      it('should fail if not admin', async () => {
        const inventoryItemDto: UpdateInventoryDto = {
          discount: 10,
          price: 10,
          productId: product.id,
          quantity: 2,
          size: Size.SMALL,
        };

        const { access_token_cookie } = await signIn();
        return pactum
          .spec()
          .post('/inventory/update')
          .withCookies(access_token_cookie)
          .withBody(inventoryItemDto)
          .expectStatus(403);
      });
      it('should fail for invalid product and size', async () => {
        const inventoryItemDto: UpdateInventoryDto = {
          discount: 10,
          price: 10,
          productId: product.id,
          quantity: 2,
          size: Size.SMALL,
        };
        const { access_token_cookie } = await signIn(adminAuthDto);
        await pactum
          .spec()
          .post('/inventory/update')
          .withCookies(access_token_cookie)
          .withBody({ ...inventoryItemDto, productId: 1000 })
          .expectStatus(400);
        await pactum
          .spec()
          .post('/inventory/update')
          .withCookies(access_token_cookie)
          .withBody({ ...inventoryItemDto, size: 'SOME_VALUE' })
          .expectStatus(400);
        return pactum
          .spec()
          .post('/inventory/update')
          .withCookies(access_token_cookie)
          .withBody({
            ...inventoryItemDto,
            productId: 1000,
            size: 'SOME_VALUE',
          })
          .expectStatus(400);
      });
      it('should fail for invalid body', async () => {
        const inventoryItemDto: UpdateInventoryDto = {
          discount: 10,
          price: 10,
          productId: product.id,
          quantity: 2,
          size: Size.SMALL,
        };
        const { access_token_cookie } = await signIn(adminAuthDto);
        // let invalid_body = {
        //   ...inventoryItemDto,
        // };
        // delete invalid_body.price;
        //! add check for different fields(fuzzy maybe? )
        await pactum
          .spec()
          .post('/inventory/update')
          .withCookies(access_token_cookie)
          .withBody({ ...inventoryItemDto, price: undefined })
          .expectStatus(400);
        await pactum
          .spec()
          .post('/inventory/update')
          .withCookies(access_token_cookie)
          .withBody({ ...inventoryItemDto, size: undefined })
          .expectStatus(400);
        return pactum
          .spec()
          .post('/inventory/update')
          .withCookies(access_token_cookie)
          .withBody({ ...inventoryItemDto, productId: null })
          .expectStatus(400);
      });
      it('should create if doesnt exisits', async () => {
        const inventoryItemDto: UpdateInventoryDto = {
          discount: 10,
          price: 10,
          productId: product.id,
          quantity: 2,
          size: Size.SMALL,
        };
        const { access_token_cookie } = await signIn(adminAuthDto);
        await pactum
          .spec()
          .post('/inventory/update')
          .withCookies(access_token_cookie)
          .withBody(inventoryItemDto)
          .expectStatus(201)
          .expectJsonLike(inventoryItemDto);
        return pactum
          .spec()
          .get(
            `/inventory/${inventoryItemDto.productId}/${inventoryItemDto.size}`,
          )
          .expectStatus(200)
          .expectJsonLike(inventoryItemDto);
      });
      it('should update if exisits', async () => {
        const inventoryItemDto: UpdateInventoryDto = {
          discount: 10,
          price: 10,
          productId: product.id,
          quantity: 2,
          size: Size.SMALL,
        };
        const { access_token_cookie } = await signIn(adminAuthDto);
        await pactum
          .spec()
          .post('/inventory/update')
          .withCookies(access_token_cookie)
          .withBody(inventoryItemDto)
          .expectStatus(201);
        const updateInventoryDto = {
          ...inventoryItemDto,
          price: 20,
          quantity: 10,
        };
        await pactum
          .spec()
          .post('/inventory/update')
          .withCookies(access_token_cookie)
          .withBody(updateInventoryDto)
          .expectStatus(201)
          .expectJsonLike(updateInventoryDto);
        return pactum
          .spec()
          .get(
            `/inventory/${inventoryItemDto.productId}/${inventoryItemDto.size}`,
          )
          .expectStatus(200)
          .expectJsonLike(updateInventoryDto);
      });
    });
    describe('get inventory', () => {
      it('should get inventory', async () => {
        const inventoryItemDto: UpdateInventoryDto = {
          discount: 10,
          price: 10,
          productId: product.id,
          quantity: 2,
          size: Size.SMALL,
        };
        const product2 = (
          await addProduct({ ...addProductDto, name: 'prod 2' })
        ).product;
        const inventoryItemDto2: UpdateInventoryDto = {
          ...inventoryItemDto,
          size: Size.SMALL,
          productId: product2.id,
        };
        await updateInventory(inventoryItemDto);
        await updateInventory(inventoryItemDto2);
        await pactum
          .spec()
          .get(`/inventory/${product.id}/${inventoryItemDto.size}`)
          .expectStatus(200)

          .expectJsonLike(inventoryItemDto);
        return pactum
          .spec()
          .get(`/inventory/${product2.id}/${inventoryItemDto2.size}`)
          .expectStatus(200)

          .expectJsonLike(inventoryItemDto2);
      });
      it('should fail for invalid product id or size', async () => {
        const inventoryItemDto: UpdateInventoryDto = {
          discount: 10,
          price: 10,
          productId: product.id,
          quantity: 2,
          size: Size.SMALL,
        };
        await updateInventory(inventoryItemDto);

        await pactum
          .spec()
          .get(`/inventory/${1000}/${inventoryItemDto.size}`)
          .expectStatus(400);
        return pactum
          .spec()
          .get(`/inventory/${product.id}/${'SOME_VALUE'}`)
          .expectStatus(400);
      });
    });

    describe('delete inventory', () => {
      it('should fail if not admin', async () => {
        const inventoryItemDto: UpdateInventoryDto = {
          discount: 10,
          price: 10,
          productId: product.id,
          quantity: 2,
          size: Size.SMALL,
        };
        await updateInventory(inventoryItemDto);
        const { access_token_cookie } = await signIn();
        return pactum
          .spec()
          .delete(
            `/inventory/${inventoryItemDto.productId}/${inventoryItemDto.size}`,
          )
          .withCookies(access_token_cookie)
          .expectStatus(403);
      });
      it('should fail for invalid product id or size', async () => {
        const inventoryItemDto: UpdateInventoryDto = {
          discount: 10,
          price: 10,
          productId: product.id,
          quantity: 2,
          size: Size.SMALL,
        };
        await updateInventory(inventoryItemDto);
        const { access_token_cookie } = await signIn(adminAuthDto);

        await pactum
          .spec()
          .delete(`/inventory/${1000}/${inventoryItemDto.size}`)
          .withCookies(access_token_cookie)
          .expectStatus(400);

        await pactum
          .spec()
          .delete(`/inventory/${inventoryItemDto.productId}/${'Some_size'}`)
          .withCookies(access_token_cookie)
          .expectStatus(400);

        return pactum
          .spec()
          .get(
            `/inventory/${inventoryItemDto.productId}/${inventoryItemDto.size}`,
          )
          .expectStatus(200)
          .expectJsonLike(inventoryItemDto);
      });
      it('should delete inventory if exits', async () => {
        const inventoryItemDto: UpdateInventoryDto = {
          discount: 10,
          price: 10,
          productId: product.id,
          quantity: 2,
          size: Size.SMALL,
        };
        await updateInventory(inventoryItemDto);
        const { access_token_cookie } = await signIn(adminAuthDto);
        await pactum
          .spec()
          .delete(
            `/inventory/${inventoryItemDto.productId}/${inventoryItemDto.size}`,
          )
          .withCookies(access_token_cookie)
          .expectStatus(200);
        return pactum
          .spec()
          .get(
            `/inventory/${inventoryItemDto.productId}/${inventoryItemDto.size}`,
          )
          .expectStatus(400);
      });
    });
  });
  // describe('cart', () => {
  //   let product: Product;
  //   beforeAll(async () => {
  //     product = (await addProduct(addProductDto)).product;
  //   });
  //   beforeEach(async () => {
  //     await prisma.cartItem.deleteMany();
  //   });

  //   describe('get cart items', () => {
  //     it('should fail if user not logged in', () => {
  //       return pactum.spec().get('/cart').expectStatus(401);
  //     });
  //     it('should get 0 items from empty cart', async () => {
  //       const { access_token_cookie } = await signIn();
  //       return pactum
  //         .spec()
  //         .get('/cart')
  //         .withCookies(access_token_cookie)
  //         .expectStatus(200)
  //         .expectJsonLength(0);
  //     });
  //     it('should get all items in cart', async () => {
  //       const { access_token_cookie } = await signIn();
  //       //! add item and check
  //       return pactum
  //         .spec()
  //         .get('/cart')
  //         .withCookies(access_token_cookie)
  //         .expectStatus(200)
  //         .expectJsonLength(2);
  //     });
  //   });
  //   describe('add item', () => {
  //     it.todo('should fail if user not logged');
  //     // it.todo('should fail gor invalid user token ');
  //     it('should add new item in cart', async () => {
  //       const { access_token_cookie } = await signIn();
  //       const cartItemDto: AddCartItemDto = {
  //         productId: product.id,
  //         size: Size.MEDIUM,
  //       };

  //       return pactum
  //         .spec()
  //         .post('/cart/add')
  //         .withCookies(access_token_cookie)
  //         .withBody(cartItemDto)
  //         .expectStatus(201);
  //     });
  //     it.todo('should increment item qty if already in cart');
  //     it.todo('should fail for invalid product id');
  //     it.todo('should fail for invalid size value');
  //     it.todo('should fail for if no size in inventory');
  //   });
  //   describe('remove item', () => {
  //     it.todo('should fail if user not logged in');
  //     it.todo('should decrement item qty on remove');
  //     it.todo('should remove item from cart if qty is zero');
  //   });
  //   describe('clear cart', () => {
  //     it.todo('should fail if user not logged in');
  //     it.todo('should clear cart');
  //   });
  // });

  afterAll(() => {
    app.close();
  });
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
//         .stores('userAt', 'access_token_cookie');
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
