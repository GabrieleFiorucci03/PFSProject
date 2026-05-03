import { Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity }  from '@server/users';
import type { SubjectEntity } from '../subjects/subject.entity';
import type { ExamEntity } from '../exams/exam.entity';


@Entity('teachers')
export class TeacherEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => UserEntity, {eager: true, nullable: false, onDelete: 'CASCADE'})
    @JoinColumn()
    user: UserEntity;

    @OneToMany('SubjectEntity', (subject: SubjectEntity) => subject.teacher)
    subjects: SubjectEntity[];

    @OneToMany('ExamEntity', (exam: ExamEntity) => exam.teacher)
    exams: ExamEntity[];
}
