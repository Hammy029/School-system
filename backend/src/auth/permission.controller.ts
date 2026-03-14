import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PermissionService } from './permission.service';
import { UpdatePermissionsDto } from './dto/permission.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { Role } from './roles.enum';

@Controller('auth/permissions')
@UseGuards(JwtAuthGuard)
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get('all')
  getAllPermissions() {
    return this.permissionService.getAllPermissions();
  }

  @Get('me')
  async getMyPermissions(@Request() req: any) {
    const permissions = await this.permissionService.getPermissionsByUserId(req.user._id);
    return { permissions, role: req.user.role };
  }

  @Get(':userId')
  @UseGuards(RolesGuard)
  @Roles(Role.Admin, Role.SuperAdmin)
  async getUserPermissions(@Param('userId') userId: string) {
    return this.permissionService.getPermissionsByUserId(userId);
  }

  @Put(':userId')
  @UseGuards(RolesGuard)
  @Roles(Role.Admin, Role.SuperAdmin)
  async updateUserPermissions(
    @Param('userId') userId: string,
    @Body() dto: UpdatePermissionsDto,
  ) {
    return this.permissionService.upsertPermissions(userId, dto.permissions);
  }
}
