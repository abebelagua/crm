import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { Plan } from '@prisma/client';

@Injectable()
export class SubscriptionService {
  private stripe: Stripe;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });
  }

  async getSubscription(tenantId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return subscription;
  }

  async createCheckoutSession(tenantId: string, plan: Plan) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // Create or get Stripe customer
    let stripeCustomerId = tenant.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await this.stripe.customers.create({
        email: tenant.name, // In real app, use tenant admin email
        metadata: { tenantId },
      });

      stripeCustomerId = customer.id;

      await this.prisma.tenant.update({
        where: { id: tenantId },
        data: { stripeCustomerId },
      });
    }

    // Create checkout session
    const session = await this.stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${plan} Plan`,
            },
            unit_amount: plan === Plan.PRO ? 2900 : 0, // $29 for PRO, $0 for FREE
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${this.configService.get('CORS_ORIGIN')}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${this.configService.get('CORS_ORIGIN')}/subscription/cancel`,
      metadata: {
        tenantId,
        plan,
      },
    });

    return { sessionId: session.id, url: session.url };
  }

  async handleWebhook(signature: string, body: Buffer) {
    const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(body, signature, webhookSecret || '');
    } catch (err) {
      throw new Error(`Webhook signature verification failed: ${err}`);
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await this.handleCheckoutCompleted(session);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await this.handleSubscriptionUpdated(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await this.handleSubscriptionDeleted(subscription);
        break;
      }
    }

    return { received: true };
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const tenantId = session.metadata?.tenantId;
    const plan = session.metadata?.plan as Plan;

    if (!tenantId || !plan) {
      return;
    }

    const subscriptionId = session.subscription as string;

    // Update tenant plan
    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: { plan },
    });

    // Create or update subscription
    const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);

    await this.prisma.subscription.upsert({
      where: { stripeSubscriptionId: subscriptionId },
      update: {
        plan,
        status: this.mapStripeStatus(subscription.status),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
      create: {
        plan,
        status: this.mapStripeStatus(subscription.status),
        stripeSubscriptionId: subscriptionId,
        tenantId,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
    });
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    const existingSubscription = await this.prisma.subscription.findUnique({
      where: { stripeSubscriptionId: subscription.id },
    });

    if (!existingSubscription) {
      return;
    }

    const plan = subscription.items.data[0]?.price?.unit_amount === 0 ? Plan.FREE : Plan.PRO;

    await this.prisma.subscription.update({
      where: { id: existingSubscription.id },
      data: {
        plan,
        status: this.mapStripeStatus(subscription.status),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
    });

    await this.prisma.tenant.update({
      where: { id: existingSubscription.tenantId },
      data: { plan },
    });
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const existingSubscription = await this.prisma.subscription.findUnique({
      where: { stripeSubscriptionId: subscription.id },
    });

    if (!existingSubscription) {
      return;
    }

    await this.prisma.subscription.update({
      where: { id: existingSubscription.id },
      data: {
        status: 'CANCELLED',
      },
    });

    await this.prisma.tenant.update({
      where: { id: existingSubscription.tenantId },
      data: { plan: Plan.FREE },
    });
  }

  private mapStripeStatus(status: Stripe.Subscription.Status): 'ACTIVE' | 'CANCELLED' | 'PAST_DUE' {
    switch (status) {
      case 'active':
        return 'ACTIVE';
      case 'canceled':
      case 'unpaid':
        return 'CANCELLED';
      case 'past_due':
        return 'PAST_DUE';
      default:
        return 'ACTIVE';
    }
  }
}

