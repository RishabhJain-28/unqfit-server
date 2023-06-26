import { Size } from '@prisma/client';
import { IsEnum, IsInt, Max, Min } from 'class-validator';

export class AddCartItemDto {
  @IsInt()
  productId: number;
  //   @IsInt()
  //   quantity: number;
  @IsEnum(Size)
  size: Size;
}
