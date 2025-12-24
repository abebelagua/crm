import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    // Skip tenant extraction for public routes
    if (req.path.includes('/auth/register') || req.path.includes('/auth/login')) {
      return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return next();
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      return next();
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET'),
      });

      // Attach tenantId to request if user has one
      if (payload.tenantId) {
        req['tenantId'] = payload.tenantId;
      }
      if (payload.userId) {
        req['userId'] = payload.userId;
      }
      if (payload.role) {
        req['userRole'] = payload.role;
      }
    } catch (error) {
      // Token invalid, but continue (auth guard will handle it)
    }

    next();
  }
}

