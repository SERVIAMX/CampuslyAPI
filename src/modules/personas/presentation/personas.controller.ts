import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../../../common/decorators/public.decorator.js';
import { PaginationDto } from '../../../common/dto/pagination.dto.js';
import { personaFotografiaInterceptor } from '../../../common/interceptors/persona-fotografia.interceptor.js';
import {
  ApiCrudCreate,
  ApiCrudDelete,
  ApiCrudGet,
  ApiCrudList,
  ApiCrudUpdate,
} from '../../../common/swagger/api-crud.decorators.js';
import { PersonasService } from '../application/personas.service.js';
import { CreatePersonaDto, UpdatePersonaDto } from './dto/persona.dto.js';

const personaFormProperties = {
  curp: { type: 'string', example: 'PEGJ800101HDFRRN09' },
  nombre: { type: 'string', example: 'Juan' },
  apellidoPaterno: { type: 'string', example: 'Pérez' },
  apellidoMaterno: { type: 'string', example: 'García' },
  fechaNacimiento: { type: 'string', example: '1980-01-01' },
  genero: { type: 'string', enum: ['M', 'F', 'Otro'] as string[] },
  email: { type: 'string', example: 'juan@email.com' },
  telefono: { type: 'string', example: '5512345678' },
  fotografia: {
    type: 'string',
    format: 'binary',
    description: 'Imagen → S3 Personas/',
  },
};

@Public()
@ApiTags('personas')
@Controller('personas')
export class PersonasController {
  constructor(private readonly personasService: PersonasService) {}

  @Post()
  @UseInterceptors(personaFotografiaInterceptor)
  @ApiConsumes('multipart/form-data')
  @ApiCrudCreate('Crear persona (solo form-data)')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['curp', 'nombre'],
      properties: { ...personaFormProperties },
    },
  })
  create(
    @Body() dto: CreatePersonaDto,
    @UploadedFile() fotografia?: Express.Multer.File,
  ) {
    return this.personasService.create(dto, fotografia);
  }

  @Get()
  @ApiCrudList('Listar personas (paginado)')
  findAll(@Query() pagination: PaginationDto) {
    return this.personasService.findAll(pagination);
  }

  @Get(':id')
  @ApiCrudGet('Obtener persona por id')
  @ApiParam({ name: 'id', type: String, example: '1' })
  findOne(@Param('id') id: string) {
    return this.personasService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(personaFotografiaInterceptor)
  @ApiConsumes('multipart/form-data')
  @ApiCrudUpdate('Actualizar persona (solo form-data)')
  @ApiParam({ name: 'id', type: String, example: '1' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { ...personaFormProperties },
    },
  })
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePersonaDto,
    @UploadedFile() fotografia?: Express.Multer.File,
  ) {
    return this.personasService.update(id, dto, fotografia);
  }

  @Delete(':id')
  @ApiCrudDelete('Baja lógica de persona (estatus = 0)')
  @ApiParam({ name: 'id', type: String, example: '1' })
  remove(@Param('id') id: string) {
    return this.personasService.remove(id);
  }
}
