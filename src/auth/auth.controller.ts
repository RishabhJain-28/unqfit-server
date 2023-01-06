import { Controller, HttpCode, HttpStatus, Post, Get } from '@nestjs/common';
import { Body } from '@nestjs/common/decorators';
import { Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  AuthDto,
  SendVerificationEmailDto,
  SignupDto,
  VerifyEmailDto,
} from './dto';
import { Response } from 'express';

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

  @Get('signout')
  signout(@Res({ passthrough: true }) res: Response) {
    this.authService.removeTokenFromCookie(res);
    return {
      msg: 'Signed out successfully!',
    };
  }

  @Post('verifyEmail')
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto);
  }

  @Post('sendVerificationEmail')
  sendVerificationEmail(@Body() dto: SendVerificationEmailDto) {
    return this.authService.sendVerificationEmail(dto);
  }
}
