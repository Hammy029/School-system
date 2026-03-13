import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type SubjectDocument = Subject & Document;

@Schema()
export class Subject {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, unique: true })
  code!: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Class', required: false })
  classId?: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: false })
  teacher?: MongooseSchema.Types.ObjectId;

  @Prop({ default: true })
  isActive!: boolean;
}

export const SubjectSchema = SchemaFactory.createForClass(Subject);
SubjectSchema.set('timestamps', true);
