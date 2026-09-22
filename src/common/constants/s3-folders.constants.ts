/** Carpeta S3 para fotografías de Personas. */
export const S3_PERSONAS_FOLDER = 'Personas';

export const S3_FOLDERS = [S3_PERSONAS_FOLDER] as const;

export type S3Folder = (typeof S3_FOLDERS)[number];
