import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Request, Patch } from '@nestjs/common';
import { ApprovalsService } from './approvals.service';
import { CreateApprovalDto, ApproveRejectDto } from './dto/create-approval.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/roles.enum';

@Controller('organizations/:organizationId/branches/:branchId/approvals')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ApprovalsController {
  constructor(private readonly approvalsService: ApprovalsService) {}

  @Post()
  @Roles(Role.Admin, Role.SuperAdmin, Role.Teacher)
  create(
    @Param('organizationId') organizationId: string,
    @Param('branchId') branchId: string,
    @Body() dto: CreateApprovalDto,
    @Request() req: any,
  ) {
    return this.approvalsService.create(organizationId, branchId, req.user._id, dto);
  }

  @Get()
  findAll(
    @Param('organizationId') organizationId: string,
    @Param('branchId') branchId: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
  ) {
    return this.approvalsService.findAll(organizationId, branchId, { type, status });
  }

  @Get('pending')
  findPending(
    @Param('organizationId') organizationId: string,
    @Param('branchId') branchId: string,
    @Request() req: any,
  ) {
    return this.approvalsService.findPendingForUser(organizationId, branchId, req.user.role);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.approvalsService.findOne(id);
  }

  @Patch(':id/process')
  @Roles(Role.Admin, Role.SuperAdmin, Role.Teacher)
  processStep(
    @Param('id') id: string,
    @Body() dto: ApproveRejectDto,
    @Request() req: any,
  ) {
    return this.approvalsService.processStep(id, req.user._id, dto);
  }

  @Delete(':id')
  @Roles(Role.Admin, Role.SuperAdmin)
  remove(@Param('id') id: string) {
    return this.approvalsService.remove(id);
  }
}
