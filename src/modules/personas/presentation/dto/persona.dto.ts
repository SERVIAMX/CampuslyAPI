import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePersonaDto {
  @ApiProperty({
    description: 'CURP (18 caracteres)',
    maxLength: 18,
    example: 'PEGJ800101HDFRRN09',
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

  @ApiPropertyOptional({
    description: 'Fecha ISO (YYYY-MM-DD)',
    example: '1980-01-01',
  })
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

export class UpdatePersonaDto {
  @ApiPropertyOptional({
    description: 'CURP (18 caracteres)',
    maxLength: 18,
    example: 'PEGJ800101HDFRRN09',
  })
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

  @ApiPropertyOptional({
    description: 'Fecha ISO (YYYY-MM-DD)',
    example: '1980-01-01',
    nullable: true,
  })
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
