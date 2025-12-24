import { Controller, Get, Post, Body, UseGuards, Req, Headers, RawBodyRequest } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { TenantId } from '../common/decorators/tenant.decorator';
import { Plan } from '@prisma/client';

@Controller('subscription')
export class SubscriptionController {
  constructor(private subscriptionService: SubscriptionService) {}

  @Get()
  @UseGuards(JwtAuthGuard, TenantGuard)
  getSubscription(@TenantId() tenantId: string) {
    return this.subscriptionService.getSubscription(tenantId);
  }

  @Post('checkout')
  @UseGuards(JwtAuthGuard, TenantGuard)
  createCheckoutSession(@TenantId() tenantId: string, @Body('plan') plan: Plan) {
    return this.subscriptionService.createCheckoutSession(tenantId, plan);
  }

  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    return this.subscriptionService.handleWebhook(signature, req.rawBody as Buffer);
  }
}
