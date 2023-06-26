import { IsEnum, IsInt, Max, Min } from 'class-validator';
import { IsValidString } from '../../util/decorators/validator/IsValidString.decorator';
import { SizeChart } from '../../constants';
import { Category } from '@prisma/client';

//! update acc to the schema
export class AddProductDto {
  @IsValidString()
  name: string;

  @IsValidString()
  description: string;

  @IsValidString()
  color: string;

  @IsValidString()
  material: string;

  @IsEnum(Category)
  category: Category;

  @IsValidString()
  brand: string;
  // @IsValidString()
  // @IsEnum(SizeChart)
  // size: SizeChart;
  // images

  // @IsInt()
  // @Min(0)
  // quantity: number;

  // @IsInt()
  // @Min(0)
  // price: number;

  // @IsInt()
  // @Min(0)
  // @Max(100)
  // //percent
  // discount: number;
}
