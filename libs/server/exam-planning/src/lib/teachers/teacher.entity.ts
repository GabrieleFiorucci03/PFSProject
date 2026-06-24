import { Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity }  from '@server/users';
import type { SubjectEntity } from '../subjects/subject.entity';
import type { ExamEntity } from '../exams/exam.entity';


/**
 * Profilo docente (tabella `teachers`). È legato 1-a-1 a un `UserEntity` (le
 * credenziali e nome/email stanno lì); se l'utente viene eliminato, il profilo
 * cade in cascata. Possiede insegnamenti e appelli.
 */
@Entity('teachers')
export class TeacherEntity {
    @PrimaryGeneratedColumn({ name: 'id' })
    teacherId: number;

    /** Account utente collegato (eager: sempre caricato per avere nome/email/ruolo). */
    @OneToOne(() => UserEntity, {eager: true, nullable: false, onDelete: 'CASCADE'})
    @JoinColumn()
    user: UserEntity;

    /** Insegnamenti di cui il docente è titolare. */
    @OneToMany('SubjectEntity', (subject: SubjectEntity) => subject.teacher)
    subjects: SubjectEntity[];

    /** Appelli pianificati dal docente. */
    @OneToMany('ExamEntity', (exam: ExamEntity) => exam.teacher)
    exams: ExamEntity[];
}
