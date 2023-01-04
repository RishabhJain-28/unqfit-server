import { Controller, UseGuards } from '@nestjs/common';
import { Get } from '@nestjs/common/decorators/http/request-mapping.decorator';
import { User } from '@prisma/client';
import { JwtGuard } from '../auth/guard';
import { GetUser } from '../util/decorators/getUser.decorator';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  @Get('me')
  getMe(@GetUser() user: User) {
    return user;
  }
}
