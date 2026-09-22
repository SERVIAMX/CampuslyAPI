import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { S3Module } from '../s3/s3.module.js';
import { PersonasService } from './application/personas.service.js';
import { Persona } from './domain/persona.entity.js';
import { PersonasController } from './presentation/personas.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Persona]), S3Module],
  controllers: [PersonasController],
  providers: [PersonasService],
  exports: [TypeOrmModule, PersonasService],
})
export class PersonasModule {}
