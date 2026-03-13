import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum BranchStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export enum BranchType {
  MAIN = 'main',
  BRANCH = 'branch',
}

@Schema({ timestamps: true })
export class OrganizationBranch {
  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    ref: 'Organization',
    index: true,
  })
  organizationId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({
    type: String,
    enum: BranchType,
    default: BranchType.BRANCH,
  })
  type: BranchType;

  @Prop({
    type: String,
    enum: BranchStatus,
    default: BranchStatus.ACTIVE,
  })
  status: BranchStatus;

  @Prop()
  phone: string;

  @Prop()
  email: string;

  @Prop()
  address: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
  })
  managerId: MongooseSchema.Types.ObjectId;

  @Prop({ type: Boolean, default: true })
  isOperational: boolean;

  @Prop({ type: Boolean, default: false })
  isMainBranch: boolean;

  @Prop({ default: false })
  isDeleted: boolean;
}

export type OrganizationBranchDocument = OrganizationBranch & Document;
export const OrganizationBranchSchema =
  SchemaFactory.createForClass(OrganizationBranch);

OrganizationBranchSchema.index({ organizationId: 1, name: 1 });
OrganizationBranchSchema.index({ organizationId: 1, status: 1 });
OrganizationBranchSchema.index({ organizationId: 1, isMainBranch: 1 });
OrganizationBranchSchema.index({ organizationId: 1, isDeleted: 1 });
