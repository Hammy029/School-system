import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { OrganizationBranchDocument } from './entities/organization-branch.schema';
import { OrganizationBranchRepository } from './organization-branch.repository';
import { OrganizationRepository } from '../organization/organization.repository';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

@Injectable()
export class OrganizationBranchService {
  constructor(
    private readonly branchRepository: OrganizationBranchRepository,
    @Inject(forwardRef(() => OrganizationRepository))
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async create(
    organizationId: string,
    createDto: CreateBranchDto,
  ): Promise<OrganizationBranchDocument> {
    const organization =
      await this.organizationRepository.findById(organizationId);
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    if (
      !organization.hasMultipleBranches &&
      organization.activeBranchesCount > 0
    ) {
      throw new BadRequestException(
        'Organization does not support multiple branches. Enable multi-branch first.',
      );
    }

    if (
      organization.activeBranchesCount >= organization.maxBranches
    ) {
      throw new BadRequestException(
        `Maximum number of branches (${organization.maxBranches}) reached`,
      );
    }

    const branch = await this.branchRepository.create({
      ...createDto,
      organizationId,
    } as any);

    await this.organizationRepository.incrementBranchCount(organizationId);

    return branch;
  }

  async findById(id: string): Promise<OrganizationBranchDocument> {
    const branch = await this.branchRepository.findById(id);
    if (!branch) {
      throw new NotFoundException('Branch not found');
    }
    return branch;
  }

  async findByOrganization(
    organizationId: string,
  ): Promise<OrganizationBranchDocument[]> {
    return this.branchRepository.findByOrganization(organizationId);
  }

  async findActiveByOrganization(
    organizationId: string,
  ): Promise<OrganizationBranchDocument[]> {
    return this.branchRepository.findActiveByOrganization(organizationId);
  }

  async findMainBranch(
    organizationId: string,
  ): Promise<OrganizationBranchDocument | null> {
    return this.branchRepository.findMainBranch(organizationId);
  }

  async update(
    organizationId: string,
    branchId: string,
    updateDto: UpdateBranchDto,
  ): Promise<OrganizationBranchDocument> {
    const branch = await this.branchRepository.updateByOrganization(
      organizationId,
      branchId,
      updateDto as any,
    );

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    return branch;
  }

  async setMainBranch(
    organizationId: string,
    branchId: string,
  ): Promise<OrganizationBranchDocument> {
    const branch = await this.branchRepository.setMainBranch(
      organizationId,
      branchId,
    );
    if (!branch) {
      throw new NotFoundException('Branch not found');
    }
    return branch;
  }

  async updateStatus(
    organizationId: string,
    branchId: string,
    status: string,
  ): Promise<OrganizationBranchDocument> {
    const branch = await this.branchRepository.updateStatus(
      organizationId,
      branchId,
      status,
    );
    if (!branch) {
      throw new NotFoundException('Branch not found');
    }
    return branch;
  }

  async delete(
    organizationId: string,
    branchId: string,
  ): Promise<boolean> {
    const branch = await this.branchRepository.findById(branchId);
    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    if (branch.isMainBranch) {
      throw new BadRequestException(
        'Cannot delete main branch. Assign a different main branch first.',
      );
    }

    const result = await this.branchRepository.deleteByOrganization(
      organizationId,
      branchId,
    );

    if (result) {
      await this.organizationRepository.decrementBranchCount(organizationId);
    }

    return result;
  }

  async findAllBranches(): Promise<OrganizationBranchDocument[]> {
    return this.branchRepository.findAll();
  }
}
