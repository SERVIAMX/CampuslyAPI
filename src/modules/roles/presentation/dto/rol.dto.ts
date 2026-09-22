import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRolDto {
  @ApiProperty({
    description: 'Nombre del rol',
    maxLength: 100,
    example: 'Super Administrador',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre!: string;

  @ApiProperty({
    description: 'Id del proyecto (CatProyectos)',
    minimum: 1,
    example: 1,
  })
  @IsInt()
  @Min(1)
  idProyecto!: number;
}

export class UpdateRolDto {
  @ApiPropertyOptional({
    description: 'Nombre del rol',
    maxLength: 100,
    example: 'Super Administrador',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre?: string;

  @ApiPropertyOptional({
    description: 'Id del proyecto (CatProyectos)',
    minimum: 1,
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  idProyecto?: number;
}
