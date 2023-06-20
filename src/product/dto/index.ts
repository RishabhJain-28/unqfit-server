import { IsEnum, IsInt, Max, Min } from 'class-validator';
import { IsValidString } from '../../util/decorators/validator/IsValidString.decorator';
import { SizeChart } from '../../constants';

export class AddProductDto {
  @IsValidString()
  name: string;
  @IsValidString()
  type: string; //! make into enum?
  @IsValidString()
  description: string;

  @IsValidString()
  @IsEnum(SizeChart)
  size: SizeChart;
  // images

  @IsInt()
  @Min(0)
  quantity: number;

  @IsInt()
  @Min(0)
  price: number;

  @IsInt()
  @Min(0)
  @Max(100)
  //percent
  discount: number;

  @IsValidString()
  color: string;

  @IsValidString()
  material: string;
}
