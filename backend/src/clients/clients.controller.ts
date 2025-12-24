import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { TenantId } from '../common/decorators/tenant.decorator';
import { ClientStatus } from '@prisma/client';

@Controller('clients')
@UseGuards(JwtAuthGuard, TenantGuard)
export class ClientsController {
  constructor(private clientsService: ClientsService) {}

  @Post()
  create(@Body() createClientDto: CreateClientDto, @TenantId() tenantId: string) {
    return this.clientsService.create(createClientDto, tenantId);
  }

  @Get()
  findAll(
    @TenantId() tenantId: string,
    @Query('status') status?: ClientStatus,
    @Query('search') search?: string,
  ) {
    return this.clientsService.findAll(tenantId, status, search);
  }

  @Get('stats')
  getStats(@TenantId() tenantId: string) {
    return this.clientsService.getStats(tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.clientsService.findOne(id, tenantId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateClientDto: UpdateClientDto, @TenantId() tenantId: string) {
    return this.clientsService.update(id, updateClientDto, tenantId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.clientsService.remove(id, tenantId);
  }
}

