import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AuthRefreshTokensAndReset1774553000000
  implements MigrationInterface
{
  name = 'AuthRefreshTokensAndReset1774553000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`Usuarios\`
      ADD COLUMN \`ResetPasswordToken\` varchar(500) NULL,
      ADD COLUMN \`ResetPasswordExpiresAt\` datetime NULL,
      ADD COLUMN \`LastLoginAt\` datetime NULL
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`RefreshTokens\` (
        \`Id\` bigint NOT NULL AUTO_INCREMENT,
        \`IdUsuario\` bigint NOT NULL,
        \`Token\` text NOT NULL,
        \`ExpiresAt\` datetime NOT NULL,
        \`IsRevoked\` tinyint(1) NOT NULL DEFAULT 0,
        \`IpAddress\` varchar(45) NULL,
        \`UserAgent\` varchar(500) NULL,
        \`CreatedAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`UpdatedAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`Id\`),
        KEY \`IDX_RefreshTokens_IdUsuario\` (\`IdUsuario\`),
        CONSTRAINT \`FK_RefreshTokens_Usuario\`
          FOREIGN KEY (\`IdUsuario\`) REFERENCES \`Usuarios\` (\`Id\`)
          ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS \`RefreshTokens\``);
    await queryRunner.query(`
      ALTER TABLE \`Usuarios\`
      DROP COLUMN \`ResetPasswordToken\`,
      DROP COLUMN \`ResetPasswordExpiresAt\`,
      DROP COLUMN \`LastLoginAt\`
    `);
  }
}
