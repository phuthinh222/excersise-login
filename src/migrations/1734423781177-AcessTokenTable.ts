import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateAccessTokensTable1734423781177
  implements MigrationInterface
{
  name = 'CreateAccessTokensTable1734423781177';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const schemaName = 'test';

    await queryRunner.query(`CREATE DATABASE IF NOT EXISTS ${schemaName}`);

    await queryRunner.query(`USE ${schemaName}`);
    await queryRunner.createTable(
      new Table({
        name: 'access_tokens',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'userId',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'token',
            type: 'varchar',
            length: '255',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'expires_at',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
        foreignKeys: [
          {
            columnNames: ['userId'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('access_tokens');
  }
}
