import { IsString, IsEmail, Length, IsNotEmpty } from 'class-validator';

export class LoginAuthDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @Length(4, 20)
  password: string;
}
