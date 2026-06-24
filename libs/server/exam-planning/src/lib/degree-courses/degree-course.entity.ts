import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import type { SubjectEntity } from '../subjects/subject.entity';

/**
 * Entità corso di laurea (tabella `degree_courses`). Ha un nome univoco, una
 * durata in anni (usata per validare l'anno degli insegnamenti) e il dipartimento.
 * È "padre" degli insegnamenti (`subjects`).
 */
@Entity('degree_courses')
export class DegreeCourseEntity {
    /** Chiave primaria (colonna `id`, esposta come `degreeCourseId` nel codice). */
    @PrimaryGeneratedColumn({ name: 'id' })
    degreeCourseId: number;

    /** Nome del corso, univoco sul DB. */
    @Column({type: 'varchar', length: 255, nullable: false, unique: true})
    name: string;

    /** Durata del corso in anni (default 3): limite massimo per l'anno degli insegnamenti. */
    @Column({type: 'int', nullable: false, default: 3})
    yearsDuration: number;

    @Column({type: 'varchar', length: 255, nullable: false})
    department: string;

    /** Insegnamenti appartenenti al corso (relazione inversa). */
    @OneToMany('SubjectEntity', (subject: SubjectEntity) => subject.degreeCourse)
    subjects: SubjectEntity[];
}
