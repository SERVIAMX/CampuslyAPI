import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Estatus } from '../../common/constants/estatus.constants.js';
import {
  PROYECTO_LOGIN_NOMBRES,
  ProyectoLogin,
} from '../../common/constants/proyecto-login.constants.js';
import { Proyecto } from '../proyectos/domain/proyecto.entity.js';
import { Rol } from '../roles/domain/rol.entity.js';

const ROL_SUPER_ADMIN = 'Super Administrador';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Proyecto)
    private readonly proyectosRepo: Repository<Proyecto>,
    @InjectRepository(Rol)
    private readonly rolesRepo: Repository<Rol>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.ensureProyectosLogin();
    await this.ensureRolSuperAdmin();
  }

  private async ensureProyectosLogin(): Promise<void> {
    for (const [idStr, nombre] of Object.entries(PROYECTO_LOGIN_NOMBRES)) {
      const id = Number(idStr);
      let proyecto = await this.proyectosRepo.findOne({ where: { id } });

      if (!proyecto) {
        // Inserta forzando Id si la tabla está vacía o el Id libre
        await this.proyectosRepo.query(
          `INSERT INTO CatProyectos (Id, Nombre, Estatus)
           SELECT ?, ?, ?
           FROM DUAL
           WHERE NOT EXISTS (SELECT 1 FROM CatProyectos WHERE Id = ?)`,
          [id, nombre, Estatus.Activo, id],
        );
        proyecto = await this.proyectosRepo.findOne({ where: { id } });
        if (proyecto) {
          this.logger.log(`Seed: proyecto "${nombre}" (Id=${id}) creado`);
        } else {
          // Fallback: crear sin Id fijo si el Id ya está ocupado por otro nombre
          const byName = await this.proyectosRepo.findOne({ where: { nombre } });
          if (!byName) {
            const created = await this.proyectosRepo.save(
              this.proyectosRepo.create({ nombre, estatus: Estatus.Activo }),
            );
            this.logger.warn(
              `Seed: proyecto "${nombre}" creado con Id=${created.id} (se esperaba ${id})`,
            );
          }
        }
        continue;
      }

      if (proyecto.nombre !== nombre) {
        proyecto.nombre = nombre;
        await this.proyectosRepo.save(proyecto);
        this.logger.log(`Seed: proyecto Id=${id} renombrado a "${nombre}"`);
      }
      if (proyecto.estatus === Estatus.Baja) {
        proyecto.estatus = Estatus.Activo;
        await this.proyectosRepo.save(proyecto);
        this.logger.log(`Seed: proyecto "${nombre}" reactivado`);
      }
    }
  }

  private async ensureRolSuperAdmin(): Promise<void> {
    const idProyecto = ProyectoLogin.GestionWeb;
    const rolExistente = await this.rolesRepo.findOne({
      where: { nombre: ROL_SUPER_ADMIN, idProyecto },
    });

    if (!rolExistente) {
      const rol = await this.rolesRepo.save(
        this.rolesRepo.create({
          nombre: ROL_SUPER_ADMIN,
          idProyecto,
          estatus: Estatus.Activo,
        }),
      );
      this.logger.log(
        `Seed: rol "${ROL_SUPER_ADMIN}" creado (Id=${rol.id}, IdProyecto=${idProyecto})`,
      );
      return;
    }

    if (rolExistente.estatus === Estatus.Baja) {
      rolExistente.estatus = Estatus.Activo;
      await this.rolesRepo.save(rolExistente);
      this.logger.log(`Seed: rol "${ROL_SUPER_ADMIN}" reactivado`);
    }
  }
}
