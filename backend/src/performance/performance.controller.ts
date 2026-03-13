import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { PerformanceService } from './performance.service';
import { CreatePerformanceDto } from './dto/create-performance.dto';
import { UpdatePerformanceDto, BulkPerformanceDto } from './dto/update-performance.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/roles.enum';

@Controller('organizations/:organizationId/branches/:branchId/performance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  @Post()
  @Roles(Role.Admin, Role.SuperAdmin, Role.Teacher)
  create(
    @Param('organizationId') organizationId: string,
    @Param('branchId') branchId: string,
    @Body() dto: CreatePerformanceDto,
  ) {
    return this.performanceService.create(organizationId, branchId, dto);
  }

  @Post('bulk')
  @Roles(Role.Admin, Role.SuperAdmin, Role.Teacher)
  bulkCreate(
    @Param('organizationId') organizationId: string,
    @Param('branchId') branchId: string,
    @Body() dto: BulkPerformanceDto,
  ) {
    return this.performanceService.bulkCreate(organizationId, branchId, dto);
  }

  @Get()
  findAll(
    @Param('organizationId') organizationId: string,
    @Param('branchId') branchId: string,
    @Query('classId') classId?: string,
    @Query('studentId') studentId?: string,
    @Query('subjectId') subjectId?: string,
    @Query('academicYear') academicYear?: string,
    @Query('term') term?: string,
    @Query('examType') examType?: string,
  ) {
    return this.performanceService.findAll(organizationId, branchId, { classId, studentId, subjectId, academicYear, term, examType });
  }

  @Get('stats')
  getStats(
    @Param('organizationId') organizationId: string,
    @Param('branchId') branchId: string,
  ) {
    return this.performanceService.getPerformanceStats(organizationId, branchId);
  }

  @Get('report/student/:studentId')
  getStudentReport(
    @Param('organizationId') organizationId: string,
    @Param('branchId') branchId: string,
    @Param('studentId') studentId: string,
    @Query('academicYear') academicYear: string,
    @Query('term') term: string,
  ) {
    return this.performanceService.getStudentReport(organizationId, branchId, studentId, academicYear, term);
  }

  @Get('report/class/:classId')
  getClassReport(
    @Param('organizationId') organizationId: string,
    @Param('branchId') branchId: string,
    @Param('classId') classId: string,
    @Query('academicYear') academicYear: string,
    @Query('term') term: string,
  ) {
    return this.performanceService.getClassReport(organizationId, branchId, classId, academicYear, term);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.performanceService.findOne(id);
  }

  @Put(':id')
  @Roles(Role.Admin, Role.SuperAdmin, Role.Teacher)
  update(@Param('id') id: string, @Body() dto: UpdatePerformanceDto) {
    return this.performanceService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.Admin, Role.SuperAdmin)
  remove(@Param('id') id: string) {
    return this.performanceService.remove(id);
  }
}
