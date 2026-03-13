import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Student, StudentDocument } from './entities/student.schema';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentsService {
  constructor(@InjectModel(Student.name) private studentModel: Model<StudentDocument>) {}

  async create(organizationId: string, branchId: string, dto: CreateStudentDto): Promise<StudentDocument> {
    const existing = await this.studentModel.findOne({
      organizationId,
      branchId,
      admissionNumber: dto.admissionNumber,
      isDeleted: false,
    } as any);
    if (existing) {
      throw new ConflictException('Student with this admission number already exists');
    }
    return this.studentModel.create({ ...dto, organizationId, branchId } as any);
  }

  async findAll(organizationId: string, branchId: string, classId?: string, search?: string): Promise<StudentDocument[]> {
    const filter: any = { organizationId, branchId, isDeleted: false };
    if (classId) filter.classId = classId;
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { admissionNumber: { $regex: search, $options: 'i' } },
      ];
    }
    return this.studentModel.find(filter)
      .populate('classId', 'name section academicYear')
      .sort({ lastName: 1, firstName: 1 })
      .exec();
  }

  async findOne(id: string): Promise<StudentDocument> {
    const doc = await this.studentModel.findById(id)
      .populate('classId', 'name section academicYear')
      .exec();
    if (!doc || doc.isDeleted) throw new NotFoundException('Student not found');
    return doc;
  }

  async findByClass(organizationId: string, branchId: string, classId: string): Promise<StudentDocument[]> {
    return this.studentModel.find({ organizationId, branchId, classId, isActive: true, isDeleted: false } as any)
      .sort({ lastName: 1, firstName: 1 })
      .exec();
  }

  async update(id: string, dto: UpdateStudentDto): Promise<StudentDocument> {
    const doc = await this.studentModel.findByIdAndUpdate(id, dto, { new: true })
      .populate('classId', 'name section academicYear')
      .exec();
    if (!doc || doc.isDeleted) throw new NotFoundException('Student not found');
    return doc;
  }

  async remove(id: string): Promise<void> {
    const result = await this.studentModel.findByIdAndUpdate(id, { isDeleted: true }, { new: true }).exec();
    if (!result) throw new NotFoundException('Student not found');
  }

  async count(organizationId: string, branchId: string, classId?: string): Promise<number> {
    const filter: any = { organizationId, branchId, isDeleted: false };
    if (classId) filter.classId = classId;
    return this.studentModel.countDocuments(filter).exec();
  }
}
