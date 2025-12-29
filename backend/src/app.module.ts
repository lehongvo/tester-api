import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { StudentModule } from './student/student.module';
import { User } from './auth/entities/user.entity';
import { Student } from './student/entities/student.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'tester_db',
      entities: [User, Student],
      synchronize: true,
    }),
    AuthModule,
    StudentModule,
  ],
})
export class AppModule {}

