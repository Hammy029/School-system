import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  OrganizationBranch,
  OrganizationBranchSchema,
} from './entities/organization-branch.schema';
import { OrganizationBranchRepository } from './organization-branch.repository';
import { OrganizationBranchService } from './organization-branch.service';
import { OrganizationBranchController } from './organization-branch.controller';
import { OrganizationModule } from '../organization/organization.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OrganizationBranch.name, schema: OrganizationBranchSchema },
    ]),
    forwardRef(() => OrganizationModule),
  ],
  providers: [OrganizationBranchRepository, OrganizationBranchService],
  controllers: [OrganizationBranchController],
  exports: [OrganizationBranchService, OrganizationBranchRepository],
})
export class OrganizationBranchModule {}
