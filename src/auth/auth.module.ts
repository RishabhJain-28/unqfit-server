import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategy';

@Module({
  imports: [
    UserModule,
    PassportModule.register({
      session: false,
    }),
    JwtModule.register({
      signOptions: { expiresIn: '7d' }, //! impelment refresh tokens
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
