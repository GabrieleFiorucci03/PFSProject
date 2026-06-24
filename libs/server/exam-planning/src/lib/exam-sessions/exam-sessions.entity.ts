import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import type { ExamEntity } from '../exams/exam.entity';

/**
 * Entità sessione d'esame (tabella `exam_sessions`). Definisce due intervalli:
 * il periodo in cui si tengono gli appelli (`startDate`–`endDate`) e la finestra
 * in cui i docenti possono pianificarli (`planningStartDate`–`planningEndDate`).
 */
@Entity('exam_sessions')
export class ExamSessionEntity {
    @PrimaryGeneratedColumn({ name: 'id' })
    examSessionId: number;

    /** Nome della sessione, univoco (es. "Sessione Estiva 2026"). */
    @Column({ type: 'varchar', length: 100, nullable: false, unique: true })
    name: string;

    /** Inizio del periodo in cui gli appelli possono svolgersi. */
    @Column({ type: 'date', nullable: false })
    startDate: Date;

    /** Fine del periodo in cui gli appelli possono svolgersi. */
    @Column({ type: 'date', nullable: false })
    endDate: Date;

    /** Inizio della finestra in cui i docenti possono pianificare gli appelli. */
    @Column({ type: 'date', nullable: false })
    planningStartDate: Date;

    /** Fine della finestra di pianificazione. */
    @Column({ type: 'date', nullable: false })
    planningEndDate: Date;

    /** Appelli pianificati in questa sessione (relazione inversa). */
    @OneToMany('ExamEntity', (exam: ExamEntity) => exam.examSession)
    exams: ExamEntity[];
}
