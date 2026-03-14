import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { TimetableService } from './timetable.service';
import { CreateTimetableDto } from './dto/create-timetable.dto';
import { UpdateTimetableDto } from './dto/update-timetable.dto';
import { GenerateTimetableDto } from './dto/generate-timetable.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/roles.enum';

@Controller('organizations/:organizationId/branches/:branchId/timetable')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TimetableController {
  constructor(private readonly timetableService: TimetableService) {}

  @Post()
  @Roles(Role.Admin, Role.SuperAdmin)
  create(
    @Param('organizationId') organizationId: string,
    @Param('branchId') branchId: string,
    @Body() dto: CreateTimetableDto,
  ) {
    return this.timetableService.create(organizationId, branchId, dto);
  }

  @Post('generate')
  @Roles(Role.Admin, Role.SuperAdmin)
  generate(
    @Param('organizationId') organizationId: string,
    @Param('branchId') branchId: string,
    @Body() dto: GenerateTimetableDto,
  ) {
    return this.timetableService.generate(organizationId, branchId, dto);
  }

  @Get()
  findAll(
    @Param('organizationId') organizationId: string,
    @Param('branchId') branchId: string,
    @Query('classId') classId?: string,
    @Query('academicYear') academicYear?: string,
    @Query('term') term?: string,
  ) {
    return this.timetableService.findAll(organizationId, branchId, classId, academicYear, term);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.timetableService.findOne(id);
  }

  @Put(':id')
  @Roles(Role.Admin, Role.SuperAdmin)
  update(@Param('id') id: string, @Body() dto: UpdateTimetableDto) {
    return this.timetableService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.Admin, Role.SuperAdmin)
  remove(@Param('id') id: string) {
    return this.timetableService.remove(id);
  }
}
