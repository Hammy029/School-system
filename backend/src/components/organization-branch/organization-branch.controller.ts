import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { OrganizationBranchService } from './organization-branch.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../auth/roles.enum';

@Controller('organizations/:organizationId/branches')
export class OrganizationBranchController {
  constructor(private readonly branchService: OrganizationBranchService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SuperAdmin)
  async create(
    @Param('organizationId') organizationId: string,
    @Body() createDto: CreateBranchDto,
  ) {
    return this.branchService.create(organizationId, createDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Param('organizationId') organizationId: string) {
    return this.branchService.findByOrganization(organizationId);
  }

  @Get('active')
  @UseGuards(JwtAuthGuard)
  async findActive(@Param('organizationId') organizationId: string) {
    return this.branchService.findActiveByOrganization(organizationId);
  }

  @Get('main')
  @UseGuards(JwtAuthGuard)
  async findMain(@Param('organizationId') organizationId: string) {
    return this.branchService.findMainBranch(organizationId);
  }

  @Get(':branchId')
  @UseGuards(JwtAuthGuard)
  async findById(@Param('branchId') branchId: string) {
    return this.branchService.findById(branchId);
  }

  @Put(':branchId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SuperAdmin, Role.Admin)
  async update(
    @Param('organizationId') organizationId: string,
    @Param('branchId') branchId: string,
    @Body() updateDto: UpdateBranchDto,
  ) {
    return this.branchService.update(organizationId, branchId, updateDto);
  }

  @Put(':branchId/set-main')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SuperAdmin)
  async setMain(
    @Param('organizationId') organizationId: string,
    @Param('branchId') branchId: string,
  ) {
    return this.branchService.setMainBranch(organizationId, branchId);
  }

  @Put(':branchId/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SuperAdmin, Role.Admin)
  async updateStatus(
    @Param('organizationId') organizationId: string,
    @Param('branchId') branchId: string,
    @Body() body: { status: string },
  ) {
    return this.branchService.updateStatus(
      organizationId,
      branchId,
      body.status,
    );
  }

  @Delete(':branchId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SuperAdmin)
  async delete(
    @Param('organizationId') organizationId: string,
    @Param('branchId') branchId: string,
  ) {
    return this.branchService.delete(organizationId, branchId);
  }
}
