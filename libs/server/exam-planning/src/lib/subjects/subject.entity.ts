import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { DegreeCourseEntity } from '../degree-courses/degree-course.entity';
import { TeacherEntity } from '../teachers/teacher.entity';
import type { ExamEntity } from '../exams/exam.entity';

@Entity('subjects')
@Unique(['name', 'year', 'degreeCourse'])
export class SubjectEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: 'varchar', length: 255, nullable: false})
    name: string;

    @Column({type: 'int', nullable: false})
    year: number;

    @Column({type: 'int', nullable: false})
    cfu: number;

    @ManyToOne(() => DegreeCourseEntity, (dc) => dc.subjects, {
        nullable: false,
        eager: true,
        onDelete: 'RESTRICT',
    })
    degreeCourse: DegreeCourseEntity;

    @ManyToOne(() => TeacherEntity, (teacher) => teacher.subjects, {
        nullable: false,
        onDelete: 'RESTRICT',
    })
    teacher: TeacherEntity;

    @OneToMany('ExamEntity', (exam: ExamEntity) => exam.subject)
    exams: ExamEntity[];
}
