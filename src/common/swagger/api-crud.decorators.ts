import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

const errorSchema = {
  type: 'object' as const,
  properties: {
    success: { type: 'boolean', example: false },
    statusCode: { type: 'number', example: 400 },
    path: { type: 'string', example: '/proyectos' },
    timestamp: { type: 'string', example: '2026-09-22T20:00:00.000Z' },
    message: {
      oneOf: [
        { type: 'string' },
        { type: 'array', items: { type: 'string' } },
      ],
    },
  },
};

export function ApiCrudCreate(summary: string) {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiCreatedResponse({
      description: 'Registro creado. Envelope: `{ success, data, timestamp }`.',
    }),
    ApiBadRequestResponse({
      description: 'Validación fallida',
      schema: errorSchema,
    }),
    ApiConflictResponse({
      description: 'Conflicto de unicidad',
      schema: errorSchema,
    }),
  );
}

export function ApiCrudList(summary: string) {
  return applyDecorators(
    ApiOperation({
      summary,
      description:
        'Lista solo registros con `estatus = 1`. Respuesta: `{ items, meta }`.',
    }),
    ApiOkResponse({
      description: 'Lista paginada',
    }),
  );
}

export function ApiCrudGet(summary: string) {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiOkResponse({ description: 'Registro encontrado' }),
    ApiNotFoundResponse({
      description: 'No encontrado o dado de baja',
      schema: errorSchema,
    }),
  );
}

export function ApiCrudUpdate(summary: string) {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiOkResponse({ description: 'Registro actualizado' }),
    ApiBadRequestResponse({
      description: 'Validación fallida',
      schema: errorSchema,
    }),
    ApiNotFoundResponse({
      description: 'No encontrado o dado de baja',
      schema: errorSchema,
    }),
    ApiConflictResponse({
      description: 'Conflicto de unicidad',
      schema: errorSchema,
    }),
  );
}

export function ApiCrudDelete(summary: string) {
  return applyDecorators(
    ApiOperation({
      summary,
      description: 'Baja lógica: asigna `estatus = 0`. No elimina la fila.',
    }),
    ApiOkResponse({ description: 'Registro dado de baja' }),
    ApiNotFoundResponse({
      description: 'No encontrado o ya dado de baja',
      schema: errorSchema,
    }),
  );
}
