import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard.js';
import awsConfig from './config/aws.config.js';
import configuration from './config/configuration.js';
import { validate } from './config/validation.schema.js';
import { DatabaseModule } from './database/database.module.js';
import { HealthModule } from './health/health.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { PersonasModule } from './modules/personas/personas.module.js';
import { ProyectosModule } from './modules/proyectos/proyectos.module.js';
import { RolesModule } from './modules/roles/roles.module.js';
import { S3Module } from './modules/s3/s3.module.js';
import { SeedModule } from './modules/seed/seed.module.js';
import { UsuariosModule } from './modules/usuarios/usuarios.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration, awsConfig],
      validate,
    }),
    DatabaseModule,
    HealthModule,
    AuthModule,
    S3Module,
    ProyectosModule,
    RolesModule,
    PersonasModule,
    UsuariosModule,
    SeedModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule {}
