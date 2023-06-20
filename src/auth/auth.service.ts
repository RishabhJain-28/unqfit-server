import { ForbiddenException, Injectable } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common/exceptions';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import * as argon from 'argon2';
import { Response } from 'express';

import { MailerService } from '../mailer/mailer.service';
import { verifyEmailTemplate } from '../mailer/mailTemplates';
import { PrismaService } from '../prisma/prisma.service';
import {
  AuthDto,
  SendVerificationEmailDto,
  SignupDto,
  VerifyEmailDto,
} from './dto';
import { generate as generateRandToken } from 'rand-token';
import { durationFromNow } from '../util/helpers/durationFromNow';
import { Prisma } from '@prisma/client';
//! add email validation
//! add csrf and refresh tokens
const MINS_15 = 60 * 1000;

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private jwt: JwtService,
    private mailerService: MailerService,
  ) {}
  async sendVerificationEmail(dto: SendVerificationEmailDto) {
    let verification = await this.prisma.verifyEmail.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (verification && verification.isVerified) {
      return {
        message: 'Email already verified',
        isVerified: true,
      };
    }
    const token = generateRandToken(16);
    const tokenHash = await argon.hash(token);

    if (!verification) {
      verification = await this.prisma.verifyEmail.create({
        data: {
          email: dto.email,
          tokenHash,
        },
      });
    } else {
      verification = await this.prisma.verifyEmail.update({
        where: {
          email: dto.email,
        },
        data: {
          email: dto.email,
          tokenHash,
        },
      });
    }

    this.mailerService.sendMail({
      to: dto.email,
      html: verifyEmailTemplate.email(
        `${this.config.get('CLIENT_DOMAIN')}/auth/verifyEmail?email=${
          dto.email
        }&token=${token}`,
      ),
      subject: verifyEmailTemplate.subject(),
    }); //! add logs
    //! and failure handle ?

    return {
      message: 'Verification email sent',
      isVerified: false,
    };
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const verification = await this.prisma.verifyEmail.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (!verification || durationFromNow(verification.updated_at) > MINS_15) {
      throw new UnauthorizedException('Email invalid');
    }
    if (verification.isVerified) {
      return {
        message: 'Email verified',
        isVerified: true,
      };
    }
    const isTokenValid = await argon.verify(verification.tokenHash, dto.token);
    if (!isTokenValid) {
      throw new UnauthorizedException('Invalid Token');
    }
    await this.prisma.verifyEmail.update({
      where: {
        email: verification.email,
      },
      data: {
        isVerified: true,
        tokenHash: '',
      },
    });

    return {
      message: 'Email verified',
      isVerified: true,
    };
  }

  async signup(dto: SignupDto, res: Response) {
    const hash = await argon.hash(dto.password);
    try {
      const verification = await this.prisma.verifyEmail.findUnique({
        where: { email: dto.email },
      });
      if (!verification || verification.isVerified === false) {
        throw new ForbiddenException('Email not verified');
      }
      if (durationFromNow(verification.updated_at) > MINS_15) {
        throw new ForbiddenException('Verification expired');
      }
      //! delete validation

      const user = await this.prisma.user.create({
        data: {
          name: dto.name,
          email: verification.email,
          hash,
        },
      });
      delete user.hash;
      const { access_token } = await this.signToken(user.id, user.email);

      this.storeTokenInCookie(res, access_token);

      return user;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
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
