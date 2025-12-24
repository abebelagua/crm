import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto, userRole: string, userTenantId?: string) {
    // Only COMPANY_ADMIN and SUPER_ADMIN can create users
    if (userRole !== 'COMPANY_ADMIN' && userRole !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Insufficient permissions');
    }

    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // If not super admin, users must be in the same tenant
    if (userRole !== 'SUPER_ADMIN' && createUserDto.tenantId !== userTenantId) {
      throw new ForbiddenException('Cannot create user for different tenant');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    return this.prisma.user.create({
      data: {
        email: createUserDto.email,
        password: hashedPassword,
        role: createUserDto.role,
        tenantId: createUserDto.tenantId,
      },
      select: {
        id: true,
        email: true,
        role: true,
        tenantId: true,
        createdAt: true,
      },
    });
  }

  async findAll(userRole: string, userTenantId?: string) {
    // Super admin can see all users
    if (userRole === 'SUPER_ADMIN') {
      return this.prisma.user.findMany({
        select: {
          id: true,
          email: true,
          role: true,
          tenantId: true,
          createdAt: true,
        },
      });
    }

    // Others can only see users in their tenant
    return this.prisma.user.findMany({
      where: { tenantId: userTenantId },
      select: {
        id: true,
        email: true,
        role: true,
        tenantId: true,
        createdAt: true,
      },
    });
  }

  async findOne(id: string, userRole: string, userTenantId?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        tenantId: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check access
    if (userRole !== 'SUPER_ADMIN' && user.tenantId !== userTenantId) {
      throw new ForbiddenException('Access denied');
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto, userRole: string, userTenantId?: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check access
    if (userRole !== 'SUPER_ADMIN' && user.tenantId !== userTenantId) {
      throw new ForbiddenException('Access denied');
    }

    const updateData: any = {};

    if (updateUserDto.email) {
      // Check if email is already taken
      const existingUser = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });

      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Email already in use');
      }

      updateData.email = updateUserDto.email;
    }

    if (updateUserDto.password) {
      updateData.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    if (updateUserDto.role) {
      updateData.role = updateUserDto.role;
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        role: true,
        tenantId: true,
        createdAt: true,
      },
    });
  }

  async remove(id: string, userRole: string, userTenantId?: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check access
    if (userRole !== 'SUPER_ADMIN' && user.tenantId !== userTenantId) {
      throw new ForbiddenException('Access denied');
    }

    // Prevent deleting yourself
    // This would need the current user ID, but for now we'll allow it

    return this.prisma.user.delete({
      where: { id },
    });
  }
}

