import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/roles.enum';

@Controller('organizations/:organizationId/branches/:branchId/students')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @Roles(Role.Admin, Role.SuperAdmin, Role.Teacher)
  create(
    @Param('organizationId') organizationId: string,
    @Param('branchId') branchId: string,
    @Body() dto: CreateStudentDto,
  ) {
    return this.studentsService.create(organizationId, branchId, dto);
  }

  @Get()
  findAll(
    @Param('organizationId') organizationId: string,
    @Param('branchId') branchId: string,
    @Query('classId') classId?: string,
    @Query('search') search?: string,
  ) {
    return this.studentsService.findAll(organizationId, branchId, classId, search);
  }

  @Get('count')
  count(
    @Param('organizationId') organizationId: string,
    @Param('branchId') branchId: string,
    @Query('classId') classId?: string,
  ) {
    return this.studentsService.count(organizationId, branchId, classId);
  }

  @Get('by-class/:classId')
  findByClass(
    @Param('organizationId') organizationId: string,
    @Param('branchId') branchId: string,
    @Param('classId') classId: string,
  ) {
    return this.studentsService.findByClass(organizationId, branchId, classId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.studentsService.findOne(id);
  }

  @Put(':id')
  @Roles(Role.Admin, Role.SuperAdmin, Role.Teacher)
  update(@Param('id') id: string, @Body() dto: UpdateStudentDto) {
    return this.studentsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.Admin, Role.SuperAdmin)
  remove(@Param('id') id: string) {
    return this.studentsService.remove(id);
  }
}
