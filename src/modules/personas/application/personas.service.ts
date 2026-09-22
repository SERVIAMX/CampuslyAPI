import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { S3_PERSONAS_FOLDER } from '../../../common/constants/s3-folders.constants.js';
import { Estatus } from '../../../common/constants/estatus.constants.js';
import {
  buildPaginatedResult,
  type PaginatedResult,
} from '../../../common/dto/paginated-result.js';
import { PaginationDto } from '../../../common/dto/pagination.dto.js';
import { S3Service } from '../../s3/application/s3.service.js';
import { Persona } from '../domain/persona.entity.js';
import {
  CreatePersonaDto,
  UpdatePersonaDto,
} from '../presentation/dto/persona.dto.js';

@Injectable()
export class PersonasService {
  constructor(
    @InjectRepository(Persona)
    private readonly personasRepo: Repository<Persona>,
    private readonly s3Service: S3Service,
  ) {}

  private async uploadFotografia(
    file?: Express.Multer.File,
  ): Promise<string | undefined> {
    if (!file) return undefined;
    const { url } = await this.s3Service.uploadFile(file, S3_PERSONAS_FOLDER);
    return url;
  }

  async create(
    dto: CreatePersonaDto,
    fotografia?: Express.Multer.File,
  ): Promise<Persona> {
    const fotografiaUrl = await this.uploadFotografia(fotografia);

    const persona = this.personasRepo.create({
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

    try {
      return await this.personasRepo.save(persona);
    } catch (error: unknown) {
      this.rethrowUniqueConflict(error);
    }
  }

  async findAll(
    pagination: PaginationDto,
  ): Promise<PaginatedResult<Persona>> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 20;

    const [items, total] = await this.personasRepo.findAndCount({
      where: { estatus: Estatus.Activo },
      order: { id: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return buildPaginatedResult(items, total, page, limit);
  }

  async findOne(id: string): Promise<Persona> {
    const persona = await this.personasRepo.findOne({ where: { id } });
    if (!persona || persona.estatus === Estatus.Baja) {
      throw new NotFoundException(`Persona ${id} no encontrada`);
    }
    return persona;
  }

  async update(
    id: string,
    dto: UpdatePersonaDto,
    fotografia?: Express.Multer.File,
  ): Promise<Persona> {
    const persona = await this.findOne(id);

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

    const fotografiaUrl = await this.uploadFotografia(fotografia);
    if (fotografiaUrl !== undefined) {
      persona.fotografia = fotografiaUrl;
    }

    try {
      return await this.personasRepo.save(persona);
    } catch (error: unknown) {
      this.rethrowUniqueConflict(error);
    }
  }

  async remove(id: string): Promise<Persona> {
    const persona = await this.findOne(id);
    persona.estatus = Estatus.Baja;
    return this.personasRepo.save(persona);
  }

  private rethrowUniqueConflict(error: unknown): never {
    const err = error as { code?: string; message?: string };
    if (err.code === 'ER_DUP_ENTRY' || err.message?.includes('Duplicate')) {
      throw new ConflictException('CURP o Email ya registrado');
    }
    throw error;
  }
}
