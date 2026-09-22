import type { MigrationInterface, QueryRunner } from 'typeorm';

export class InitCoreCatalogs1774550000000 implements MigrationInterface {
  name = 'InitCoreCatalogs1774550000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`CatProyectos\` (
        \`Id\` int NOT NULL AUTO_INCREMENT,
        \`Nombre\` varchar(100) DEFAULT NULL,
        \`Estatus\` tinyint DEFAULT '1',
        \`CreatedAt\` datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`Id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`CatRoles\` (
        \`Id\` bigint NOT NULL AUTO_INCREMENT,
        \`Nombre\` varchar(100) NOT NULL,
        \`IdProyecto\` int NOT NULL,
        \`Estatus\` tinyint DEFAULT '1',
        \`CreatedAt\` datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`Id\`),
        KEY \`FK_Rol_Proyecto_idx\` (\`IdProyecto\`),
        CONSTRAINT \`FK_Rol_Proyecto\` FOREIGN KEY (\`IdProyecto\`) REFERENCES \`CatProyectos\` (\`Id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`Personas\` (
        \`Id\` bigint NOT NULL,
        \`CURP\` varchar(18) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
        \`Nombre\` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
        \`ApellidoPaterno\` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
        \`ApellidoMaterno\` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
        \`FechaNacimiento\` date DEFAULT NULL,
        \`Genero\` enum('M','F','Otro') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
        \`Fotografia\` longblob,
        \`Email\` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
        \`Telefono\` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
        \`CreatedAt\` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
        \`Estatus\` tinyint DEFAULT '1',
        PRIMARY KEY (\`Id\`),
        UNIQUE KEY \`CURP\` (\`CURP\`),
        UNIQUE KEY \`Email\` (\`Email\`),
        KEY \`IDX_Persona_CURP\` (\`CURP\`),
        KEY \`IDX_Persona_Email\` (\`Email\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`Usuarios\` (
        \`Id\` bigint NOT NULL AUTO_INCREMENT,
        \`UserName\` varchar(200) NOT NULL,
        \`Password\` varchar(500) DEFAULT NULL,
        \`IdPersona\` bigint DEFAULT NULL,
        \`IdRol\` bigint DEFAULT NULL,
        \`CreatedAt\` datetime DEFAULT CURRENT_TIMESTAMP,
        \`UpdatedAt\` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`Estatus\` tinyint DEFAULT '1',
        PRIMARY KEY (\`Id\`),
        KEY \`FK_Usuario_Rol_idx\` (\`IdRol\`),
        KEY \`FK_Usuario_Persona_idx\` (\`IdPersona\`),
        CONSTRAINT \`FK_Usuario_Persona\` FOREIGN KEY (\`IdPersona\`) REFERENCES \`Personas\` (\`Id\`),
        CONSTRAINT \`FK_Usuario_Rol\` FOREIGN KEY (\`IdRol\`) REFERENCES \`CatRoles\` (\`Id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);

    await queryRunner.query(`
      INSERT INTO \`CatProyectos\` (\`Nombre\`, \`Estatus\`)
      SELECT 'Administración', 1
      FROM DUAL
      WHERE NOT EXISTS (
        SELECT 1 FROM \`CatProyectos\` WHERE \`Nombre\` = 'Administración'
      )
    `);

    await queryRunner.query(`
      INSERT INTO \`CatRoles\` (\`Nombre\`, \`IdProyecto\`, \`Estatus\`)
      SELECT 'Super Administrador', p.\`Id\`, 1
      FROM \`CatProyectos\` p
      WHERE p.\`Nombre\` = 'Administración'
        AND NOT EXISTS (
          SELECT 1 FROM \`CatRoles\` r
          WHERE r.\`Nombre\` = 'Super Administrador' AND r.\`IdProyecto\` = p.\`Id\`
        )
      LIMIT 1
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS \`Usuarios\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`Personas\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`CatRoles\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`CatProyectos\``);
  }
}
