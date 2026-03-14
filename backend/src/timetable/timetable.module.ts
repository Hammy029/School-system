import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Timetable, TimetableSchema } from './entities/timetable.schema';
import { Subject, SubjectSchema } from '../subjects/entities/subject.schema';
import { TimetableService } from './timetable.service';
import { TimetableController } from './timetable.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Timetable.name, schema: TimetableSchema },
      { name: Subject.name, schema: SubjectSchema },
    ]),
  ],
  controllers: [TimetableController],
  providers: [TimetableService],
  exports: [TimetableService],
})
export class TimetableModule {}
