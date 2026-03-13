import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type StudentDocument = Student & Document;

@Schema()
export class Student {
  @Prop({ required: true })
  firstName!: string;

  @Prop({ required: true })
  lastName!: string;

  @Prop({ required: true, unique: true })
  admissionNumber!: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Class', required: true })
  classId!: MongooseSchema.Types.ObjectId;

  @Prop({ required: false })
  dateOfBirth?: Date;

  @Prop({ enum: ['male', 'female', 'other'], required: false })
  gender?: string;

  @Prop({ required: false })
  parentName?: string;

  @Prop({ required: false })
  parentPhone?: string;

  @Prop({ required: false })
  parentEmail?: string;

  @Prop({ default: true })
  isActive!: boolean;
}

export const StudentSchema = SchemaFactory.createForClass(Student);
StudentSchema.set('timestamps', true);
StudentSchema.index({ classId: 1 });
