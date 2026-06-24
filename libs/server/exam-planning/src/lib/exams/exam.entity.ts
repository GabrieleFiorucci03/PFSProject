import { SubjectEntity } from '../subjects/subject.entity';
import { Entity, ManyToOne, PrimaryGeneratedColumn, Unique, Column } from 'typeorm';
import { TeacherEntity } from '../teachers/teacher.entity';
import { ExamType } from './dto/exam-type.enum';
import { RoomType } from './dto/room-type.enum';
import { ExamSessionEntity } from '../exam-sessions/exam-sessions.entity';

/**
 * Entità appello d'esame (tabella `exams`). Collega una materia, una sessione e
 * il docente, in una certa data e fascia oraria. Il vincolo `@Unique(['date','subject'])`
 * impedisce due appelli della stessa materia nello stesso giorno.
 */
@Entity('exams')
@Unique(['date', 'subject'])
export class ExamEntity {

    @PrimaryGeneratedColumn({ name: 'id' })
    examId: number;

    @Column({ type: 'date', nullable: false })
    date: Date;

    @Column({ type: 'int', nullable: false })
    startHour: number;

    @Column({ type: 'int', nullable: false })
    endHour: number;

    @Column({ type: 'enum', enum: RoomType, nullable: false })
    roomType: RoomType;

    @Column({ type: 'enum', enum: ExamType })
    type: ExamType;

    @ManyToOne(() => SubjectEntity, (subject) => subject.exams, {
        nullable: false,
        eager: true,
        onDelete: 'RESTRICT',
    })
    subject: SubjectEntity;

    @ManyToOne(() => ExamSessionEntity, (session) => session.exams, {
        nullable: false,
        eager: true,
        onDelete: 'RESTRICT',
    })
    examSession: ExamSessionEntity;

    @ManyToOne(() => TeacherEntity, (teacher) => teacher.exams, {
        nullable: false,
        eager: true,
        onDelete: 'RESTRICT',
    })
    teacher: TeacherEntity;
}
