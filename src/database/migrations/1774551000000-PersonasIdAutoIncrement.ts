import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Agrega AUTO_INCREMENT a Personas.Id sin borrar datos.
 * Requiere soltar temporalmente FK_Usuario_Persona.
 */
export class PersonasIdAutoIncrement1774551000000
  implements MigrationInterface
{
  name = 'PersonasIdAutoIncrement1774551000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const fkRows: Array<{ CONSTRAINT_NAME: string }> =
      await queryRunner.query(`
        SELECT CONSTRAINT_NAME
        FROM information_schema.TABLE_CONSTRAINTS
        WHERE CONSTRAINT_SCHEMA = DATABASE()
          AND TABLE_NAME = 'Usuarios'
          AND CONSTRAINT_TYPE = 'FOREIGN KEY'
          AND CONSTRAINT_NAME = 'FK_Usuario_Persona'
      `);

    if (fkRows.length > 0) {
      await queryRunner.query(
        `ALTER TABLE \`Usuarios\` DROP FOREIGN KEY \`FK_Usuario_Persona\``,
      );
    }

    await queryRunner.query(`
      ALTER TABLE \`Personas\`
      MODIFY \`Id\` bigint NOT NULL AUTO_INCREMENT
    `);

    const maxRows: Array<{ maxId: string | null }> = await queryRunner.query(`
      SELECT MAX(\`Id\`) AS maxId FROM \`Personas\`
    `);
    const next = Number(maxRows[0]?.maxId ?? 0) + 1;
    await queryRunner.query(
      `ALTER TABLE \`Personas\` AUTO_INCREMENT = ${next}`,
    );

    await queryRunner.query(`
      ALTER TABLE \`Usuarios\`
      ADD CONSTRAINT \`FK_Usuario_Persona\`
      FOREIGN KEY (\`IdPersona\`) REFERENCES \`Personas\` (\`Id\`)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`Usuarios\` DROP FOREIGN KEY \`FK_Usuario_Persona\``,
    );

    await queryRunner.query(`
      ALTER TABLE \`Personas\`
      MODIFY \`Id\` bigint NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE \`Usuarios\`
      ADD CONSTRAINT \`FK_Usuario_Persona\`
      FOREIGN KEY (\`IdPersona\`) REFERENCES \`Personas\` (\`Id\`)
    `);
  }
}
