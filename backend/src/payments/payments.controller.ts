import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto, CreateFeeStructureDto } from './dto/create-payment.dto';
import { UpdatePaymentDto, UpdateFeeStructureDto } from './dto/update-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/roles.enum';

@Controller('organizations/:organizationId/branches/:branchId/payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // ─── PAYMENTS ────────────────────────────────────────────────

  @Post()
  @Roles(Role.Admin, Role.SuperAdmin)
  createPayment(
    @Param('organizationId') organizationId: string,
    @Param('branchId') branchId: string,
    @Body() dto: CreatePaymentDto,
    @Request() req: any,
  ) {
    return this.paymentsService.createPayment(organizationId, branchId, dto, req.user._id);
  }

  @Get()
  findAllPayments(
    @Param('organizationId') organizationId: string,
    @Param('branchId') branchId: string,
    @Query('studentId') studentId?: string,
    @Query('academicYear') academicYear?: string,
    @Query('term') term?: string,
    @Query('feeType') feeType?: string,
    @Query('status') status?: string,
  ) {
    return this.paymentsService.findAllPayments(organizationId, branchId, { studentId, academicYear, term, feeType, status });
  }

  @Get('balance/:studentId')
  getBalance(
    @Param('organizationId') organizationId: string,
    @Param('branchId') branchId: string,
    @Param('studentId') studentId: string,
    @Query('academicYear') academicYear: string,
    @Query('term') term: string,
  ) {
    return this.paymentsService.getStudentBalance(organizationId, branchId, studentId, academicYear, term);
  }

  @Get(':id')
  findOnePayment(@Param('id') id: string) {
    return this.paymentsService.findOnePayment(id);
  }

  @Put(':id')
  @Roles(Role.Admin, Role.SuperAdmin)
  updatePayment(@Param('id') id: string, @Body() dto: UpdatePaymentDto) {
    return this.paymentsService.updatePayment(id, dto);
  }

  @Delete(':id')
  @Roles(Role.Admin, Role.SuperAdmin)
  removePayment(@Param('id') id: string) {
    return this.paymentsService.removePayment(id);
  }

  // ─── FEE STRUCTURE ──────────────────────────────────────────

  @Post('fees')
  @Roles(Role.Admin, Role.SuperAdmin)
  createFee(
    @Param('organizationId') organizationId: string,
    @Param('branchId') branchId: string,
    @Body() dto: CreateFeeStructureDto,
  ) {
    return this.paymentsService.createFeeStructure(organizationId, branchId, dto);
  }

  @Get('fees/all')
  findAllFees(
    @Param('organizationId') organizationId: string,
    @Param('branchId') branchId: string,
    @Query('academicYear') academicYear?: string,
    @Query('term') term?: string,
  ) {
    return this.paymentsService.findAllFees(organizationId, branchId, academicYear, term);
  }

  @Put('fees/:id')
  @Roles(Role.Admin, Role.SuperAdmin)
  updateFee(@Param('id') id: string, @Body() dto: UpdateFeeStructureDto) {
    return this.paymentsService.updateFeeStructure(id, dto);
  }

  @Delete('fees/:id')
  @Roles(Role.Admin, Role.SuperAdmin)
  removeFee(@Param('id') id: string) {
    return this.paymentsService.removeFeeStructure(id);
  }
}
