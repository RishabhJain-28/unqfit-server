import { Size } from '@prisma/client';
import {
  IsDecimal,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  Max,
  Min,
} from 'class-validator';

//!map null to undefined

export class UpdateInventoryDto {
  @IsNotEmpty()
  @IsInt()
  productId: number;

  @IsNotEmpty()
  @IsEnum(Size)
  size: Size;

  @IsInt()
  @IsNotEmpty()
  @Min(0)
  quantity: number;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  price: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Max(100)
  discount: number;
}
