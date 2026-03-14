import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ApprovalDocument = Approval & Document;

@Schema({ _id: false })
export class ApprovalStep {
  @Prop({ required: true, enum: ['teacher', 'hod', 'deputy', 'principal', 'admin'] })
  role!: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: false })
  approvedBy?: MongooseSchema.Types.ObjectId;

  @Prop({ enum: ['pending', 'approved', 'rejected'], default: 'pending' })
  status!: string;

  @Prop({ required: false })
  comment?: string;

  @Prop({ required: false })
  actionDate?: Date;
}

export const ApprovalStepSchema = SchemaFactory.createForClass(ApprovalStep);

@Schema()
export class Approval {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Organization', index: true })
  organizationId!: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'OrganizationBranch', index: true })
  branchId!: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, enum: ['results', 'report', 'fee_waiver', 'student_transfer', 'other'] })
  type!: string;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: false })
  description?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  submittedBy!: MongooseSchema.Types.ObjectId;

  @Prop({ type: Object, required: false })
  metadata?: Record<string, any>;

  @Prop({ type: [ApprovalStepSchema], default: [] })
  steps!: ApprovalStep[];

  @Prop({ required: true, default: 0 })
  currentStep!: number;

  @Prop({ enum: ['pending', 'in_progress', 'approved', 'rejected'], default: 'pending' })
  status!: string;

  @Prop({ default: false })
  isDeleted?: boolean;
}

export const ApprovalSchema = SchemaFactory.createForClass(Approval);
ApprovalSchema.set('timestamps', true);
ApprovalSchema.index({ organizationId: 1, branchId: 1, status: 1 });
