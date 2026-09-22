import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonasModule } from '../personas/personas.module.js';
import { RolesModule } from '../roles/roles.module.js';
import { S3Module } from '../s3/s3.module.js';
import { UsuariosService } from './application/usuarios.service.js';
import { Usuario } from './domain/usuario.entity.js';
import { UsuariosController } from './presentation/usuarios.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario]),
    PersonasModule,
    RolesModule,
    S3Module,
  ],
  controllers: [UsuariosController],
  providers: [UsuariosService],
  exports: [TypeOrmModule, UsuariosService],
})
export class UsuariosModule {}
