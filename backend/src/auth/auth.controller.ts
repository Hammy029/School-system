import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Delete,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { Role } from './roles.enum';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ─── PUBLIC ENDPOINTS ────────────────────────────────────────

  @Post('register')
  async register(@Body() registerDto: RegisterDto, @Request() req: any) {
    return this.authService.register(registerDto, req.ip);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @Request() req: any) {
    return this.authService.login(loginDto, req.ip);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  // ─── PROTECTED ENDPOINTS ────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req: any) {
    return this.authService.logout(req.user._id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req: any) {
    return this.authService.getProfile(req.user._id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('update-password')
  async updatePassword(@Request() req: any, @Body() updatePasswordDto: UpdatePasswordDto) {
    return this.authService.updatePassword(req.user._id, updatePasswordDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('first-time-password-change')
  @HttpCode(HttpStatus.OK)
  async firstTimePasswordChange(@Request() req: any, @Body('newPassword') newPassword: string) {
    return this.authService.firstTimePasswordChange(req.user._id, newPassword);
  }

  // ─── USER MANAGEMENT (Admin+) ───────────────────────────────

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.SuperAdmin)
  @Post('admin-register')
  async adminRegister(@Body() registerDto: RegisterDto, @Request() req: any) {
    return this.authService.adminRegister(registerDto, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.SuperAdmin)
  @Get('users')
  async getUsers(@Request() req: any) {
    return this.authService.findAllUsers(req.user.organizationId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.SuperAdmin)
  @Patch('users/:id')
  async updateUser(@Param('id') id: string, @Body() updateData: Partial<RegisterDto>) {
    return this.authService.updateUser(id, updateData);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.SuperAdmin)
  @Delete('users/:id')
  async deleteUser(@Param('id') id: string) {
    return this.authService.deleteUser(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SuperAdmin)
  @Patch('users/:id/approve')
  async approveUser(@Param('id') id: string, @Body('organizationId') organizationId?: string, @Body('branchId') branchId?: string) {
    return this.authService.approveUser(id, organizationId, branchId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SuperAdmin)
  @Delete('users/:id/reject')
  async rejectUser(@Param('id') id: string) {
    return this.authService.rejectUser(id);
  }
}
