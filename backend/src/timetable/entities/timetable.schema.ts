import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type TimetableSlotDocument = TimetableSlot & Document;

@Schema({ _id: false })
export class TimetableSlot {
  @Prop({ required: true, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] })
  day!: string;

  @Prop({ required: true })
  startTime!: string;

  @Prop({ required: true })
  endTime!: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Subject', required: true })
  subjectId!: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: false })
  teacherId?: MongooseSchema.Types.ObjectId;

  @Prop({ required: false })
  room?: string;
}

export const TimetableSlotSchema = SchemaFactory.createForClass(TimetableSlot);

export type TimetableDocument = Timetable & Document;

@Schema()
export class Timetable {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Organization', index: true })
  organizationId!: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'OrganizationBranch', index: true })
  branchId!: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Class', required: true })
  classId!: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  academicYear!: string;

  @Prop({ required: true, enum: ['Term 1', 'Term 2', 'Term 3'] })
  term!: string;

  @Prop({ type: [TimetableSlotSchema], default: [] })
  slots!: TimetableSlot[];

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ default: false })
  isDeleted?: boolean;
}

export const TimetableSchema = SchemaFactory.createForClass(Timetable);
TimetableSchema.set('timestamps', true);
TimetableSchema.index({ organizationId: 1, branchId: 1, classId: 1, academicYear: 1, term: 1 }, { unique: true });
