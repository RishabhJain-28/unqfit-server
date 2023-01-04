import { Controller, HttpCode, HttpStatus, Post, Get } from '@nestjs/common';
import { Body } from '@nestjs/common/decorators';
import { Res } from '@nestjs/common/decorators/http/route-params.decorator';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  signup(@Body() dto: AuthDto, @Res({ passthrough: true }) res: Response) {
    return this.authService.signup(dto, res);
  }

  @HttpCode(HttpStatus.OK)
  @Post('/signin')
  signin(@Body() dto: AuthDto, @Res({ passthrough: true }) res: Response) {
    return this.authService.signin(dto, res);
  }

  @Get('signout')
  signout(@Res({ passthrough: true }) res: Response) {
    this.authService.removeTokenFromCookie(res);
  }
}
