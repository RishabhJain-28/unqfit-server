import { OrderStatus, Size } from '@prisma/client';
import { IsEnum, IsInt } from 'class-validator';
import { IsValidString } from '../../util/decorators/validator/IsValidString.decorator';

export class GetOrderByStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;
}

export class NewOrderItemDto {
  @IsInt()
  productId: number;
  @IsInt()
  quantity: number;
  @IsEnum(Size, {
    message: ({ property }) => `Invalid value for ${property}`,
  })
  size: Size;
}

export class NewOrderFromCartDto {
  //!add string length validation
  @IsValidString()
  paymentType: string;

  // @ValidateNested({ each: true })
  // @Type(() => NewOrderItemDto)
  // orderItems: NewOrderItemDto[];
}
