import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';

@Module({
    imports: [
        TypeOrmModule.forRoot({
          type: "postgres",
          host: process.env.DB_HOST,
          port: parseInt(process.env.DB_PORT || "5432"),
          username: process.env.DB_USERNAME || "firstservice",
          password: process.env.DB_PASSWORD || "firstservice",
          database: process.env.DB_NAME || "db_first_service",
          entities: [User],
          synchronize: true,
        }),
    ]
})
export class DatabaseModule {}
