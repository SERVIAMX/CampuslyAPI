import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Campusly API')
    .setDescription(
      [
        'API de la plataforma de gestión escolar Campusly.',
        '',
        '## Convenciones',
        '- **Eliminar = baja lógica**: `DELETE` pone `estatus = 0` (nunca borra filas).',
        '- **Paginación**: query `page` (default 1) y `limit` (default 20, máx 100).',
        '- **Envelope de respuesta**: `{ success: true, data, timestamp }` (interceptor global).',
        '- **Errores**: `{ success: false, statusCode, path, timestamp, message }`.',
        '',
        '## Seed inicial',
        '- Proyecto: **Administración**',
        '- Rol: **Super Administrador**',
      ].join('\n'),
    )
    .setVersion('0.1.0')
    .addTag('auth', 'Login, tokens y contraseñas')
    .addTag('health', 'Estado del servicio')
    .addTag('proyectos', 'Catálogo CatProyectos')
    .addTag('roles', 'Catálogo CatRoles')
    .addTag('personas', 'Personas (CURP, datos de contacto)')
    .addTag('usuarios', 'Cuentas de acceso (password hasheado)')
    .addTag('s3', 'Subida de archivos')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    useGlobalPrefix: true,
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      filter: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'Campusly API Docs',
  });
}
