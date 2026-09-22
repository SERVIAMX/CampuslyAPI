import {
  Body,
  Controller,
  Get,
  Headers,
  Ip,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../common/decorators/current-user.decorator.js';
import { Public } from '../../../common/decorators/public.decorator.js';
import type { CurrentUserPayload } from '../../../common/interfaces/current-user-payload.interface.js';
import { AuthService } from '../application/auth.service.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { LogoutDto } from './dto/logout.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login/gestion-web')
  @ApiOperation({
    summary: 'Login GestionWeb (rol con idProyecto = 1)',
  })
  loginGestionWeb(
    @Body() dto: LoginDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string | undefined,
  ) {
    return this.authService.loginGestionWeb(dto, ip, userAgent);
  }

  @Public()
  @Post('login/docentes')
  @ApiOperation({
    summary: 'Login Docentes (rol con idProyecto = 2)',
  })
  loginDocentes(
    @Body() dto: LoginDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string | undefined,
  ) {
    return this.authService.loginDocentes(dto, ip, userAgent);
  }

  @Public()
  @Post('login/tutores')
  @ApiOperation({
    summary: 'Login Tutores (rol con idProyecto = 3)',
  })
  loginTutores(
    @Body() dto: LoginDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string | undefined,
  ) {
    return this.authService.loginTutores(dto, ip, userAgent);
  }

  @Public()
  @Post('refresh-token')
  @ApiOperation({ summary: 'Renovar access y refresh tokens' })
  refresh(
    @Body() dto: RefreshTokenDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string | undefined,
  ) {
    return this.authService.refresh(dto.refreshToken, ip, userAgent);
  }

  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cerrar sesión (revocar refresh token)' })
  logout(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: LogoutDto,
  ) {
    return this.authService.logout(user.userId, dto.refreshToken);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Perfil del usuario autenticado' })
  me(@CurrentUser() user: CurrentUserPayload) {
    return this.authService.me(user.userId);
  }

  @Public()
  @Post('forgot-password')
  @ApiOperation({ summary: 'Solicitar restablecimiento por correo (Persona.Email)' })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Public()
  @Post('reset-password')
  @ApiOperation({ summary: 'Restablecer contraseña con token del correo' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  @Patch('change-password')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cambiar contraseña (autenticado)' })
  changePassword(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(user.userId, dto);
  }
}
