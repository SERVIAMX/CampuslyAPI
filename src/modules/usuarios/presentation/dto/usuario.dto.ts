import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Form-data plano: usuario + datos de persona (sin JSON anidado). */
export class CreateUsuarioDto {
  @ApiProperty({ example: 'superadmin', maxLength: 200 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  userName!: string;

  @ApiPropertyOptional({ example: 'Secret123', minLength: 6, maxLength: 200 })
  @IsOptional()
  @IsString()
  @MinLength(6)
  @MaxLength(200)
  password?: string;

  @ApiPropertyOptional({ example: '1', description: 'Id de CatRoles' })
  @IsOptional()
  @IsString()
  idRol?: string;

  @ApiProperty({
    description: 'CURP de la persona',
    example: 'PEGJ800101HDFRRN09',
    maxLength: 18,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(18)
  @Matches(/^[A-Z0-9]{18}$/i, {
    message: 'CURP debe tener 18 caracteres alfanuméricos',
  })
  curp!: string;

  @ApiProperty({ example: 'Juan', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre!: string;

  @ApiPropertyOptional({ example: 'Pérez', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  apellidoPaterno?: string;

  @ApiPropertyOptional({ example: 'García', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  apellidoMaterno?: string;

  @ApiPropertyOptional({ example: '1980-01-01' })
  @IsOptional()
  @IsDateString()
  fechaNacimiento?: string;

  @ApiPropertyOptional({ enum: ['M', 'F', 'Otro'], example: 'M' })
  @IsOptional()
  @IsEnum(['M', 'F', 'Otro'])
  genero?: 'M' | 'F' | 'Otro';

  @ApiPropertyOptional({ example: 'juan.perez@email.com', maxLength: 100 })
  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  email?: string;

  @ApiPropertyOptional({ example: '5512345678', maxLength: 20 })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefono?: string;
}

export class UpdateUsuarioDto {
  @ApiPropertyOptional({ example: 'superadmin', maxLength: 200 })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  userName?: string;

  @ApiPropertyOptional({ minLength: 6, maxLength: 200 })
  @IsOptional()
  @IsString()
  @MinLength(6)
  @MaxLength(200)
  password?: string;

  @ApiPropertyOptional({ example: '1', nullable: true })
  @IsOptional()
  @IsString()
  idRol?: string | null;

  @ApiPropertyOptional({ example: 'PEGJ800101HDFRRN09', maxLength: 18 })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(18)
  @Matches(/^[A-Z0-9]{18}$/i, {
    message: 'CURP debe tener 18 caracteres alfanuméricos',
  })
  curp?: string;

  @ApiPropertyOptional({ example: 'Juan', maxLength: 100 })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre?: string;

  @ApiPropertyOptional({ example: 'Pérez', maxLength: 100, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  apellidoPaterno?: string | null;

  @ApiPropertyOptional({ example: 'García', maxLength: 100, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  apellidoMaterno?: string | null;

  @ApiPropertyOptional({ example: '1980-01-01', nullable: true })
  @IsOptional()
  @IsDateString()
  fechaNacimiento?: string | null;

  @ApiPropertyOptional({
    enum: ['M', 'F', 'Otro'],
    example: 'M',
    nullable: true,
  })
  @IsOptional()
  @IsEnum(['M', 'F', 'Otro'])
  genero?: 'M' | 'F' | 'Otro' | null;

  @ApiPropertyOptional({
    example: 'juan.perez@email.com',
    maxLength: 100,
    nullable: true,
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  email?: string | null;

  @ApiPropertyOptional({ example: '5512345678', maxLength: 20, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefono?: string | null;
}
