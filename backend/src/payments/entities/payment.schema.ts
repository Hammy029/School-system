import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type PaymentDocument = Payment & Document;

@Schema()
export class Payment {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Organization', index: true })
  organizationId!: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'OrganizationBranch', index: true })
  branchId!: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Student', required: true })
  studentId!: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  academicYear!: string;

  @Prop({ required: true, enum: ['Term 1', 'Term 2', 'Term 3'] })
  term!: string;

  @Prop({ required: true, enum: ['tuition', 'transport', 'boarding', 'uniform', 'books', 'exam', 'other'] })
  feeType!: string;

  @Prop({ required: true, min: 0 })
  amount!: number;

  @Prop({ required: true, min: 0 })
  amountPaid!: number;

  @Prop({ required: false })
  receiptNumber?: string;

  @Prop({ required: true, enum: ['cash', 'bank_transfer', 'mpesa', 'cheque', 'other'], default: 'cash' })
  paymentMethod!: string;

  @Prop({ required: false })
  referenceNumber?: string;

  @Prop({ required: false })
  paymentDate?: Date;

  @Prop({ required: false })
  notes?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: false })
  receivedBy?: MongooseSchema.Types.ObjectId;

  @Prop({ default: 'pending', enum: ['pending', 'partial', 'completed', 'refunded'] })
  status!: string;

  @Prop({ default: false })
  isDeleted?: boolean;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
PaymentSchema.set('timestamps', true);
PaymentSchema.index({ organizationId: 1, branchId: 1, studentId: 1, academicYear: 1, term: 1 });
