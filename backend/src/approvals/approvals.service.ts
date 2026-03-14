import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Approval, ApprovalDocument } from './entities/approval.schema';
import { CreateApprovalDto, ApproveRejectDto } from './dto/create-approval.dto';

@Injectable()
export class ApprovalsService {
  constructor(@InjectModel(Approval.name) private approvalModel: Model<ApprovalDocument>) {}

  async create(organizationId: string, branchId: string, userId: string, dto: CreateApprovalDto): Promise<ApprovalDocument> {
    const steps = dto.steps.map(s => ({ role: s.role, status: 'pending' }));
    return this.approvalModel.create({
      ...dto, organizationId, branchId,
      submittedBy: new Types.ObjectId(userId),
      steps, currentStep: 0, status: 'pending',
    } as any);
  }

  async findAll(organizationId: string, branchId: string, filters: {
    type?: string; status?: string; submittedBy?: string;
  }): Promise<ApprovalDocument[]> {
    const query: any = { organizationId, branchId, isDeleted: false };
    if (filters.type) query.type = filters.type;
    if (filters.status) query.status = filters.status;
    if (filters.submittedBy) query.submittedBy = filters.submittedBy;
    return this.approvalModel.find(query)
      .populate('submittedBy', 'username email role')
      .populate('steps.approvedBy', 'username email role')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findPendingForUser(organizationId: string, branchId: string, userRole: string): Promise<ApprovalDocument[]> {
    const roleMapping: Record<string, string> = {
      teacher: 'teacher', admin: 'admin', super_admin: 'principal',
    };
    const approvalRole = roleMapping[userRole] || userRole;

    const all = await this.approvalModel.find({
      organizationId, branchId, isDeleted: false,
      status: { $in: ['pending', 'in_progress'] },
    } as any)
      .populate('submittedBy', 'username email role')
      .populate('steps.approvedBy', 'username email role')
      .sort({ createdAt: -1 })
      .exec();

    return all.filter(a => {
      if (a.currentStep >= a.steps.length) return false;
      return a.steps[a.currentStep].role === approvalRole;
    });
  }

  async findOne(id: string): Promise<ApprovalDocument> {
    const doc = await this.approvalModel.findById(id)
      .populate('submittedBy', 'username email role')
      .populate('steps.approvedBy', 'username email role')
      .exec();
    if (!doc || doc.isDeleted) throw new NotFoundException('Approval not found');
    return doc;
  }

  async processStep(id: string, userId: string, dto: ApproveRejectDto): Promise<ApprovalDocument> {
    const approval = await this.approvalModel.findById(id);
    if (!approval || approval.isDeleted) throw new NotFoundException('Approval not found');
    if (approval.status === 'approved' || approval.status === 'rejected') {
      throw new BadRequestException('This approval has already been finalized');
    }
    if (approval.currentStep >= approval.steps.length) {
      throw new BadRequestException('No more steps to process');
    }

    const step = approval.steps[approval.currentStep];
    step.status = dto.action;
    step.approvedBy = new Types.ObjectId(userId) as any;
    step.comment = dto.comment;
    step.actionDate = new Date();

    if (dto.action === 'rejected') {
      approval.status = 'rejected';
    } else if (approval.currentStep + 1 >= approval.steps.length) {
      approval.status = 'approved';
    } else {
      approval.currentStep += 1;
      approval.status = 'in_progress';
    }

    await approval.save();
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.approvalModel.findByIdAndUpdate(id, { isDeleted: true }, { new: true }).exec();
    if (!result) throw new NotFoundException('Approval not found');
  }
}
