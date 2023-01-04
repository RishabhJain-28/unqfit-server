import { ForbiddenException, Injectable, Res } from '@nestjs/common';
import { Get } from '@nestjs/common/decorators/http/request-mapping.decorator';
import { UnauthorizedException } from '@nestjs/common/exceptions';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt/dist';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import * as argon from 'argon2';
import { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
//! add email validation
//! add csrf and refresh tokens

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private jwt: JwtService,
  ) {}
  async signup(dto: AuthDto, res: Response) {
    const hash = await argon.hash(dto.password);
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
        },
      });
      delete user.hash;
      const { access_token } = await this.signToken(user.id, user.email);
      this.storeTokenInCookie(res, access_token);
      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials Taken');
        }
      }
      throw error;
    }
  }
  async signin(dto: AuthDto, res: Response) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (!user) {
      throw new UnauthorizedException('Credentials incorrect');
    }
    const pwMatches = await argon.verify(user.hash, dto.password);

    if (!pwMatches) {
      throw new UnauthorizedException('Credentials incorrect');
    }

    delete user.hash;
    const { access_token } = await this.signToken(user.id, user.email);
    this.storeTokenInCookie(res, access_token);
    return user;
  }

  private storeTokenInCookie(res: Response, token: string) {
    res.cookie('access_token', token, {
      //1000 * 60 * 60 *24*7
      maxAge: 1000 * 60 * 60 * 24 * 7, //! fix expiration time
      httpOnly: true,
    });
  }

  removeTokenFromCookie(res: Response) {
    res.cookie('access_token', '', { expires: new Date() });
  }

  private async signToken(userId: number, email: string) {
    const payload = {
      sub: userId,
      email,
    };
    const access_token = await this.jwt.signAsync(payload, {
      expiresIn: '7d',
      secret: this.config.get('JWT_SECRET'),
    }); //! fix expiration time
    return { access_token };
  }
}
