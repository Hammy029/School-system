import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GradingScale, GradingScaleDocument } from './entities/grading-scale.schema';
import { CreateGradingScaleDto } from './dto/create-grading-scale.dto';
import { UpdateGradingScaleDto } from './dto/update-grading-scale.dto';

@Injectable()
export class GradingService {
  constructor(@InjectModel(GradingScale.name) private gradingModel: Model<GradingScaleDocument>) {}

  async create(dto: CreateGradingScaleDto): Promise<GradingScaleDocument> {
    if (dto.isDefault) {
      await this.gradingModel.updateMany({}, { isDefault: false });
    }
    return this.gradingModel.create(dto);
  }

  async findAll(): Promise<GradingScaleDocument[]> {
    return this.gradingModel.find().sort({ name: 1 }).exec();
  }

  async findOne(id: string): Promise<GradingScaleDocument> {
    const doc = await this.gradingModel.findById(id).exec();
    if (!doc) throw new NotFoundException('Grading scale not found');
    return doc;
  }

  async findDefault(): Promise<GradingScaleDocument | null> {
    return this.gradingModel.findOne({ isDefault: true }).exec();
  }

  async update(id: string, dto: UpdateGradingScaleDto): Promise<GradingScaleDocument> {
    if (dto.isDefault) {
      await this.gradingModel.updateMany({ _id: { $ne: id } }, { isDefault: false });
    }
    const doc = await this.gradingModel.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!doc) throw new NotFoundException('Grading scale not found');
    return doc;
  }

  async remove(id: string): Promise<void> {
    const result = await this.gradingModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Grading scale not found');
  }

  getGradeForScore(grades: { grade: string; minScore: number; maxScore: number; remark?: string; points?: number }[], score: number) {
    for (const g of grades) {
      if (score >= g.minScore && score <= g.maxScore) {
        return { grade: g.grade, remark: g.remark || '', points: g.points || 0 };
      }
    }
    return { grade: 'N/A', remark: '', points: 0 };
  }
}
