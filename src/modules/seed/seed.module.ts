import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Proyecto } from '../proyectos/domain/proyecto.entity.js';
import { Rol } from '../roles/domain/rol.entity.js';
import { SeedService } from './seed.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Proyecto, Rol])],
  providers: [SeedService],
})
export class SeedModule {}
