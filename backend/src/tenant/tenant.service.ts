import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { Plan } from '@prisma/client';

@Injectable()
export class TenantService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.tenant.findMany({
      include: {
        _count: {
          select: {
            users: true,
            clients: true,
          },
        },
      },
    });
  }

  async findOne(id: string, userRole: string, userTenantId?: string) {
    // Super admin can access any tenant
    if (userRole === 'SUPER_ADMIN') {
      return this.prisma.tenant.findUnique({
        where: { id },
        include: {
          users: {
            select: {
              id: true,
              email: true,
              role: true,
              createdAt: true,
            },
          },
          _count: {
            select: {
              clients: true,
            },
          },
        },
      });
    }

    // Other users can only access their own tenant
    if (userTenantId !== id) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.tenant.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            clients: true,
          },
        },
      },
    });
  }

  async update(id: string, updateTenantDto: UpdateTenantDto, userRole: string, userTenantId?: string) {
    // Check access
    if (userRole !== 'SUPER_ADMIN' && userTenantId !== id) {
      throw new ForbiddenException('Access denied');
    }

    const tenant = await this.prisma.tenant.findUnique({ where: { id } });
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return this.prisma.tenant.update({
      where: { id },
      data: updateTenantDto,
    });
  }

  async activate(id: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id } });
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return this.prisma.tenant.update({
      where: { id },
      data: { isActive: true },
    });
  }

  async deactivate(id: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id } });
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return this.prisma.tenant.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async updatePlan(id: string, plan: Plan) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id } });
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return this.prisma.tenant.update({
      where: { id },
      data: { plan },
    });
  }
}

