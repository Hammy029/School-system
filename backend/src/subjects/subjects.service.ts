import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subject, SubjectDocument } from './entities/subject.schema';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

@Injectable()
export class SubjectsService {
  constructor(@InjectModel(Subject.name) private subjectModel: Model<SubjectDocument>) {}

  async create(organizationId: string, branchId: string, dto: CreateSubjectDto): Promise<SubjectDocument> {
    const existing = await this.subjectModel.findOne({
      organizationId,
      branchId,
      code: dto.code,
      isDeleted: false,
    } as any);
    if (existing) {
      throw new ConflictException('Subject with this code already exists');
    }
    return this.subjectModel.create({ ...dto, organizationId, branchId } as any);
  }

  async findAll(organizationId: string, branchId: string, classId?: string): Promise<SubjectDocument[]> {
    const filter: any = { organizationId, branchId, isDeleted: false };
    if (classId) filter.classId = classId;
    return this.subjectModel.find(filter)
      .populate('classId', 'name section')
      .populate('teacher', 'username email')
      .sort({ name: 1 })
      .exec();
  }

  async findOne(id: string): Promise<SubjectDocument> {
    const doc = await this.subjectModel.findById(id)
      .populate('classId', 'name section')
      .populate('teacher', 'username email')
      .exec();
    if (!doc || doc.isDeleted) throw new NotFoundException('Subject not found');
    return doc;
  }

  async update(id: string, dto: UpdateSubjectDto): Promise<SubjectDocument> {
    const doc = await this.subjectModel.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!doc || doc.isDeleted) throw new NotFoundException('Subject not found');
    return doc;
  }

  async remove(id: string): Promise<void> {
    const result = await this.subjectModel.findByIdAndUpdate(id, { isDeleted: true }, { new: true }).exec();
    if (!result) throw new NotFoundException('Subject not found');
  }

  async count(organizationId: string, branchId: string): Promise<number> {
    return this.subjectModel.countDocuments({ organizationId, branchId, isDeleted: false } as any).exec();
  }
}
