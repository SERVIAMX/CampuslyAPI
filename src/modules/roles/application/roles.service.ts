import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Estatus } from '../../../common/constants/estatus.constants.js';
import {
  buildPaginatedResult,
  type PaginatedResult,
} from '../../../common/dto/paginated-result.js';
import { PaginationDto } from '../../../common/dto/pagination.dto.js';
import { Proyecto } from '../../proyectos/domain/proyecto.entity.js';
import { Rol } from '../domain/rol.entity.js';
import { CreateRolDto, UpdateRolDto } from '../presentation/dto/rol.dto.js';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Rol)
    private readonly rolesRepo: Repository<Rol>,
    @InjectRepository(Proyecto)
    private readonly proyectosRepo: Repository<Proyecto>,
  ) {}

  private async assertProyectoActivo(idProyecto: number): Promise<void> {
    const proyecto = await this.proyectosRepo.findOne({
      where: { id: idProyecto },
    });
    if (!proyecto || proyecto.estatus === Estatus.Baja) {
      throw new BadRequestException(
        `Proyecto ${idProyecto} no existe o está dado de baja`,
      );
    }
  }

  async create(dto: CreateRolDto): Promise<Rol> {
    await this.assertProyectoActivo(dto.idProyecto);
    const rol = this.rolesRepo.create({
      nombre: dto.nombre,
      idProyecto: dto.idProyecto,
      estatus: Estatus.Activo,
    });
    return this.rolesRepo.save(rol);
  }

  async findAll(pagination: PaginationDto): Promise<PaginatedResult<Rol>> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 20;

    const [items, total] = await this.rolesRepo.findAndCount({
      where: { estatus: Estatus.Activo },
      relations: { proyecto: true },
      order: { id: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return buildPaginatedResult(items, total, page, limit);
  }

  async findOne(id: string): Promise<Rol> {
    const rol = await this.rolesRepo.findOne({
      where: { id },
      relations: { proyecto: true },
    });
    if (!rol || rol.estatus === Estatus.Baja) {
      throw new NotFoundException(`Rol ${id} no encontrado`);
    }
    return rol;
  }

  async update(id: string, dto: UpdateRolDto): Promise<Rol> {
    const rol = await this.findOne(id);
    if (dto.idProyecto !== undefined) {
      await this.assertProyectoActivo(dto.idProyecto);
      rol.idProyecto = dto.idProyecto;
    }
    if (dto.nombre !== undefined) {
      rol.nombre = dto.nombre;
    }
    return this.rolesRepo.save(rol);
  }

  async remove(id: string): Promise<Rol> {
    const rol = await this.findOne(id);
    rol.estatus = Estatus.Baja;
    return this.rolesRepo.save(rol);
  }
}
