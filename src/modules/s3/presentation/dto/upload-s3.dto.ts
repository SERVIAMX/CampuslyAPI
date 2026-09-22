import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { S3_FOLDERS } from '../../../../common/constants/s3-folders.constants.js';

export class UploadS3Dto {
  @ApiProperty({
    description: 'Carpeta destino en el bucket',
    enum: S3_FOLDERS,
    example: 'Personas',
  })
  @IsNotEmpty()
  @IsString()
  @IsIn([...S3_FOLDERS], {
    message: `folder debe ser uno de: ${S3_FOLDERS.join(', ')}`,
  })
  folder!: string;
}
