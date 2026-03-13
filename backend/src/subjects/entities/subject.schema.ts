import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type SubjectDocument = Subject & Document;

@Schema()
export class Subject {
  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    ref: 'Organization',
    index: true,
  })
  organizationId!: MongooseSchema.Types.ObjectId;

  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    ref: 'OrganizationBranch',
    index: true,
  })
  branchId!: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  code!: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Class', required: false })
  classId?: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: false })
  teacher?: MongooseSchema.Types.ObjectId;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ default: false })
  isDeleted?: boolean;
}

export const SubjectSchema = SchemaFactory.createForClass(Subject);
SubjectSchema.set('timestamps', true);
SubjectSchema.index({ organizationId: 1, branchId: 1, code: 1 }, { unique: true });
