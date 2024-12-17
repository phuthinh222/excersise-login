import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { User } from './users/users.entity';
import { ConfigModule } from '@nestjs/config';
import { RefreshToken } from 'users/refresh-token.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'test',
      entities: [User, RefreshToken],
      synchronize: false,
      migrations: [__dirname + '/migrations/*.ts'],
    }),
    AuthModule,
    UsersModule,
  ],
})
export class AppModule {}
