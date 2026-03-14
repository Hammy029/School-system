import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Timetable, TimetableDocument } from './entities/timetable.schema';
import { Subject, SubjectDocument } from '../subjects/entities/subject.schema';
import { CreateTimetableDto } from './dto/create-timetable.dto';
import { UpdateTimetableDto } from './dto/update-timetable.dto';
import { GenerateTimetableDto } from './dto/generate-timetable.dto';

@Injectable()
export class TimetableService {
  constructor(
    @InjectModel(Timetable.name) private timetableModel: Model<TimetableDocument>,
    @InjectModel(Subject.name) private subjectModel: Model<SubjectDocument>,
  ) {}

  async create(organizationId: string, branchId: string, dto: CreateTimetableDto): Promise<TimetableDocument> {
    const existing = await this.timetableModel.findOne({
      organizationId, branchId, classId: dto.classId, academicYear: dto.academicYear, term: dto.term, isDeleted: false,
    } as any);
    if (existing) throw new ConflictException('Timetable already exists for this class/term');
    return this.timetableModel.create({ ...dto, organizationId, branchId } as any);
  }

  async generate(organizationId: string, branchId: string, dto: GenerateTimetableDto): Promise<TimetableDocument> {
    // Get subjects with their teachers
    const subjects = await this.subjectModel.find({
      _id: { $in: dto.subjectIds },
      isDeleted: false,
    }).exec();

    const slots: any[] = [];
    const startMinutes = this.parseTime(dto.startTime);
    const endMinutes = this.parseTime(dto.endTime);
    const slotDur = parseInt(dto.slotDuration, 10);
    const breakTimeMin = this.parseTime(dto.breakTime);
    const breakDur = parseInt(dto.breakDuration, 10);

    let subjectIndex = 0;

    for (const day of dto.days) {
      let currentMinute = startMinutes;

      while (currentMinute + slotDur <= endMinutes) {
        // Check if it's break time
        if (currentMinute === breakTimeMin) {
          currentMinute += breakDur;
          continue;
        }

        const subject = subjects[subjectIndex % subjects.length];
        slots.push({
          day,
          startTime: this.formatTime(currentMinute),
          endTime: this.formatTime(currentMinute + slotDur),
          subjectId: subject._id,
          teacherId: subject.teacher || undefined,
        });

        subjectIndex++;
        currentMinute += slotDur;
      }
    }

    // Delete existing timetable if any
    await this.timetableModel.findOneAndUpdate(
      { organizationId, branchId, classId: dto.classId, academicYear: dto.academicYear, term: dto.term } as any,
      { isDeleted: true },
    );

    return this.timetableModel.create({
      organizationId, branchId, classId: dto.classId,
      academicYear: dto.academicYear, term: dto.term, slots,
    } as any);
  }

  async findAll(organizationId: string, branchId: string, classId?: string, academicYear?: string, term?: string): Promise<TimetableDocument[]> {
    const filter: any = { organizationId, branchId, isDeleted: false };
    if (classId) filter.classId = classId;
    if (academicYear) filter.academicYear = academicYear;
    if (term) filter.term = term;
    return this.timetableModel.find(filter)
      .populate('classId', 'name section')
      .populate('slots.subjectId', 'name code')
      .populate('slots.teacherId', 'username email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<TimetableDocument> {
    const doc = await this.timetableModel.findById(id)
      .populate('classId', 'name section')
      .populate('slots.subjectId', 'name code')
      .populate('slots.teacherId', 'username email')
      .exec();
    if (!doc || doc.isDeleted) throw new NotFoundException('Timetable not found');
    return doc;
  }

  async update(id: string, dto: UpdateTimetableDto): Promise<TimetableDocument> {
    const doc = await this.timetableModel.findByIdAndUpdate(id, dto, { new: true })
      .populate('classId', 'name section')
      .populate('slots.subjectId', 'name code')
      .populate('slots.teacherId', 'username email')
      .exec();
    if (!doc || doc.isDeleted) throw new NotFoundException('Timetable not found');
    return doc;
  }

  async remove(id: string): Promise<void> {
    const result = await this.timetableModel.findByIdAndUpdate(id, { isDeleted: true }, { new: true }).exec();
    if (!result) throw new NotFoundException('Timetable not found');
  }

  private parseTime(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }

  private formatTime(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }
}
