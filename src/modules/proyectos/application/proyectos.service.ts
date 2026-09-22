import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Estatus } from '../../../common/constants/estatus.constants.js';
import { PaginationDto } from '../../../common/dto/pagination.dto.js';
import {
  buildPaginatedResult,
  type PaginatedResult,
} from '../../../common/dto/paginated-result.js';
import { Proyecto } from '../domain/proyecto.entity.js';
import {
  CreateProyectoDto,
  UpdateProyectoDto,
} from '../presentation/dto/proyecto.dto.js';

@Injectable()
export class ProyectosService {
  constructor(
    @InjectRepository(Proyecto)
    private readonly proyectosRepo: Repository<Proyecto>,
  ) {}

  async create(dto: CreateProyectoDto): Promise<Proyecto> {
    const proyecto = this.proyectosRepo.create({
      nombre: dto.nombre,
      estatus: Estatus.Activo,
    });
    return this.proyectosRepo.save(proyecto);
  }

  async findAll(
    pagination: PaginationDto,
  ): Promise<PaginatedResult<Proyecto>> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 20;

    const [items, total] = await this.proyectosRepo.findAndCount({
      where: { estatus: Estatus.Activo },
      order: { id: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return buildPaginatedResult(items, total, page, limit);
  }

  async findOne(id: number): Promise<Proyecto> {
    const proyecto = await this.proyectosRepo.findOne({ where: { id } });
    if (!proyecto || proyecto.estatus === Estatus.Baja) {
      throw new NotFoundException(`Proyecto ${id} no encontrado`);
    }
    return proyecto;
  }

  async update(id: number, dto: UpdateProyectoDto): Promise<Proyecto> {
    const proyecto = await this.findOne(id);
    if (dto.nombre !== undefined) {
      proyecto.nombre = dto.nombre;
    }
    return this.proyectosRepo.save(proyecto);
  }

  async remove(id: number): Promise<Proyecto> {
    const proyecto = await this.findOne(id);
    proyecto.estatus = Estatus.Baja;
    return this.proyectosRepo.save(proyecto);
  }
}
