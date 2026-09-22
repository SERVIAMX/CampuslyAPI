import { BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

const ALLOWED = new Set([
  'image/png',
  'image/jpg',
  'image/jpeg',
  'image/webp',
]);

/** Campo multipart `fotografia` → S3 carpeta Personas. */
export const personaFotografiaInterceptor = FileInterceptor('fotografia', {
  storage: memoryStorage(),
  limits: {
    fileSize: Number(process.env.UPLOAD_MAX_SIZE) || 10 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED.has(file.mimetype)) {
      return cb(
        new BadRequestException(
          'Solo se permiten imágenes PNG, JPG o WEBP',
        ) as unknown as Error,
        false,
      );
    }
    cb(null, true);
  },
});
