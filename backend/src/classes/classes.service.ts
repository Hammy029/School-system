import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Class, ClassDocument } from './entities/class.schema';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';

@Injectable()
export class ClassesService {
  constructor(@InjectModel(Class.name) private classModel: Model<ClassDocument>) {}

  async create(dto: CreateClassDto): Promise<ClassDocument> {
    const existing = await this.classModel.findOne({
      name: dto.name,
      section: dto.section,
      academicYear: dto.academicYear,
    });
    if (existing) {
      throw new ConflictException('Class with this name, section, and academic year already exists');
    }
    return this.classModel.create(dto as any);
  }

  async findAll(academicYear?: string): Promise<ClassDocument[]> {
    const filter: any = {};
    if (academicYear) filter.academicYear = academicYear;
    return this.classModel.find(filter).populate('teacher', 'username email').sort({ name: 1 }).exec();
  }

  async findOne(id: string): Promise<ClassDocument> {
    const doc = await this.classModel.findById(id).populate('teacher', 'username email').exec();
    if (!doc) throw new NotFoundException('Class not found');
    return doc;
  }

  async update(id: string, dto: UpdateClassDto): Promise<ClassDocument> {
    const doc = await this.classModel.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!doc) throw new NotFoundException('Class not found');
    return doc;
  }

  async remove(id: string): Promise<void> {
    const result = await this.classModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Class not found');
  }

  async count(): Promise<number> {
    return this.classModel.countDocuments().exec();
  }
}
