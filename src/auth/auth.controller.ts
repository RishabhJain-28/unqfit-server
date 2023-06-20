import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { Body, Query } from '@nestjs/common/decorators';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { AuthDto, SendVerificationEmailDto, SignupDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  signup(@Body() dto: SignupDto, @Res({ passthrough: true }) res: Response) {
    return this.authService.signup(dto, res);
  }

  @HttpCode(HttpStatus.OK)
  @Post('/signin')
  signin(@Body() dto: AuthDto, @Res({ passthrough: true }) res: Response) {
    return this.authService.signin(dto, res);
  }

  @Get('/signout')
  signout(@Res({ passthrough: true }) res: Response) {
    this.authService.removeTokenFromCookie(res);
    return {
      msg: 'Signed out successfully!',
    };
  }

  @Get('/verifyEmail')
  verifyEmail(@Query('email') email: string, @Query('token') token: string) {
    return this.authService.verifyEmail({ email, token });
  }

  @Post('/sendVerificationEmail')
  sendVerificationEmail(@Body() dto: SendVerificationEmailDto) {
    return this.authService.sendVerificationEmail(dto);
  }
}
