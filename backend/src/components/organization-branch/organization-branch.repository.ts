import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  OrganizationBranch,
  OrganizationBranchDocument,
} from './entities/organization-branch.schema';
import { OrganizationScopedRepository } from '../../shared/repositories/organization-scoped.repository';

@Injectable()
export class OrganizationBranchRepository extends OrganizationScopedRepository<OrganizationBranchDocument> {
  constructor(
    @InjectModel(OrganizationBranch.name)
    private readonly branchModel: Model<OrganizationBranchDocument>,
  ) {
    super(branchModel);
  }

  async findById(id: string): Promise<OrganizationBranchDocument | null> {
    return this.branchModel
      .findById(id)
      .populate('organizationId')
      .exec() as Promise<OrganizationBranchDocument | null>;
  }

  async findByOrganization(
    organizationId: string,
  ): Promise<OrganizationBranchDocument[]> {
    const orgIdStr = typeof organizationId === 'object'
      ? (organizationId as any)?._id?.toString() ?? String(organizationId)
      : organizationId;
    return this.branchModel
      .find({
        organizationId: orgIdStr,
        isDeleted: false,
      })
      .populate('organizationId')
      .sort({ name: 1 })
      .exec();
  }

  async findActiveByOrganization(
    organizationId: string,
  ): Promise<OrganizationBranchDocument[]> {
    return this.branchModel
      .find({
        organizationId,
        status: 'active',
        isDeleted: false,
      } as any)
      .populate('organizationId')
      .sort({ name: 1 })
      .exec();
  }

  async findMainBranch(
    organizationId: string,
  ): Promise<OrganizationBranchDocument | null> {
    const orgIdStr = typeof organizationId === 'object'
      ? (organizationId as any)?._id?.toString() ?? String(organizationId)
      : organizationId;
    return this.branchModel
      .findOne({
        organizationId: orgIdStr,
        isMainBranch: true,
        isDeleted: false,
      })
      .populate('organizationId')
      .exec();
  }

  async setMainBranch(
    organizationId: string,
    branchId: string,
  ): Promise<OrganizationBranchDocument | null> {
    await this.branchModel.updateMany(
      { organizationId, isDeleted: false } as any,
      { isMainBranch: false, updatedAt: new Date() },
    );

    return this.branchModel
      .findByIdAndUpdate(
        branchId,
        {
          isMainBranch: true,
          updatedAt: new Date(),
        },
        { new: true },
      )
      .exec() as Promise<OrganizationBranchDocument | null>;
  }

  async updateStatus(
    organizationId: string,
    branchId: string,
    status: string,
  ): Promise<OrganizationBranchDocument | null> {
    return this.branchModel
      .findOneAndUpdate(
        { _id: branchId, organizationId, isDeleted: false } as any,
        {
          status,
          updatedAt: new Date(),
        },
        { new: true },
      )
      .exec();
  }

  async getBranchesCount(organizationId: string): Promise<number> {
    return this.branchModel.countDocuments({
      organizationId,
      isDeleted: false,
    } as any);
  }

  async getActiveBranchesCount(organizationId: string): Promise<number> {
    return this.branchModel.countDocuments({
      organizationId,
      status: 'active',
      isDeleted: false,
    } as any);
  }

  async findAll(): Promise<OrganizationBranchDocument[]> {
    return this.branchModel
      .find({ isDeleted: false })
      .populate('organizationId')
      .sort({ name: 1 })
      .exec();
  }
}
