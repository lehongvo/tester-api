import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

export enum PaymentStatus {
  Paid = 'paid',
  Pending = 'pending',
  Failed = 'failed',
}

@Entity('enrollments')
export class Enrollment {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  userId: number;

  @Index()
  @Column()
  courseId: number;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.Paid })
  paymentStatus: PaymentStatus;

  @CreateDateColumn()
  enrolledAt: Date;
}

