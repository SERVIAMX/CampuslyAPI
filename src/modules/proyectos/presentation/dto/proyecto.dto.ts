import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProyectoDto {
  @ApiProperty({
    description: 'Nombre del proyecto',
    maxLength: 100,
    example: 'Administración',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre!: string;
}

export class UpdateProyectoDto {
  @ApiPropertyOptional({
    description: 'Nombre del proyecto',
    maxLength: 100,
    example: 'Administración',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre?: string;
}
