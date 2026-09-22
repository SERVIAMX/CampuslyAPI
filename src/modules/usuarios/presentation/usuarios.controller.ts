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
import { UsuariosService } from '../application/usuarios.service.js';
import { CreateUsuarioDto, UpdateUsuarioDto } from './dto/usuario.dto.js';

const usuarioFormProperties = {
  userName: { type: 'string', example: 'superadmin' },
  password: { type: 'string', example: 'Secret123' },
  idRol: { type: 'string', example: '1' },
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
    description: 'Foto → S3 Personas/',
  },
};

@Public()
@ApiTags('usuarios')
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  @UseInterceptors(personaFotografiaInterceptor)
  @ApiConsumes('multipart/form-data')
  @ApiCrudCreate('Crear usuario + persona (solo form-data)')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['userName', 'curp', 'nombre'],
      properties: { ...usuarioFormProperties },
    },
  })
  create(
    @Body() dto: CreateUsuarioDto,
    @UploadedFile() fotografia?: Express.Multer.File,
  ) {
    return this.usuariosService.create(dto, fotografia);
  }

  @Get()
  @ApiCrudList('Listar usuarios (paginado)')
  findAll(@Query() pagination: PaginationDto) {
    return this.usuariosService.findAll(pagination);
  }

  @Get(':id')
  @ApiCrudGet('Obtener usuario por id')
  @ApiParam({ name: 'id', type: String, example: '1' })
  findOne(@Param('id') id: string) {
    return this.usuariosService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(personaFotografiaInterceptor)
  @ApiConsumes('multipart/form-data')
  @ApiCrudUpdate('Actualizar usuario / persona (solo form-data)')
  @ApiParam({ name: 'id', type: String, example: '1' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { ...usuarioFormProperties },
    },
  })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUsuarioDto,
    @UploadedFile() fotografia?: Express.Multer.File,
  ) {
    return this.usuariosService.update(id, dto, fotografia);
  }

  @Delete(':id')
  @ApiCrudDelete('Baja lógica de usuario y persona (estatus = 0)')
  @ApiParam({ name: 'id', type: String, example: '1' })
  remove(@Param('id') id: string) {
    return this.usuariosService.remove(id);
  }
}
