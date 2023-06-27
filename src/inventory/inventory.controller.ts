import {
  Get,
  Post,
  Body,
  Param,
  Controller,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { AdminGuard, JwtGuard } from '../auth/guard';
import { InventoryService } from './inventory.service';
import { UpdateInventoryDto } from './dto';
import { Size } from '@prisma/client';

@Controller('inventory')
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  @Get('/:productId/:size')
  getProductSizeInventory(
    @Param('productId') productId: number,
    @Param('size') size: Size,
  ) {
    return this.inventoryService.getInventoryByProductAndSize(productId, size);
  }

  @Post('/update')
  @UseGuards(JwtGuard, AdminGuard)
  updateInventory(@Body() updateInventoryDto: UpdateInventoryDto) {
    return this.inventoryService.updateInventory(updateInventoryDto);
  }

  //TODO   @Delete
  @Delete('/:productId/:size')
  @UseGuards(JwtGuard, AdminGuard)
  deleteProductSizeInventory(
    @Param('productId') productId: number,
    @Param('size') size: Size,
  ) {
    return this.inventoryService.deleteInventoryByProductAndSize(
      productId,
      size,
    );
  }
}
