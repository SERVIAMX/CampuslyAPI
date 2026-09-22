import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { DataSource, Repository } from 'typeorm';
import { Estatus } from '../../../common/constants/estatus.constants.js';
import { S3_PERSONAS_FOLDER } from '../../../common/constants/s3-folders.constants.js';
import {
  buildPaginatedResult,
  type PaginatedResult,
} from '../../../common/dto/paginated-result.js';
import { PaginationDto } from '../../../common/dto/pagination.dto.js';
import { Persona } from '../../personas/domain/persona.entity.js';
import type {
  CreatePersonaDto,
  UpdatePersonaDto,
} from '../../personas/presentation/dto/persona.dto.js';
import { Rol } from '../../roles/domain/rol.entity.js';
import { S3Service } from '../../s3/application/s3.service.js';
import { Usuario } from '../domain/usuario.entity.js';
import {
  CreateUsuarioDto,
  UpdateUsuarioDto,
} from '../presentation/dto/usuario.dto.js';

const BCRYPT_ROUNDS = 10;

export type UsuarioPublico = Omit<Usuario, 'password'>;

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuariosRepo: Repository<Usuario>,
    @InjectRepository(Persona)
    private readonly personasRepo: Repository<Persona>,
    @InjectRepository(Rol)
    private readonly rolesRepo: Repository<Rol>,
    private readonly dataSource: DataSource,
    private readonly s3Service: S3Service,
  ) {}

  private toPublic(usuario: Usuario): UsuarioPublico {
    const { password: _password, ...rest } = usuario;
    return rest;
  }

  private async uploadFotografia(
    file?: Express.Multer.File,
  ): Promise<string | undefined> {
    if (!file) return undefined;
    const { url } = await this.s3Service.uploadFile(file, S3_PERSONAS_FOLDER);
    return url;
  }

  private toCreatePersonaDto(dto: CreateUsuarioDto): CreatePersonaDto {
    return {
      curp: dto.curp,
      nombre: dto.nombre,
      apellidoPaterno: dto.apellidoPaterno,
      apellidoMaterno: dto.apellidoMaterno,
      fechaNacimiento: dto.fechaNacimiento,
      genero: dto.genero,
      email: dto.email,
      telefono: dto.telefono,
    };
  }

  private toUpdatePersonaDto(dto: UpdateUsuarioDto): UpdatePersonaDto | undefined {
    const hasPersonaFields =
      dto.curp !== undefined ||
      dto.nombre !== undefined ||
      dto.apellidoPaterno !== undefined ||
      dto.apellidoMaterno !== undefined ||
      dto.fechaNacimiento !== undefined ||
      dto.genero !== undefined ||
      dto.email !== undefined ||
      dto.telefono !== undefined;

    if (!hasPersonaFields) return undefined;

    return {
      curp: dto.curp,
      nombre: dto.nombre,
      apellidoPaterno: dto.apellidoPaterno,
      apellidoMaterno: dto.apellidoMaterno,
      fechaNacimiento: dto.fechaNacimiento,
      genero: dto.genero,
      email: dto.email,
      telefono: dto.telefono,
    };
  }

  private buildPersonaEntity(
    dto: CreatePersonaDto,
    fotografiaUrl?: string,
  ): Persona {
    return this.personasRepo.create({
      curp: dto.curp.toUpperCase(),
      nombre: dto.nombre,
      apellidoPaterno: dto.apellidoPaterno ?? null,
      apellidoMaterno: dto.apellidoMaterno ?? null,
      fechaNacimiento: dto.fechaNacimiento ?? null,
      genero: dto.genero ?? null,
      fotografia: fotografiaUrl ?? null,
      email: dto.email ?? null,
      telefono: dto.telefono ?? null,
      estatus: Estatus.Activo,
    });
  }

  private applyPersonaUpdate(
    persona: Persona,
    dto: UpdatePersonaDto,
    fotografiaUrl?: string,
  ): void {
    if (dto.curp !== undefined) persona.curp = dto.curp.toUpperCase();
    if (dto.nombre !== undefined) persona.nombre = dto.nombre;
    if (dto.apellidoPaterno !== undefined) {
      persona.apellidoPaterno = dto.apellidoPaterno;
    }
    if (dto.apellidoMaterno !== undefined) {
      persona.apellidoMaterno = dto.apellidoMaterno;
    }
    if (dto.fechaNacimiento !== undefined) {
      persona.fechaNacimiento = dto.fechaNacimiento;
    }
    if (dto.genero !== undefined) persona.genero = dto.genero;
    if (dto.email !== undefined) persona.email = dto.email;
    if (dto.telefono !== undefined) persona.telefono = dto.telefono;
    if (fotografiaUrl !== undefined) {
      persona.fotografia = fotografiaUrl;
    }
  }

  private async assertRolActivo(idRol: string): Promise<void> {
    const rol = await this.rolesRepo.findOne({ where: { id: idRol } });
    if (!rol || rol.estatus === Estatus.Baja) {
      throw new BadRequestException(
        `Rol ${idRol} no existe o está dado de baja`,
      );
    }
  }

  private rethrowUniqueConflict(error: unknown): never {
    const err = error as { code?: string; message?: string };
    if (err.code === 'ER_DUP_ENTRY' || err.message?.includes('Duplicate')) {
      throw new ConflictException('CURP, Email o UserName ya registrado');
    }
    throw error;
  }

  async create(
    dto: CreateUsuarioDto,
    fotografia?: Express.Multer.File,
  ): Promise<UsuarioPublico> {
    if (dto.idRol) await this.assertRolActivo(dto.idRol);

    const passwordHash = dto.password
      ? await bcrypt.hash(dto.password, BCRYPT_ROUNDS)
      : null;
    const fotografiaUrl = await this.uploadFotografia(fotografia);

    try {
      const savedId = await this.dataSource.transaction(async (manager) => {
        const persona = await manager.save(
          Persona,
          this.buildPersonaEntity(this.toCreatePersonaDto(dto), fotografiaUrl),
        );

        const usuario = manager.create(Usuario, {
          userName: dto.userName,
          password: passwordHash,
          idPersona: persona.id,
          idRol: dto.idRol ?? null,
          estatus: Estatus.Activo,
        });

        const saved = await manager.save(Usuario, usuario);
        return saved.id;
      });

      return this.findOne(savedId);
    } catch (error: unknown) {
      this.rethrowUniqueConflict(error);
    }
  }

  async findAll(
    pagination: PaginationDto,
  ): Promise<PaginatedResult<UsuarioPublico>> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 20;

    const [items, total] = await this.usuariosRepo.findAndCount({
      where: { estatus: Estatus.Activo },
      relations: { persona: true, rol: true },
      order: { id: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return buildPaginatedResult(
      items.map((u) => this.toPublic(u)),
      total,
      page,
      limit,
    );
  }

  async findOne(id: string): Promise<UsuarioPublico> {
    const usuario = await this.usuariosRepo.findOne({
      where: { id },
      relations: { persona: true, rol: true },
    });
    if (!usuario || usuario.estatus === Estatus.Baja) {
      throw new NotFoundException(`Usuario ${id} no encontrado`);
    }
    return this.toPublic(usuario);
  }

  async update(
    id: string,
    dto: UpdateUsuarioDto,
    fotografia?: Express.Multer.File,
  ): Promise<UsuarioPublico> {
    const usuario = await this.usuariosRepo.findOne({
      where: { id },
      relations: { persona: true },
      select: {
        id: true,
        userName: true,
        password: true,
        idPersona: true,
        idRol: true,
        createdAt: true,
        updatedAt: true,
        estatus: true,
        persona: true,
      },
    });
    if (!usuario || usuario.estatus === Estatus.Baja) {
      throw new NotFoundException(`Usuario ${id} no encontrado`);
    }

    if (dto.idRol !== undefined && dto.idRol !== null) {
      await this.assertRolActivo(dto.idRol);
    }

    const fotografiaUrl = await this.uploadFotografia(fotografia);
    const personaDto = this.toUpdatePersonaDto(dto);

    try {
      await this.dataSource.transaction(async (manager) => {
        if (personaDto || fotografiaUrl) {
          if (!usuario.idPersona) {
            throw new BadRequestException(
              'El usuario no tiene persona vinculada para actualizar',
            );
          }
          const persona = await manager.findOne(Persona, {
            where: { id: usuario.idPersona },
          });
          if (!persona || persona.estatus === Estatus.Baja) {
            throw new NotFoundException(
              `Persona ${usuario.idPersona} no encontrada`,
            );
          }
          this.applyPersonaUpdate(persona, personaDto ?? {}, fotografiaUrl);
          await manager.save(Persona, persona);
        }

        if (dto.userName !== undefined) usuario.userName = dto.userName;
        if (dto.idRol !== undefined) usuario.idRol = dto.idRol;
        if (dto.password !== undefined) {
          usuario.password = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
        }

        await manager.save(Usuario, usuario);
      });

      return this.findOne(id);
    } catch (error: unknown) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      this.rethrowUniqueConflict(error);
    }
  }

  async remove(id: string): Promise<UsuarioPublico> {
    const usuario = await this.usuariosRepo.findOne({
      where: { id },
      relations: { persona: true, rol: true },
    });
    if (!usuario || usuario.estatus === Estatus.Baja) {
      throw new NotFoundException(`Usuario ${id} no encontrado`);
    }

    await this.dataSource.transaction(async (manager) => {
      usuario.estatus = Estatus.Baja;
      await manager.save(Usuario, usuario);

      if (usuario.idPersona) {
        const persona = await manager.findOne(Persona, {
          where: { id: usuario.idPersona },
        });
        if (persona && persona.estatus !== Estatus.Baja) {
          persona.estatus = Estatus.Baja;
          await manager.save(Persona, persona);
          usuario.persona = persona;
        }
      }
    });

    return this.toPublic(usuario);
  }
}
