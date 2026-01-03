import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('vouchers')
export class Voucher {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ unique: true })
  code: string;

  @Index()
  @Column()
  userId: number;

  @Column({ type: 'int' })
  percent: number; // 10..45

  @Column({ default: false })
  used: boolean;

  @Column({ type: 'timestamp', nullable: true })
  usedAt?: Date;

  @Index()
  @Column({ type: 'int', nullable: true })
  usedCourseId?: number;

  @CreateDateColumn()
  createdAt: Date;
}



