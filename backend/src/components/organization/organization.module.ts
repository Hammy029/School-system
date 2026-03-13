import { Global, Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Organization,
  OrganizationSchema,
} from './entities/organization.schema';
import { OrganizationRepository } from './organization.repository';
import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';
import { OrganizationBranchModule } from '../organization-branch/organization-branch.module';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Organization.name, schema: OrganizationSchema },
    ]),
    forwardRef(() => OrganizationBranchModule),
  ],
  providers: [OrganizationRepository, OrganizationService],
  controllers: [OrganizationController],
  exports: [OrganizationService, OrganizationRepository, MongooseModule],
})
export class OrganizationModule {}
