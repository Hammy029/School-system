import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Organization,
  OrganizationDocument,
} from './entities/organization.schema';
import { BaseRepository } from '../../shared/repositories/base.repository';

@Injectable()
export class OrganizationRepository extends BaseRepository<OrganizationDocument> {
  constructor(
    @InjectModel(Organization.name)
    private readonly organizationModel: Model<OrganizationDocument>,
  ) {
    super(organizationModel);
  }

  async findByOrgCode(orgCode: string): Promise<OrganizationDocument | null> {
    return this.organizationModel
      .findOne({ org_code: orgCode, isDeleted: false })
      .exec();
  }

  async incrementBranchCount(
    organizationId: string,
  ): Promise<OrganizationDocument | null> {
    return this.organizationModel
      .findByIdAndUpdate(
        organizationId,
        {
          $inc: { activeBranchesCount: 1 },
          updatedAt: new Date(),
        },
        { new: true },
      )
      .exec();
  }

  async decrementBranchCount(
    organizationId: string,
  ): Promise<OrganizationDocument | null> {
    return this.organizationModel
      .findByIdAndUpdate(
        organizationId,
        {
          $inc: { activeBranchesCount: -1 },
          updatedAt: new Date(),
        },
        { new: true },
      )
      .exec();
  }
}
