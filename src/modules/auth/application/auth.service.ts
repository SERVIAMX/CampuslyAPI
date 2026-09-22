import { MailerService } from '@nestjs-modules/mailer';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { DataSource, MoreThan, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Estatus } from '../../../common/constants/estatus.constants.js';
import {
  PROYECTO_LOGIN_NOMBRES,
  ProyectoLogin,
  type ProyectoLoginId,
} from '../../../common/constants/proyecto-login.constants.js';
import type {
  JwtAccessPayload,
  JwtRefreshPayload,
} from '../../../common/interfaces/jwt-payload.interface.js';
import { Usuario } from '../../usuarios/domain/usuario.entity.js';
import { RefreshToken } from '../domain/refresh-token.entity.js';
import { buildPasswordResetEmailHtml } from '../mail/password-reset-email.template.js';
import type { ChangePasswordDto } from '../presentation/dto/change-password.dto.js';
import type { LoginDto } from '../presentation/dto/login.dto.js';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(Usuario)
    private readonly usuariosRepo: Repository<Usuario>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepo: Repository<RefreshToken>,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly mailer: MailerService,
    private readonly dataSource: DataSource,
  ) {}

  async loginGestionWeb(dto: LoginDto, ip?: string, userAgent?: string) {
    return this.loginForProyecto(dto, ProyectoLogin.GestionWeb, ip, userAgent);
  }

  async loginDocentes(dto: LoginDto, ip?: string, userAgent?: string) {
    return this.loginForProyecto(dto, ProyectoLogin.Docentes, ip, userAgent);
  }

  async loginTutores(dto: LoginDto, ip?: string, userAgent?: string) {
    return this.loginForProyecto(dto, ProyectoLogin.Tutores, ip, userAgent);
  }

  private async loginForProyecto(
    dto: LoginDto,
    idProyecto: ProyectoLoginId,
    ip?: string,
    userAgent?: string,
  ) {
    const user = await this.validateLoginCredentials(dto);
    const rolProyecto = user.rol?.idProyecto;

    if (rolProyecto == null || rolProyecto !== idProyecto) {
      const portal = PROYECTO_LOGIN_NOMBRES[idProyecto];
      throw new ForbiddenException(
        `Este usuario no tiene acceso al portal ${portal}`,
      );
    }

    user.lastLoginAt = new Date();
    await this.usuariosRepo.save(user);

    const tokens = await this.issueTokens(user, ip, userAgent);
    return {
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  private async validateLoginCredentials(dto: LoginDto): Promise<Usuario> {
    const user = await this.usuariosRepo.findOne({
      where: { userName: dto.userName },
      select: {
        id: true,
        userName: true,
        password: true,
        idPersona: true,
        idRol: true,
        estatus: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
      },
      relations: { persona: true, rol: true },
    });

    if (!user || user.estatus === Estatus.Baja || !user.password) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.rol || user.rol.estatus === Estatus.Baja) {
      throw new UnauthorizedException('Usuario sin rol activo');
    }

    const ok = await bcrypt.compare(dto.password, user.password);
    if (!ok) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return user;
  }

  async refresh(refreshTokenPlain: string, ip?: string, userAgent?: string) {
    let payload: JwtRefreshPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtRefreshPayload>(
        refreshTokenPlain,
        { secret: this.config.get<string>('JWT_REFRESH_SECRET', '') },
      );
    } catch {
      throw new UnauthorizedException('Refresh token inválido');
    }
    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Refresh token inválido');
    }

    const rows = await this.refreshTokenRepo.find({
      where: {
        idUsuario: payload.sub,
        isRevoked: 0,
        expiresAt: MoreThan(new Date()),
      },
      relations: { usuario: { persona: true, rol: true } },
      order: { id: 'DESC' },
    });

    let matched: RefreshToken | null = null;
    for (const row of rows) {
      if (await bcrypt.compare(refreshTokenPlain, row.token)) {
        matched = row;
        break;
      }
    }
    if (!matched?.usuario) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    const user = matched.usuario;
    if (user.estatus === Estatus.Baja) {
      throw new UnauthorizedException('Usuario no disponible');
    }

    return this.dataSource.transaction(async (manager) => {
      matched!.isRevoked = 1;
      await manager.save(RefreshToken, matched!);

      const accessToken = await this.signAccessToken(user);
      const newRefreshPlain = await this.signRefreshToken(user.id);
      const hashed = await bcrypt.hash(newRefreshPlain, 10);
      await manager.save(
        RefreshToken,
        manager.create(RefreshToken, {
          idUsuario: user.id,
          token: hashed,
          expiresAt: this.refreshExpiresDate(),
          isRevoked: 0,
          ipAddress: ip ?? null,
          userAgent: userAgent ?? null,
        }),
      );

      return { token: accessToken, refreshToken: newRefreshPlain };
    });
  }

  async me(userId: string) {
    const user = await this.usuariosRepo.findOne({
      where: { id: userId },
      relations: { persona: true, rol: true },
    });
    if (!user || user.estatus === Estatus.Baja) {
      throw new UnauthorizedException('Usuario no disponible');
    }

    return {
      userName: user.userName,
      lastLoginAt: user.lastLoginAt,
      nombreRol: user.rol?.nombre ?? null,
      persona: user.persona
        ? {
            curp: user.persona.curp,
            nombre: user.persona.nombre,
            apellidoPaterno: user.persona.apellidoPaterno,
            apellidoMaterno: user.persona.apellidoMaterno,
            email: user.persona.email,
            telefono: user.persona.telefono,
            fotografia: user.persona.fotografia,
            genero: user.persona.genero,
            fechaNacimiento: user.persona.fechaNacimiento,
          }
        : null,
    };
  }

  async logout(userId: string, refreshTokenPlain: string) {
    const rows = await this.refreshTokenRepo.find({
      where: { idUsuario: userId, isRevoked: 0 },
    });
    for (const row of rows) {
      if (await bcrypt.compare(refreshTokenPlain, row.token)) {
        row.isRevoked = 1;
        await this.refreshTokenRepo.save(row);
        return { revoked: true };
      }
    }
    throw new BadRequestException('Refresh token no encontrado');
  }

  async forgotPassword(email: string) {
    const user = await this.usuariosRepo
      .createQueryBuilder('u')
      .innerJoinAndSelect('u.persona', 'p')
      .addSelect(['u.resetPasswordToken', 'u.resetPasswordExpiresAt'])
      .where('p.email = :email', { email })
      .andWhere('u.estatus = :estatus', { estatus: Estatus.Activo })
      .getOne();

    if (user) {
      const plain = uuidv4();
      const hash = await bcrypt.hash(plain, 10);
      user.resetPasswordToken = hash;
      user.resetPasswordExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
      await this.usuariosRepo.save(user);

      const base = this.config
        .get<string>(
          'APP_FRONTEND_URL',
          'http://localhost:4200/restaurar-contrasena',
        )
        .trim()
        .replace(/\?+$/, '');
      const link = `${base}?token=${encodeURIComponent(plain)}`;
      const html = buildPasswordResetEmailHtml(link);

      try {
        await this.mailer.sendMail({
          to: email,
          subject: 'Restablece tu contraseña — Campusly',
          text:
            'Recibimos una solicitud para recuperar tu contraseña. ' +
            `Abre este enlace (válido 15 minutos): ${link}`,
          html,
        });
      } catch (err) {
        this.logger.error('Mailer error', err);
      }
    }

    return { ok: true };
  }

  async resetPassword(token: string, newPassword: string) {
    const users = await this.usuariosRepo
      .createQueryBuilder('u')
      .addSelect(['u.resetPasswordToken', 'u.resetPasswordExpiresAt', 'u.password'])
      .where('u.resetPasswordToken IS NOT NULL')
      .andWhere('u.resetPasswordExpiresAt > :now', { now: new Date() })
      .getMany();

    let target: Usuario | null = null;
    for (const u of users) {
      if (
        u.resetPasswordToken &&
        (await bcrypt.compare(token, u.resetPasswordToken))
      ) {
        target = u;
        break;
      }
    }
    if (!target) {
      throw new BadRequestException('Token inválido o expirado');
    }

    await this.dataSource.transaction(async (manager) => {
      target!.password = await bcrypt.hash(newPassword, 10);
      target!.resetPasswordToken = null;
      target!.resetPasswordExpiresAt = null;
      await manager.save(Usuario, target!);

      await manager
        .createQueryBuilder()
        .update(RefreshToken)
        .set({ isRevoked: 1 })
        .where('IdUsuario = :id', { id: target!.id })
        .execute();
    });

    return { ok: true };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.usuariosRepo.findOne({
      where: { id: userId },
      select: {
        id: true,
        userName: true,
        password: true,
        estatus: true,
      },
    });
    if (!user || user.estatus === Estatus.Baja || !user.password) {
      throw new UnauthorizedException();
    }

    const ok = await bcrypt.compare(dto.currentPassword, user.password);
    if (!ok) {
      throw new BadRequestException('Contraseña actual incorrecta');
    }

    user.password = await bcrypt.hash(dto.newPassword, 10);
    await this.usuariosRepo.save(user);

    const rows = await this.refreshTokenRepo.find({
      where: { idUsuario: userId, isRevoked: 0 },
    });

    for (const row of rows) {
      if (dto.currentRefreshToken) {
        const keep = await bcrypt.compare(
          dto.currentRefreshToken,
          row.token,
        );
        if (keep) continue;
      }
      row.isRevoked = 1;
      await this.refreshTokenRepo.save(row);
    }

    return { ok: true };
  }

  private async issueTokens(
    user: Usuario,
    ip?: string,
    userAgent?: string,
  ) {
    const accessToken = await this.signAccessToken(user);
    const refreshToken = await this.signRefreshToken(user.id);
    const hashed = await bcrypt.hash(refreshToken, 10);
    await this.refreshTokenRepo.save(
      this.refreshTokenRepo.create({
        idUsuario: user.id,
        token: hashed,
        expiresAt: this.refreshExpiresDate(),
        isRevoked: 0,
        ipAddress: ip ?? null,
        userAgent: userAgent ?? null,
      }),
    );
    return { accessToken, refreshToken };
  }

  private async signAccessToken(user: Usuario) {
    const payload: JwtAccessPayload = {
      sub: user.id,
      userName: user.userName,
      roleId: user.idRol,
      email: user.persona?.email ?? null,
      type: 'access',
    };
    return this.jwtService.signAsync(payload, {
      expiresIn: this.config.get('JWT_ACCESS_EXPIRES_IN', '15m') as `${number}m`,
    });
  }

  private async signRefreshToken(userId: string) {
    const payload: JwtRefreshPayload = { sub: userId, type: 'refresh' };
    return this.jwtService.signAsync(payload, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET', ''),
      expiresIn: this.config.get(
        'JWT_REFRESH_EXPIRES_IN',
        '7d',
      ) as `${number}d`,
    });
  }

  private refreshExpiresDate(): Date {
    const raw = this.config
      .get<string>('JWT_REFRESH_EXPIRES_IN', '7d')
      .trim();
    const m = /^(\d+)([dhms])$/i.exec(raw);
    if (!m) {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }
    const n = parseInt(m[1]!, 10);
    const u = m[2]!.toLowerCase();
    let ms = 0;
    if (u === 'd') ms = n * 86400000;
    else if (u === 'h') ms = n * 3600000;
    else if (u === 'm') ms = n * 60000;
    else if (u === 's') ms = n * 1000;
    return new Date(Date.now() + ms);
  }
}
