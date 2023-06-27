import { Product, Inventory, CartItem } from '@prisma/client';
import * as pactum from 'pactum';
import { AuthDto } from '../../src/auth/dto';
import { AddCartItemDto } from '../../src/cart/dto';
import { UpdateInventoryDto } from '../../src/inventory/dto';
import { AddProductDto } from '../../src/product/dto';

export const authDto: AuthDto = {
  email: process.env.TEST_EMAIL,
  password: process.env.TEST_PASSWORD,
};
export const adminAuthDto: AuthDto = {
  email: process.env.ADMIN_EMAIL,
  password: process.env.ADMIN_PASSWORD,
};
export const signIn = async (
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
export const addProduct = async (
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
export const updateInventory = async (
  inventoryItemDto: UpdateInventoryDto,
): Promise<{
  inventory: Inventory;
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
      return { res: ctx.res, inventory: ctx.res.body };
    });
};
export const addToCart = async (
  addCartItemDto: AddCartItemDto,
): Promise<{
  cartItem: CartItem;
  res: pactum.handler.PactumResponse;
}> => {
  const { access_token_cookie } = await signIn();
  return pactum
    .spec()
    .post('/cart/add')
    .withCookies(access_token_cookie)
    .withBody(addCartItemDto)
    .expectStatus(201)
    .returns((ctx) => {
      return { res: ctx.res, cartItem: ctx.res.body };
    });
};
