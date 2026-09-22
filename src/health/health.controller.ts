import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator.js';
import { HealthService } from './health.service.js';

@Public()
@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Health check del servicio' })
  @ApiOkResponse({
    description: 'Servicio en línea',
    schema: {
      example: {
        success: true,
        data: {
          status: 'ok',
          service: 'CampuslyAPI',
          database: 'up',
        },
        timestamp: '2026-09-22T20:00:00.000Z',
      },
    },
  })
  check() {
    return this.healthService.check();
  }
}
