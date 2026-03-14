import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type FeeStructureDocument = FeeStructure & Document;

@Schema()
export class FeeStructure {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Organization', index: true })
  organizationId!: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'OrganizationBranch', index: true })
  branchId!: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Class', required: false })
  classId?: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  academicYear!: string;

  @Prop({ required: true, enum: ['Term 1', 'Term 2', 'Term 3'] })
  term!: string;

  @Prop({ required: true, enum: ['tuition', 'transport', 'boarding', 'uniform', 'books', 'exam', 'other'] })
  feeType!: string;

  @Prop({ required: true, min: 0 })
  amount!: number;

  @Prop({ required: false })
  description?: string;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ default: false })
  isDeleted?: boolean;
}

export const FeeStructureSchema = SchemaFactory.createForClass(FeeStructure);
FeeStructureSchema.set('timestamps', true);
FeeStructureSchema.index({ organizationId: 1, branchId: 1, academicYear: 1, term: 1 });
