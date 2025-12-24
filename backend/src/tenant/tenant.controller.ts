import { Controller, Get, Patch, Param, Body, UseGuards, Delete } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole, Plan } from '@prisma/client';

@Controller('tenant')
@UseGuards(JwtAuthGuard)
export class TenantController {
  constructor(private tenantService: TenantService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  findAll() {
    return this.tenantService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.tenantService.findOne(id, user.role, user.tenantId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTenantDto: UpdateTenantDto,
    @CurrentUser() user: any,
  ) {
    return this.tenantService.update(id, updateTenantDto, user.role, user.tenantId);
  }

  @Patch(':id/activate')
  @Roles(UserRole.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  activate(@Param('id') id: string) {
    return this.tenantService.activate(id);
  }

  @Patch(':id/deactivate')
  @Roles(UserRole.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  deactivate(@Param('id') id: string) {
    return this.tenantService.deactivate(id);
  }

  @Patch(':id/plan')
  @Roles(UserRole.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  updatePlan(@Param('id') id: string, @Body('plan') plan: Plan) {
    return this.tenantService.updatePlan(id, plan);
  }
}

