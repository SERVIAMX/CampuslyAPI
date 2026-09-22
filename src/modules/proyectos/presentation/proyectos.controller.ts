import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { Public } from '../../../common/decorators/public.decorator.js';
import {
  ApiCrudCreate,
  ApiCrudDelete,
  ApiCrudGet,
  ApiCrudList,
  ApiCrudUpdate,
} from '../../../common/swagger/api-crud.decorators.js';
import { PaginationDto } from '../../../common/dto/pagination.dto.js';
import { ProyectosService } from '../application/proyectos.service.js';
import {
  CreateProyectoDto,
  UpdateProyectoDto,
} from './dto/proyecto.dto.js';

@Public()
@ApiTags('proyectos')
@Controller('proyectos')
export class ProyectosController {
  constructor(private readonly proyectosService: ProyectosService) {}

  @Post()
  @ApiCrudCreate('Crear proyecto')
  create(@Body() dto: CreateProyectoDto) {
    return this.proyectosService.create(dto);
  }

  @Get()
  @ApiCrudList('Listar proyectos (paginado)')
  findAll(@Query() pagination: PaginationDto) {
    return this.proyectosService.findAll(pagination);
  }

  @Get(':id')
  @ApiCrudGet('Obtener proyecto por id')
  @ApiParam({ name: 'id', type: Number, example: 1 })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.proyectosService.findOne(id);
  }

  @Patch(':id')
  @ApiCrudUpdate('Actualizar proyecto')
  @ApiParam({ name: 'id', type: Number, example: 1 })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProyectoDto,
  ) {
    return this.proyectosService.update(id, dto);
  }

  @Delete(':id')
  @ApiCrudDelete('Baja lógica de proyecto (estatus = 0)')
  @ApiParam({ name: 'id', type: Number, example: 1 })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.proyectosService.remove(id);
  }
}
