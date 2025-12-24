import { IsString, IsEmail, IsOptional, IsEnum } from 'class-validator';
import { ClientStatus } from '@prisma/client';

export class CreateClientDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEnum(ClientStatus)
  @IsOptional()
  status?: ClientStatus;
}

