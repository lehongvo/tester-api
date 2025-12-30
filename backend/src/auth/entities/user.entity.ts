import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { Role } from './role.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true, nullable: true })
  email?: string;

  @Column({ nullable: true })
  fullName?: string;

  @Column({ nullable: true })
  studentId?: string;

  @Column({ type: 'enum', enum: Role, default: Role.Student })
  role: Role;

  @Column()
  password: string;

  @CreateDateColumn()
  createdAt: Date;
}

