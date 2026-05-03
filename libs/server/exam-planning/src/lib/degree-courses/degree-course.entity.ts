import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import type { SubjectEntity } from '../subjects/subject.entity';

@Entity('degree_courses')
export class DegreeCourseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: 'varchar', length: 255, nullable: false, unique: true})
    name: string;

    @Column({type: 'int', nullable: false, default: 3})
    yearsDuration: number;

    @Column({type: 'varchar', length: 255, nullable: false})
    department: string;

    @OneToMany('SubjectEntity', (subject: SubjectEntity) => subject.degreeCourse)
    subjects: SubjectEntity[];
}
