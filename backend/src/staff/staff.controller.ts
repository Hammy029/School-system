import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { StaffService } from './staff.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/roles.enum';

@Controller('organizations/:organizationId/branches/:branchId/staff')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Post()
  @Roles(Role.Admin, Role.SuperAdmin)
  create(
    @Param('organizationId') organizationId: string,
    @Param('branchId') branchId: string,
    @Body() dto: CreateStaffDto,
  ) {
    return this.staffService.create(organizationId, branchId, dto);
  }

  @Get()
  findAll(
    @Param('organizationId') organizationId: string,
    @Param('branchId') branchId: string,
    @Query('staffType') staffType?: string,
    @Query('search') search?: string,
  ) {
    return this.staffService.findAll(organizationId, branchId, staffType, search);
  }

  @Get('teachers')
  findTeachers(
    @Param('organizationId') organizationId: string,
    @Param('branchId') branchId: string,
  ) {
    return this.staffService.findTeachers(organizationId, branchId);
  }

  @Get('count')
  count(
    @Param('organizationId') organizationId: string,
    @Param('branchId') branchId: string,
  ) {
    return this.staffService.count(organizationId, branchId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.staffService.findOne(id);
  }

  @Put(':id')
  @Roles(Role.Admin, Role.SuperAdmin)
  update(@Param('id') id: string, @Body() dto: UpdateStaffDto) {
    return this.staffService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.Admin, Role.SuperAdmin)
  remove(@Param('id') id: string) {
    return this.staffService.remove(id);
  }
}
