import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Fotografia deja de ser BLOB: se guarda la URL de S3 (carpeta Personas/).
 */
export class PersonasFotografiaUrl1774552000000 implements MigrationInterface {
  name = 'PersonasFotografiaUrl1774552000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE \`Personas\` SET \`Fotografia\` = NULL WHERE \`Fotografia\` IS NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE \`Personas\`
      MODIFY \`Fotografia\` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE \`Personas\` SET \`Fotografia\` = NULL WHERE \`Fotografia\` IS NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE \`Personas\`
      MODIFY \`Fotografia\` longblob NULL
    `);
  }
}
