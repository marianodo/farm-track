import { PartialType } from '@nestjs/mapped-types';
import { LoginAuthDto } from './login-auth.dto';
import {
  IsString,
  IsOptional,
  Length,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
} from 'class-validator';

enum Role {
  GUEST = 'guest',
  USER = 'user',
  ADMIN = 'admin',
}

export class RegisterAuthDto extends PartialType(LoginAuthDto) {
  @IsNotEmpty()
  @IsString()
  @Length(3, 50)
  username: string;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  verification_token?: string;

  @IsOptional()
  @IsBoolean()
  is_verified?: boolean;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
