import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import type { ExamEntity } from '../exams/exam.entity';

@Entity('exam_sessions')
export class ExamSessionEntity {
    @PrimaryGeneratedColumn({ name: 'id' })
    examSessionId: number;

    @Column({ type: 'varchar', length: 100, nullable: false, unique: true })
    name: string;

    @Column({ type: 'date', nullable: false })
    startDate: Date;

    @Column({ type: 'date', nullable: false })
    endDate: Date;

    @Column({ type: 'date', nullable: false })
    planningStartDate: Date;

    @Column({ type: 'date', nullable: false })
    planningEndDate: Date;

    @OneToMany('ExamEntity', (exam: ExamEntity) => exam.examSession)
    exams: ExamEntity[];
}
