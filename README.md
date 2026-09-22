# CampuslyAPI

API NestJS 12 — **Modular Monolith + Clean Layers** con TypeORM y MySQL.

## Stack

- NestJS 12 (ESM)
- TypeORM + MySQL (`mysql2`)
- `@nestjs/config` + validación de entorno
- AWS S3 (`@aws-sdk/client-s3`) — fotos en carpeta `Personas/`
- Prefijo global `api` (`/api/...`)
- Swagger UI (`@nestjs/swagger`) en `/api/docs`
- Vitest + oxlint

## Arquitectura

Monolito modular: cada feature futuro vive en `src/modules/<feature>/` con capas:

```
presentation/     → controllers, DTOs HTTP
application/      → services / use cases
domain/           → entidades, puertos (interfaces)
infrastructure/   → repositorios TypeORM, adapters
```

Regla de dependencia: `presentation → application → domain ← infrastructure`.

### Estructura actual

```
src/
  main.ts
  app.module.ts
  config/           # env tipado, validación, DataSource CLI
  database/         # TypeOrmModule.forRootAsync + migrations/
  common/           # filters, interceptors, DTOs compartidos
  health/           # GET /api/health (técnico, no dominio)
  modules/          # vacío — features de negocio aquí
```

No hay módulos de dominio todavía. Solo infraestructura transversal.

## Primeros pasos

```bash
cp .env.example .env
# Ajusta DB_* y crea la base MySQL

npm install
npm run start:dev
```

Health check: `GET http://localhost:3000/api/health`

Swagger UI: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)  
OpenAPI JSON: [http://localhost:3000/api/docs-json](http://localhost:3000/api/docs-json)

## Path aliases

Configurados en `tsconfig.json` (IDE + Vitest vía `vite-tsconfig-paths`):

| Alias | Ruta |
|-------|------|
| `@config/*` | `src/config/*` |
| `@common/*` | `src/common/*` |
| `@modules/*` | `src/modules/*` |
| `@database/*` | `src/database/*` |

Con Nest ESM (`nodenext`) el runtime usa imports relativos con extensión `.js`. En features nuevos puedes usar los aliases en tests; en código de producción preferir relativos o `npm run build` (incluye `tsc-alias`).

## Cómo añadir un feature

1. Crear `src/modules/<nombre>/` con las cuatro capas.
2. Nest module que registre controllers, providers y `TypeOrmModule.forFeature([...])`.
3. Importar el módulo en `AppModule`.
4. Entidades TypeORM solo dentro del feature; migraciones vía CLI.

Ejemplo de carpetas:

```
src/modules/users/
  users.module.ts
  presentation/users.controller.ts
  presentation/dto/
  application/users.service.ts
  domain/user.entity.ts
  domain/ports/user.repository.ts
  infrastructure/typeorm-user.repository.ts
```

## Migraciones

```bash
npm run migration:generate -- src/database/migrations/NombreMigracion
npm run migration:run
npm run migration:revert
```

`synchronize` solo vía `DB_SYNC=true` (nunca en producción).

## Scripts

| Script | Uso |
|--------|-----|
| `start:dev` | desarrollo con watch |
| `build` | compilar a `dist/` |
| `start:prod` | ejecutar build |
| `lint` / `test` | oxlint / vitest |
| `migration:*` | TypeORM CLI |

## Convenciones

1. Un feature = un Nest module bajo `src/modules/`.
2. Config por entorno (`.env`); nunca credenciales en el repo.
3. Respuestas HTTP uniformes (`TransformInterceptor`); errores vía `HttpExceptionFilter`.
4. `ValidationPipe` global: `whitelist`, `forbidNonWhitelisted`, `transform`.
