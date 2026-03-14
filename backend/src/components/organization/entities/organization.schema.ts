import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum SubscriptionStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DECLINED = 'declined',
  EXPIRED = 'expired',
}

export enum Package {
  BASIC = 'basic',
  STANDARD = 'standard',
  PREMIUM = 'premium',
}

@Schema({ timestamps: true })
export class Organization {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  org_code: string;

  @Prop()
  phone: string;

  @Prop()
  email: string;

  @Prop()
  address: string;

  @Prop({ type: Object })
  location: Record<string, any>;

  @Prop({ type: Date })
  expiry_date: Date;

  @Prop({
    type: String,
    enum: SubscriptionStatus,
    default: SubscriptionStatus.PENDING,
  })
  subscriptionStatus: SubscriptionStatus;

  @Prop({
    type: String,
    enum: Package,
    default: Package.BASIC,
  })
  package: Package;

  @Prop({ type: Boolean, default: false })
  hasMultipleBranches: boolean;

  @Prop({ type: Number, default: 1 })
  maxBranches: number;

  @Prop({ type: Number, default: 0 })
  activeBranchesCount: number;

  @Prop({ type: Boolean, default: false })
  allowSelfRegistration: boolean;

  @Prop({ default: false })
  isDeleted: boolean;
}

export type OrganizationDocument = Organization & Document;
export const OrganizationSchema = SchemaFactory.createForClass(Organization);

OrganizationSchema.index({ subscriptionStatus: 1 });
OrganizationSchema.index({ isDeleted: 1 });
