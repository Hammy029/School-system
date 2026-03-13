import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { GradingService } from './grading.service';
import { CreateGradingScaleDto } from './dto/create-grading-scale.dto';
import { UpdateGradingScaleDto } from './dto/update-grading-scale.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/roles.enum';

@Controller('grading')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GradingController {
  constructor(private readonly gradingService: GradingService) {}

  @Post()
  @Roles(Role.Admin, Role.SuperAdmin)
  create(@Body() dto: CreateGradingScaleDto) {
    return this.gradingService.create(dto);
  }

  @Get()
  findAll() {
    return this.gradingService.findAll();
  }

  @Get('default')
  findDefault() {
    return this.gradingService.findDefault();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gradingService.findOne(id);
  }

  @Put(':id')
  @Roles(Role.Admin, Role.SuperAdmin)
  update(@Param('id') id: string, @Body() dto: UpdateGradingScaleDto) {
    return this.gradingService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.Admin, Role.SuperAdmin)
  remove(@Param('id') id: string) {
    return this.gradingService.remove(id);
  }
}
