import { IsString, IsEmail, IsOptional, IsEnum } from 'class-validator';
import { ClientStatus } from '@prisma/client';

export class UpdateClientDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEnum(ClientStatus)
  @IsOptional()
  status?: ClientStatus;
}

