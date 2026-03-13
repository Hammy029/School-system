import {
  Injectable,
  NotFoundException,
  ConflictException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { OrganizationDocument, SubscriptionStatus } from './entities/organization.schema';
import { OrganizationRepository } from './organization.repository';
import { OrganizationBranchService } from '../organization-branch/organization-branch.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { BranchType } from '../organization-branch/entities/organization-branch.schema';

@Injectable()
export class OrganizationService {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
    @Inject(forwardRef(() => OrganizationBranchService))
    private readonly branchService: OrganizationBranchService,
  ) {}

  async create(
    createDto: CreateOrganizationDto,
  ): Promise<OrganizationDocument> {
    if (!createDto.org_code || createDto.org_code.trim() === '') {
      createDto.org_code = await this.generateOrgCode(createDto.name);
    } else {
      createDto.org_code = createDto.org_code.trim().toUpperCase();
    }

    const existing = await this.organizationRepository.findByOrgCode(
      createDto.org_code,
    );
    if (existing) {
      throw new ConflictException('Organization code already exists');
    }

    const organization = await this.organizationRepository.create({
      ...createDto,
      hasMultipleBranches: createDto.hasMultipleBranches || false,
      maxBranches: createDto.maxBranches || 1,
      activeBranchesCount: 0,
    } as any);

    // Create default main branch
    await this.branchService.create(organization._id.toString(), {
      name: `${createDto.name} - Main Branch`,
      description: `Main branch for ${createDto.name}`,
      type: BranchType.MAIN,
      isMainBranch: true,
      address: createDto.address,
      phone: createDto.phone,
      email: createDto.email,
    });

    return organization;
  }

  async findById(id: string): Promise<OrganizationDocument> {
    const organization = await this.organizationRepository.findById(id);
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }
    return organization;
  }

  async findByOrgCode(orgCode: string): Promise<OrganizationDocument> {
    const organization =
      await this.organizationRepository.findByOrgCode(orgCode);
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }
    return organization;
  }

  async findAll(): Promise<OrganizationDocument[]> {
    return this.organizationRepository.findAll();
  }

  async update(
    id: string,
    updateDto: UpdateOrganizationDto,
  ): Promise<OrganizationDocument> {
    if (updateDto.org_code) {
      updateDto.org_code = updateDto.org_code.trim().toUpperCase();
    }
    const organization = await this.organizationRepository.update(
      id,
      updateDto as any,
    );
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }
    return organization;
  }

  async delete(id: string): Promise<boolean> {
    await this.findById(id);
    return this.organizationRepository.delete(id);
  }

  async approve(organizationId: string): Promise<OrganizationDocument> {
    const org = await this.findById(organizationId);
    if (org.subscriptionStatus !== SubscriptionStatus.PENDING) {
      throw new ConflictException('Only pending organizations can be approved');
    }
    return this.setStatus(organizationId, SubscriptionStatus.ACTIVE);
  }

  async decline(organizationId: string): Promise<OrganizationDocument> {
    const org = await this.findById(organizationId);
    if (org.subscriptionStatus !== SubscriptionStatus.PENDING) {
      throw new ConflictException('Only pending organizations can be declined');
    }
    return this.setStatus(organizationId, SubscriptionStatus.DECLINED);
  }

  async activate(organizationId: string): Promise<OrganizationDocument> {
    const org = await this.findById(organizationId);
    if (org.subscriptionStatus === SubscriptionStatus.ACTIVE) {
      throw new ConflictException('Organization is already active');
    }
    return this.setStatus(organizationId, SubscriptionStatus.ACTIVE);
  }

  async deactivate(organizationId: string): Promise<OrganizationDocument> {
    const org = await this.findById(organizationId);
    if (org.subscriptionStatus !== SubscriptionStatus.ACTIVE) {
      throw new ConflictException('Only active organizations can be deactivated');
    }
    return this.setStatus(organizationId, SubscriptionStatus.INACTIVE);
  }

  private async setStatus(
    organizationId: string,
    status: SubscriptionStatus,
  ): Promise<OrganizationDocument> {
    const updated = await this.organizationRepository.update(
      organizationId,
      { subscriptionStatus: status } as any,
    );
    if (!updated) {
      throw new NotFoundException('Organization not found');
    }
    return updated;
  }

  private async generateOrgCode(name: string): Promise<string> {
    const base = name.replace(/[^A-Za-z]/g, '').substring(0, 3).toUpperCase().padEnd(3, 'X');
    let code: string;
    let attempts = 0;
    do {
      const suffix = Math.floor(Math.random() * 90 + 10).toString();
      code = `${base}${suffix}`;
      const exists = await this.organizationRepository.findByOrgCode(code);
      if (!exists) break;
      attempts++;
    } while (attempts < 100);

    if (attempts >= 100) {
      code = `${base}${Date.now().toString().slice(-2)}`;
    }
    return code;
  }
}
