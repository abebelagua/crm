import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Super admin can access without tenant
    if (user?.role === UserRole.SUPER_ADMIN) {
      return true;
    }

    // Other users must have a tenant
    if (!user?.tenantId) {
      throw new ForbiddenException('Tenant access required');
    }

    request.tenantId = user.tenantId;
    return true;
  }
}

