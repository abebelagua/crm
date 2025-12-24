import { IsEmail, IsString, MinLength, IsEnum, IsUUID, IsNotEmpty } from 'class-validator';
import { UserRole } from '@prisma/client';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsUUID()
  @IsNotEmpty()
  tenantId: string;
}

