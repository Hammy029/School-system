import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Payment, PaymentDocument } from './entities/payment.schema';
import { FeeStructure, FeeStructureDocument } from './entities/fee-structure.schema';
import { CreatePaymentDto, CreateFeeStructureDto } from './dto/create-payment.dto';
import { UpdatePaymentDto, UpdateFeeStructureDto } from './dto/update-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(FeeStructure.name) private feeModel: Model<FeeStructureDocument>,
  ) {}

  // ─── PAYMENTS ────────────────────────────────────────────────

  async createPayment(organizationId: string, branchId: string, dto: CreatePaymentDto, userId: string): Promise<PaymentDocument> {
    const status = dto.amountPaid >= dto.amount ? 'completed' : dto.amountPaid > 0 ? 'partial' : 'pending';
    return this.paymentModel.create({
      ...dto, organizationId, branchId,
      receivedBy: new Types.ObjectId(userId),
      paymentDate: dto.paymentDate || new Date(),
      status,
    } as any);
  }

  async findAllPayments(organizationId: string, branchId: string, filters: {
    studentId?: string; academicYear?: string; term?: string; feeType?: string; status?: string;
  }): Promise<PaymentDocument[]> {
    const query: any = { organizationId, branchId, isDeleted: false };
    if (filters.studentId) query.studentId = filters.studentId;
    if (filters.academicYear) query.academicYear = filters.academicYear;
    if (filters.term) query.term = filters.term;
    if (filters.feeType) query.feeType = filters.feeType;
    if (filters.status) query.status = filters.status;
    return this.paymentModel.find(query)
      .populate('studentId', 'firstName lastName admissionNumber')
      .populate('receivedBy', 'username')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOnePayment(id: string): Promise<PaymentDocument> {
    const doc = await this.paymentModel.findById(id)
      .populate('studentId', 'firstName lastName admissionNumber')
      .populate('receivedBy', 'username')
      .exec();
    if (!doc || doc.isDeleted) throw new NotFoundException('Payment not found');
    return doc;
  }

  async updatePayment(id: string, dto: UpdatePaymentDto): Promise<PaymentDocument> {
    const payment = await this.paymentModel.findById(id);
    if (!payment || payment.isDeleted) throw new NotFoundException('Payment not found');

    if (dto.amountPaid !== undefined && dto.amount !== undefined) {
      (dto as any).status = dto.amountPaid >= dto.amount ? 'completed' : dto.amountPaid > 0 ? 'partial' : 'pending';
    } else if (dto.amountPaid !== undefined) {
      (dto as any).status = dto.amountPaid >= payment.amount ? 'completed' : dto.amountPaid > 0 ? 'partial' : 'pending';
    }

    const doc = await this.paymentModel.findByIdAndUpdate(id, dto, { new: true })
      .populate('studentId', 'firstName lastName admissionNumber')
      .exec();
    if (!doc) throw new NotFoundException('Payment not found');
    return doc;
  }

  async removePayment(id: string): Promise<void> {
    const result = await this.paymentModel.findByIdAndUpdate(id, { isDeleted: true }, { new: true }).exec();
    if (!result) throw new NotFoundException('Payment not found');
  }

  async getStudentBalance(organizationId: string, branchId: string, studentId: string, academicYear: string, term: string): Promise<any> {
    const fees = await this.feeModel.find({
      organizationId, branchId, academicYear, term, isDeleted: false, isActive: true,
    } as any).exec();

    const payments = await this.paymentModel.find({
      organizationId, branchId, studentId, academicYear, term, isDeleted: false,
    } as any).exec();

    const totalFees = fees.reduce((sum, f) => sum + f.amount, 0);
    const totalPaid = payments.reduce((sum, p) => sum + p.amountPaid, 0);

    return { totalFees, totalPaid, balance: totalFees - totalPaid, payments, feeBreakdown: fees };
  }

  // ─── FEE STRUCTURE ──────────────────────────────────────────

  async createFeeStructure(organizationId: string, branchId: string, dto: CreateFeeStructureDto): Promise<FeeStructureDocument> {
    return this.feeModel.create({ ...dto, organizationId, branchId } as any);
  }

  async findAllFees(organizationId: string, branchId: string, academicYear?: string, term?: string): Promise<FeeStructureDocument[]> {
    const filter: any = { organizationId, branchId, isDeleted: false };
    if (academicYear) filter.academicYear = academicYear;
    if (term) filter.term = term;
    return this.feeModel.find(filter).populate('classId', 'name section').sort({ feeType: 1 }).exec();
  }

  async updateFeeStructure(id: string, dto: UpdateFeeStructureDto): Promise<FeeStructureDocument> {
    const doc = await this.feeModel.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!doc || doc.isDeleted) throw new NotFoundException('Fee structure not found');
    return doc;
  }

  async removeFeeStructure(id: string): Promise<void> {
    const result = await this.feeModel.findByIdAndUpdate(id, { isDeleted: true }, { new: true }).exec();
    if (!result) throw new NotFoundException('Fee structure not found');
  }
}
