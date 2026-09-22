import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // Solo true con el literal "true". Nunca usar Boolean("false") ni sync implícito.
        const synchronize = process.env.DB_SYNC === 'true';

        return {
          type: 'mysql' as const,
          host: configService.getOrThrow<string>('database.host'),
          port: configService.getOrThrow<number>('database.port'),
          username: configService.getOrThrow<string>('database.username'),
          password: configService.getOrThrow<string>('database.password'),
          database: configService.getOrThrow<string>('database.name'),
          autoLoadEntities: true,
          synchronize,
          logging: configService.get<boolean>('database.logging') ?? false,
        };
      },
    }),
  ],
})
export class DatabaseModule {}
