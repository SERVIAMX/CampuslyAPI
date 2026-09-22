import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProyectosModule } from '../proyectos/proyectos.module.js';
import { RolesService } from './application/roles.service.js';
import { Rol } from './domain/rol.entity.js';
import { RolesController } from './presentation/roles.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Rol]), ProyectosModule],
  controllers: [RolesController],
  providers: [RolesService],
  exports: [TypeOrmModule, RolesService],
})
export class RolesModule {}
