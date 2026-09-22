import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProyectosService } from './application/proyectos.service.js';
import { Proyecto } from './domain/proyecto.entity.js';
import { ProyectosController } from './presentation/proyectos.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Proyecto])],
  controllers: [ProyectosController],
  providers: [ProyectosService],
  exports: [TypeOrmModule, ProyectosService],
})
export class ProyectosModule {}
