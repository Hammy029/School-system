import { Controller, Post, Body } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';

@Controller('clients')
export class ClientsController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post('register')
  async register(@Body() createDto: CreateOrganizationDto) {
    return this.organizationService.create(createDto);
  }
}
