import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { Public } from '../../../common/decorators/public.decorator.js';
import { PaginationDto } from '../../../common/dto/pagination.dto.js';
import {
  ApiCrudCreate,
  ApiCrudDelete,
  ApiCrudGet,
  ApiCrudList,
  ApiCrudUpdate,
} from '../../../common/swagger/api-crud.decorators.js';
import { RolesService } from '../application/roles.service.js';
import { CreateRolDto, UpdateRolDto } from './dto/rol.dto.js';

@Public()
@ApiTags('roles')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @ApiCrudCreate('Crear rol')
  create(@Body() dto: CreateRolDto) {
    return this.rolesService.create(dto);
  }

  @Get()
  @ApiCrudList('Listar roles (paginado)')
  findAll(@Query() pagination: PaginationDto) {
    return this.rolesService.findAll(pagination);
  }

  @Get(':id')
  @ApiCrudGet('Obtener rol por id')
  @ApiParam({ name: 'id', type: String, example: '1' })
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Patch(':id')
  @ApiCrudUpdate('Actualizar rol')
  @ApiParam({ name: 'id', type: String, example: '1' })
  update(@Param('id') id: string, @Body() dto: UpdateRolDto) {
    return this.rolesService.update(id, dto);
  }

  @Delete(':id')
  @ApiCrudDelete('Baja lógica de rol (estatus = 0)')
  @ApiParam({ name: 'id', type: String, example: '1' })
  remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }
}
