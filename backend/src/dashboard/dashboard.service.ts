import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getMetrics(tenantId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Total clients
    const totalClients = await this.prisma.client.count({
      where: { tenantId },
    });

    // Active clients
    const activeClients = await this.prisma.client.count({
      where: { tenantId, status: 'ACTIVE' },
    });

    // New clients this month
    const newClientsThisMonth = await this.prisma.client.count({
      where: {
        tenantId,
        createdAt: { gte: startOfMonth },
      },
    });

    // New clients last month
    const newClientsLastMonth = await this.prisma.client.count({
      where: {
        tenantId,
        createdAt: {
          gte: startOfLastMonth,
          lte: endOfLastMonth,
        },
      },
    });

    // Calculate growth
    const growth = newClientsLastMonth > 0
      ? ((newClientsThisMonth - newClientsLastMonth) / newClientsLastMonth) * 100
      : newClientsThisMonth > 0 ? 100 : 0;

    // Clients by status
    const clientsByStatus = await this.prisma.client.groupBy({
      by: ['status'],
      where: { tenantId },
      _count: true,
    });

    // Monthly growth data (last 6 months)
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const count = await this.prisma.client.count({
        where: {
          tenantId,
          createdAt: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      });

      monthlyData.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        count,
      });
    }

    return {
      totalClients,
      activeClients,
      newClientsThisMonth,
      growth: Math.round(growth * 100) / 100,
      clientsByStatus: clientsByStatus.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {} as Record<string, number>),
      monthlyGrowth: monthlyData,
    };
  }
}

