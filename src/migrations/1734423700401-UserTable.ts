import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import * as bcrypt from 'bcrypt';

export class CreateUserTable1734423700401 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const schemaName = 'test';

    await queryRunner.query(`CREATE DATABASE IF NOT EXISTS ${schemaName}`);

    await queryRunner.query(`USE ${schemaName}`);

    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'username',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'password',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
    );
    const saltRounds = 10;
    const hashedPasswords = await Promise.all([
      bcrypt.hash('password123', saltRounds),
      bcrypt.hash('1234abcd', saltRounds),
      bcrypt.hash('pass012', saltRounds),
    ]);

    await queryRunner.query(`
      INSERT INTO ${schemaName}.users(username, password, created_at, updated_at)
      VALUES
        ('john', '${hashedPasswords[0]}',CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('admin', '${hashedPasswords[1]}',CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('arad', '${hashedPasswords[2]}',CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const schemaName = 'test';

    // Drop the table from the specific schema
    await queryRunner.query(`USE ${schemaName}`);
    await queryRunner.dropTable('user');
  }
}
