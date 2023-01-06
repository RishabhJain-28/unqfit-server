import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
export class AuthDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    //! check this regex
    message: 'password too weak',
  })
  password: string;
}

export class SignupDto extends AuthDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(256)
  name: string;
}
export class SendVerificationEmailDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
export class VerifyEmailDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsString()
  token: string;
}
